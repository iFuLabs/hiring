export default function ResultsScreen({ result, timing }) {
  if (!result) return null;

  const { score, totalQuestions, percentage, band } = result;
  const { timeTakenSeconds, timedOut } = timing;

  const bandClass =
    band === "Strong"
      ? "strong"
      : band.includes("Average") || band.includes("متوسط")
        ? "average"
        : "weak";

  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="card results-container">
      <h2 style={{ marginBottom: 4 }}>Assessment Complete</h2>
      <p style={{ color: "var(--text-light)" }}>
        Thank you for completing the iFu Labs Cloud Engineer Assessment.
      </p>

      <div className={`score-circle ${bandClass}`}>
        <div className="score-value">
          {score}/{totalQuestions}
        </div>
        <div className="score-percentage">{percentage}%</div>
      </div>

      <div className="score-band">
        {band === "Strong" && "🟢 "}
        {(band.includes("Average") || band.includes("متوسط")) && "🟡 "}
        {(band.includes("Weak") || band.includes("ضعيف")) && "🔴 "}
        {band}
      </div>

      <div className="result-details">
        <div className="result-detail-card">
          <div className="label">Time Taken</div>
          <div className="value">{timeFormatted}</div>
        </div>
        <div className="result-detail-card">
          <div className="label">Status</div>
          <div className="value">{timedOut ? "⏰ Timed Out" : "✅ Submitted"}</div>
        </div>
        <div className="result-detail-card">
          <div className="label">Correct Answers</div>
          <div className="value">
            {score} out of {totalQuestions}
          </div>
        </div>
        <div className="result-detail-card">
          <div className="label">Performance</div>
          <div className="value">{band}</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 20,
          background: "var(--bg)",
          borderRadius: 8,
          fontSize: "0.9rem",
          color: "var(--text-light)",
        }}
      >
        <p>
          Your results have been sent to the iFu Labs hiring team. You will be
          contacted if you advance to the next stage.
        </p>
        <p style={{ marginTop: 8 }}>
          <strong>Note:</strong> Do not retake this assessment unless instructed
          by the hiring team.
        </p>
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        style={{ marginTop: 24 }}
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          window.close();
          // If window.close() doesn't work (not opened by script), redirect
          setTimeout(() => {
            window.location.href = "https://ifulabs.com";
          }, 300);
        }}
      >
        Close Assessment
      </button>
    </div>
  );
}
