import { useState } from "react";

export default function ConsentScreen({ onAccept, onDecline, isLoading }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="card consent-screen">
      <div className="icon">📷</div>
      <h2>Camera Monitoring Consent</h2>
      <p style={{ color: "var(--text-light)", marginTop: 8 }}>
        This assessment uses camera monitoring to ensure test integrity.
      </p>

      <ul className="consent-list">
        <li>Your webcam will display a live feed during the test</li>
        <li>No video or images will be recorded or stored</li>
        <li>Camera access is used solely for proctoring purposes</li>
        <li>You can proceed without camera, but it will be flagged</li>
        <li>Tab switching will be monitored and logged</li>
      </ul>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          margin: "20px 0 0",
          cursor: "pointer",
          fontSize: "0.95rem",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
        I understand and agree to the monitoring terms
      </label>

      <div className="consent-actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={onAccept}
          disabled={!agreed || isLoading}
        >
          {isLoading ? "Starting Camera..." : "Allow Camera & Start Test"}
        </button>
        <button
          className="btn btn-outline"
          onClick={onDecline}
          disabled={isLoading}
        >
          Continue Without Camera
        </button>
      </div>
    </div>
  );
}
