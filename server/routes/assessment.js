const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getClientQuestions, gradeSubmission } = require("../data/questions");
const { sendResultsEmail } = require("../services/emailService");

const TEST_DURATION_MINUTES = 30;
const TEST_DURATION_MS = TEST_DURATION_MINUTES * 60 * 1000;

/**
 * Creates the assessment router with injected models.
 * Models can be Mongoose models or in-memory stubs.
 */
function createAssessmentRouter(Session, Submission) {
  const router = express.Router();

  /**
   * POST /api/assessment/start
   */
  router.post("/start", async (req, res) => {
    try {
      const { fullName, email, phone } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({ error: "Full name and email are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Check if candidate already has an active session
      const existingSession = await Session.findOne({
        "candidate.email": email.toLowerCase(),
        isCompleted: false,
        expiresAt: { $gt: new Date() }
      });

      if (existingSession) {
        const questions = getClientQuestions();
        const orderedQuestions = existingSession.questionOrder.map(id =>
          questions.find(q => q.id === id)
        );
        const remainingMs = existingSession.expiresAt.getTime() - Date.now();

        return res.json({
          sessionId: existingSession.sessionId,
          questions: orderedQuestions,
          remainingTimeMs: Math.max(0, remainingMs),
          totalDurationMs: TEST_DURATION_MS,
          resumed: true
        });
      }

      // Create new session with randomized question order
      const questions = getClientQuestions();
      const questionOrder = shuffleArray(questions.map(q => q.id));
      const orderedQuestions = questionOrder.map(id =>
        questions.find(q => q.id === id)
      );

      const sessionId = uuidv4();
      const now = new Date();

      await Session.create({
        sessionId,
        candidate: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || ""
        },
        startedAt: now,
        expiresAt: new Date(now.getTime() + TEST_DURATION_MS),
        questionOrder
      });

      res.json({
        sessionId,
        questions: orderedQuestions,
        remainingTimeMs: TEST_DURATION_MS,
        totalDurationMs: TEST_DURATION_MS,
        resumed: false
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      res.status(500).json({ error: "Failed to start assessment" });
    }
  });

  /**
   * POST /api/assessment/submit
   */
  router.post("/submit", async (req, res) => {
    try {
      const { sessionId, answers, monitoring } = req.body;

      if (!sessionId || !answers) {
        return res.status(400).json({ error: "Session ID and answers are required" });
      }

      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.isCompleted) {
        const existing = await Submission.findOne({ sessionId });
        if (existing) {
          return res.json({
            alreadySubmitted: true,
            result: existing.result,
            timing: existing.timing
          });
        }
        return res.status(400).json({ error: "Session already completed" });
      }

      // Grade
      const result = gradeSubmission(answers);
      const now = new Date();
      const timeTakenSeconds = Math.round((now.getTime() - session.startedAt.getTime()) / 1000);
      const timedOut = now.getTime() > session.expiresAt.getTime();

      // Save submission
      const submission = await Submission.create({
        sessionId,
        candidate: session.candidate,
        answers: new Map(Object.entries(answers).map(([k, v]) => [String(k), v])),
        result: {
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          band: result.band
        },
        timing: {
          startedAt: session.startedAt,
          submittedAt: now,
          timeTakenSeconds
        },
        monitoring: {
          cameraAllowed: monitoring?.cameraAllowed || false,
          tabSwitchCount: monitoring?.tabSwitchCount || 0,
          fullscreenExits: monitoring?.fullscreenExits || 0
        },
        questionOrder: session.questionOrder,
        status: timedOut ? "timed_out" : "submitted"
      });

      // Mark session completed
      session.isCompleted = true;
      await session.save();

      // Send emails (non-blocking)
      sendResultsEmail(submission).catch(err =>
        console.error("Email send failed:", err)
      );

      res.json({
        result: {
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          band: result.band
        },
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

  /**
   * GET /api/assessment/results (admin)
   */
  router.get("/results", async (req, res) => {
    try {
      const { secret } = req.query;
      if (secret !== process.env.API_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const submissions = await Submission.find()
        .sort({ createdAt: -1 })
        .select("-answers")
        .lean();

      res.json({ submissions, total: submissions.length });
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  /**
   * GET /api/assessment/export (admin CSV)
   */
  router.get("/export", async (req, res) => {
    try {
      const { secret } = req.query;
      if (secret !== process.env.API_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const submissions = await Submission.find().sort({ createdAt: -1 }).lean();

      const csvHeader = "Name,Email,Phone,Score,Total,Percentage,Band,Time Taken (s),Camera,Tab Switches,Status,Date\n";
      const csvRows = submissions.map(s =>
        [
          `"${s.candidate.fullName}"`,
          s.candidate.email,
          s.candidate.phone || "",
          s.result.score,
          s.result.totalQuestions,
          `${s.result.percentage}%`,
          `"${s.result.band}"`,
          s.timing.timeTakenSeconds,
          s.monitoring.cameraAllowed ? "Yes" : "No",
          s.monitoring.tabSwitchCount,
          s.status,
          new Date(s.createdAt).toISOString()
        ].join(",")
      ).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=assessment-results.csv");
      res.send(csvHeader + csvRows);
    } catch (error) {
      console.error("Error exporting results:", error);
      res.status(500).json({ error: "Failed to export results" });
    }
  });

  return router;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = createAssessmentRouter;
