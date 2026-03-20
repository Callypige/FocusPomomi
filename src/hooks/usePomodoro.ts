"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PomodoroMode } from "@/types";

const BREAK_DURATIONS: Record<"short_break" | "long_break", number> = {
  short_break: 5,
  long_break: 15,
};

export function usePomodoro(onComplete?: () => void) {
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) { clearTimer(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          if (mode === "focus") {
            setSessionsCompleted((s) => s + 1);
            onCompleteRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [isRunning, mode, clearTimer]);

  const startFocusSession = useCallback((minutes: number) => {
    clearTimer();
    const secs = Math.max(1, Math.min(120, minutes)) * 60;
    setMode("focus");
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(true);
  }, [clearTimer]);

  const startBreak = useCallback((breakMode: "short_break" | "long_break") => {
    clearTimer();
    const secs = BREAK_DURATIONS[breakMode] * 60;
    setMode(breakMode);
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(true);
  }, [clearTimer]);

  const pause = useCallback(() => setIsRunning(false), []);

  const resume = useCallback(() => setIsRunning(true), []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  }, [clearTimer, totalSeconds]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(25 * 60);
    setTotalSeconds(25 * 60);
  }, [clearTimer]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return {
    mode,
    minutes,
    seconds,
    isRunning,
    sessionsCompleted,
    progress,
    startFocusSession,
    startBreak,
    pause,
    resume,
    reset,
    stop,
  };
}