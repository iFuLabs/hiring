import { useState, useCallback, useRef } from "react";
import Header from "./components/Header.jsx";
import RegistrationForm from "./components/RegistrationForm.jsx";
import ConsentScreen from "./components/ConsentScreen.jsx";
import TimerBar from "./components/TimerBar.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import QuestionView from "./components/QuestionView.jsx";
import WebcamFeed from "./components/WebcamFeed.jsx";
import WarningBanner from "./components/WarningBanner.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import { useTimer } from "./hooks/useTimer.js";
import { useWebcam } from "./hooks/useWebcam.js";
import { useAntiCheat } from "./hooks/useAntiCheat.js";
import { startAssessment, submitAssessment } from "./api.js";
import "./App.css";

/*
  App Phases:
  1. "register"  – Candidate fills in name/email/phone
  2. "consent"   – Camera consent screen
  3. "test"      – Active test with timer, questions, webcam
  4. "submitting" – Submission in progress
  5. "results"   – Score displayed
*/

export default function App() {
  const [phase, setPhase] = useState("register");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Session data from backend
  const [sessionToken, setSessionToken] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [initialTimeMs, setInitialTimeMs] = useState(30 * 60 * 1000);

  // Candidate info
  const [candidate, setCandidate] = useState(null);

  // Test state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const submittedRef = useRef(false);

  // Hooks
  const webcam = useWebcam();
  const antiCheat = useAntiCheat(phase === "test");

  const handleAutoSubmit = useCallback(() => {
    if (!submittedRef.current) {
      doSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timer = useTimer(initialTimeMs, handleAutoSubmit);

  // ─── Phase 1: Registration ───
  async function handleRegister(form) {
    setIsLoading(true);
    setError(null);
    try {
      const data = await startAssessment(form);
      setSessionToken(data.sessionToken);
      setQuestions(data.questions);
      setInitialTimeMs(data.remainingTimeMs);
      setCandidate(form);
      setPhase("consent");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Phase 2: Consent ───
  async function handleConsentAccept() {
    setIsLoading(true);
    const success = await webcam.startCamera();
    setIsLoading(false);
    if (success) {
      startTest();
    } else {
      // Camera failed but still allow test
      startTest();
    }
  }

  function handleConsentDecline() {
    startTest();
  }

  function startTest() {
    setPhase("test");
    timer.start();
    antiCheat.requestFullscreen();
  }

  // ─── Phase 3: Test ───
  function handleSelectAnswer(questionId, letter) {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
  }

  function handleJump(index) {
    setCurrentIndex(index);
  }

  function handleSubmitClick() {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }
    doSubmit(false);
  }

  // ─── Phase 4: Submit ───
  const [result, setResult] = useState(null);
  const [timing, setTiming] = useState(null);

  async function doSubmit(timedOut) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    timer.stop();
    setPhase("submitting");
    setError(null);

    try {
      const monitoring = {
        cameraAllowed: webcam.isActive,
        tabSwitchCount: antiCheat.tabSwitchCount,
        fullscreenExits: antiCheat.fullscreenExits,
      };

      const data = await submitAssessment(sessionToken, answers, monitoring);

      setResult(data.result);
      setTiming({ ...data.timing, timedOut });

      webcam.stopCamera();
      setPhase("results");
    } catch (err) {
      setError(err.message);
      setPhase("test");
      submittedRef.current = false;
    }
  }

  // Start timer when entering test phase (handles resumed sessions)
  // We use a ref to track if timer was started
  const timerStartedRef = useRef(false);
  if (phase === "test" && !timer.isRunning && !timerStartedRef.current && !submittedRef.current) {
    timerStartedRef.current = true;
    timer.start();
  }

  // ─── Render ───
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="app-container">
      <Header />

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* Phase: Register */}
      {phase === "register" && (
        <RegistrationForm onSubmit={handleRegister} isLoading={isLoading} />
      )}

      {/* Phase: Consent */}
      {phase === "consent" && (
        <ConsentScreen
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
          isLoading={isLoading}
        />
      )}

      {/* Phase: Test */}
      {phase === "test" && (
        <>
          <WarningBanner
            show={antiCheat.showWarning}
            tabSwitchCount={antiCheat.tabSwitchCount}
            onDismiss={antiCheat.dismissWarning}
          />

          <TimerBar
            formatted={timer.formatted}
            percentage={timer.percentage}
            remainingMs={timer.remainingMs}
            answeredCount={answeredCount}
            totalQuestions={questions.length}
          />

          <ProgressBar
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            questions={questions}
            onJump={handleJump}
          />

          <QuestionView
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={currentQuestion ? answers[currentQuestion.id] : null}
            onSelectAnswer={handleSelectAnswer}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmitClick}
            answeredCount={answeredCount}
          />

          <WebcamFeed streamRef={webcam.streamRef} isActive={webcam.isActive} />
        </>
      )}

      {/* Phase: Submitting */}
      {phase === "submitting" && (
        <div className="card loading-spinner">
          <div className="spinner" />
          <p>Submitting your assessment...</p>
        </div>
      )}

      {/* Phase: Results */}
      {phase === "results" && (
        <ResultsScreen result={result} timing={timing} />
      )}
    </div>
  );
}
