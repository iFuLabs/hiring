export default function ResultsScreen() {
  return (
    <div className="card results-container">
      <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
      <h2 style={{ marginBottom: 8 }}>Assessment Submitted</h2>
      <p style={{ color: "var(--text-light)", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
        Thank you for completing the iFu Labs Cloud Engineer Assessment.
        Your responses have been recorded and sent to our hiring team for review.
      </p>

      <div
        style={{
          marginTop: 32,
          padding: 20,
          background: "var(--bg)",
          borderRadius: 8,
          fontSize: "0.9rem",
          color: "var(--text-light)",
          textAlign: "left",
          maxWidth: 460,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
          What happens next?
        </p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, margin: 0 }}>
          <li>Our team will review your assessment</li>
          <li>You will receive your results via email</li>
          <li>Shortlisted candidates will be contacted within 5 business days</li>
        </ul>
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: "0.85rem",
          color: "var(--text-light)",
        }}
      >
        Do not retake this assessment unless instructed by the hiring team.
      </p>

      <button
        className="btn btn-primary btn-block btn-lg"
        style={{ marginTop: 24 }}
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          window.close();
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
