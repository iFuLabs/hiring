export default function TimerBar({
  formatted,
  percentage,
  remainingMs,
  answeredCount,
  totalQuestions,
}) {
  const timerClass =
    remainingMs < 60000
      ? "timer-display danger"
      : remainingMs < 300000
        ? "timer-display warning"
        : "timer-display";

  return (
    <div className="timer-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span role="img" aria-label="clock">
          ⏱️
        </span>
        <span className={timerClass}>{formatted}</span>
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
        {answeredCount}/{totalQuestions} answered
      </div>
      <div className="timer-progress" style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: 0 }}>
        <div
          className="timer-progress-fill"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
