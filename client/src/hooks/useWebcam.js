import { useState, useRef, useCallback } from "react";

export function useWebcam() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const videoElRef = useRef(null);

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

  /** Capture a single frame from the webcam as a base64 JPEG */
  const captureScreenshot = useCallback(() => {
    const video = videoElRef.current;
    if (!video || !streamRef.current) return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch {
      return null;
    }
  }, []);

  return {
    isActive,
    error,
    streamRef,
    videoElRef,
    startCamera,
    stopCamera,
    captureScreenshot
  };
}
