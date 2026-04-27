import { useState, useEffect, useRef, useCallback } from "react";

export function useAntiCheat(isActive) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimeoutRef = useRef(null);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 5000);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExits(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isActive]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  return {
    tabSwitchCount,
    fullscreenExits,
    showWarning,
    dismissWarning,
    requestFullscreen
  };
}
