import { useState, useRef, useCallback } from "react";

export function useWebcam() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      setIsActive(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || "Camera access denied");
      setIsActive(false);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  return {
    isActive,
    error,
    streamRef,
    startCamera,
    stopCamera
  };
}
