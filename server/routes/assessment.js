const express = require("express");
const jwt = require("jsonwebtoken");
const { getClientQuestions, gradeSubmission } = require("../data/questions");
const { sendResultsEmail } = require("../services/emailService");

const router = express.Router();

const TEST_DURATION_MINUTES = 30;
const TEST_DURATION_MS = TEST_DURATION_MINUTES * 60 * 1000;
const JWT_SECRET = process.env.API_SECRET || "ifu-labs-default-secret";

/**
 * POST /api/assessment/start
 * Returns questions + a signed session token (no server-side storage needed)
 */
router.post("/start", (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Randomize question order
    const questions = getClientQuestions();
    const questionOrder = shuffleArray(questions.map(q => q.id));
    const orderedQuestions = questionOrder.map(id =>
      questions.find(q => q.id === id)
    );

    const now = Date.now();

    // Sign a JWT containing session info — this IS the session
    const sessionToken = jwt.sign(
      {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        questionOrder,
        startedAt: now,
        expiresAt: now + TEST_DURATION_MS
      },
      JWT_SECRET,
      { expiresIn: "1h" } // generous expiry for the token itself
    );

    res.json({
      sessionToken,
      questions: orderedQuestions,
      remainingTimeMs: TEST_DURATION_MS,
      totalDurationMs: TEST_DURATION_MS
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    res.status(500).json({ error: "Failed to start assessment" });
  }
});

/**
 * POST /api/assessment/submit
 * Validates the session token, grades answers, sends emails
 */
router.post("/submit", async (req, res) => {
  try {
    const { sessionToken, answers, monitoring } = req.body;

    if (!sessionToken || !answers) {
      return res.status(400).json({ error: "Session token and answers are required" });
    }

    // Verify and decode the session token
    let session;
    try {
      session = jwt.verify(sessionToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired session" });
    }

    // Grade the submission
    const result = gradeSubmission(answers);
    const now = Date.now();
    const timeTakenSeconds = Math.round((now - session.startedAt) / 1000);
    const timedOut = now > session.expiresAt;

    // Build submission object for email
    const submission = {
      candidate: {
        fullName: session.fullName,
        email: session.email,
        phone: session.phone
      },
      result: {
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        band: result.band
      },
      timing: {
        startedAt: new Date(session.startedAt),
        submittedAt: new Date(now),
        timeTakenSeconds
      },
      monitoring: {
        cameraAllowed: monitoring?.cameraAllowed || false,
        tabSwitchCount: monitoring?.tabSwitchCount || 0,
        fullscreenExits: monitoring?.fullscreenExits || 0,
        screenshot: monitoring?.screenshot || null
      },
      status: timedOut ? "timed_out" : "submitted"
    };

    // Send emails — MUST await on serverless (Vercel kills the function after response)
    try {
      await sendResultsEmail(submission);
    } catch (err) {
      console.error("Email send failed:", err);
    }

    res.json({
      submitted: true,
      timing: {
        timeTakenSeconds,
        timedOut
      }
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = router;
