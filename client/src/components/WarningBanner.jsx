export default function WarningBanner({ show, tabSwitchCount, onDismiss }) {
  if (!show) return null;

  return (
    <div className="warning-banner" role="alert" onClick={onDismiss}>
      ⚠️ Tab switch detected! Please stay on this page during the assessment.
      ({tabSwitchCount} switch{tabSwitchCount !== 1 ? "es" : ""} logged)
    </div>
  );
}
