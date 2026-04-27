import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialMs, onExpire) {
  const [remainingMs, setRemainingMs] = useState(initialMs);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingMs(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setTimeout(() => onExpireRef.current?.(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const percentage = initialMs > 0 ? ((initialMs - remainingMs) / initialMs) * 100 : 0;

  return {
    remainingMs,
    formatted,
    percentage,
    isRunning,
    start,
    stop,
    minutes,
    seconds
  };
}
