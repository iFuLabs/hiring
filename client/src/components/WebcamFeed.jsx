import { useCallback } from "react";

export default function WebcamFeed({ streamRef, videoElRef, isActive }) {
  if (!isActive) return null;

  const setVideoRef = useCallback(
    (video) => {
      if (video && streamRef.current) {
        video.srcObject = streamRef.current;
      }
      // Store reference for screenshot capture
      if (videoElRef) {
        videoElRef.current = video;
      }
    },
    [streamRef, videoElRef]
  );

  return (
    <div className="webcam-container" aria-label="Webcam monitoring feed">
      <div className="webcam-indicator" />
      <video ref={setVideoRef} autoPlay playsInline muted />
    </div>
  );
}
