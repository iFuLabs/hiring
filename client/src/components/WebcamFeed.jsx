import { useCallback } from "react";

export default function WebcamFeed({ streamRef, isActive }) {
  if (!isActive) return null;

  // Callback ref: assigns the stream as soon as the <video> element mounts
  const setVideoRef = useCallback(
    (video) => {
      if (video && streamRef.current) {
        video.srcObject = streamRef.current;
      }
    },
    [streamRef]
  );

  return (
    <div className="webcam-container" aria-label="Webcam monitoring feed">
      <div className="webcam-indicator" />
      <video ref={setVideoRef} autoPlay playsInline muted />
    </div>
  );
}
