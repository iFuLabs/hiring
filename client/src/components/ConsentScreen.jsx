import { useState } from "react";

export default function ConsentScreen({ onAccept, isLoading, cameraError }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="card consent-screen">
      <div className="icon">📷</div>
      <h2>Camera Monitoring Required</h2>
      <p style={{ color: "var(--text-light)", marginTop: 8 }}>
        This assessment requires camera access to ensure test integrity.
        You cannot proceed without enabling your webcam.
      </p>

      <ul className="consent-list">
        <li>Your webcam will display a live feed during the test</li>
        <li>No video or images will be recorded or stored</li>
        <li>Camera access is used solely for proctoring purposes</li>
        <li>Tab switching will be monitored and logged</li>
      </ul>

      {cameraError && (
        <div className="error-message" style={{ marginTop: 16 }}>
          <strong>Camera access denied.</strong> Please allow camera access in your
          browser settings and try again. The assessment cannot start without a webcam.
        </div>
      )}

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
          className="btn btn-primary btn-lg btn-block"
          onClick={onAccept}
          disabled={!agreed || isLoading}
        >
          {isLoading ? "Starting Camera..." : "Allow Camera & Start Test"}
        </button>
      </div>
    </div>
  );
}
