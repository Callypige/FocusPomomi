"use client";

import type { PomodoroMode } from "@/types";

interface PomodoroTimerProps {
  mode: PomodoroMode;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  progress: number;
  sessionsCompleted: number;
  activeTaskTitle?: string | null;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartBreak: (mode: "short_break" | "long_break") => void;
  onStartWithoutTask: () => void;
}

const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: "🎯 Focus",
  short_break: "☕ Pause courte",
  long_break: "🌿 Pause longue",
};

const RING_COLOR: Record<PomodoroMode, string> = {
  focus: "stroke-orange-500",
  short_break: "stroke-green-500",
  long_break: "stroke-blue-500",
};

export default function PomodoroTimer({
  mode,
  minutes,
  seconds,
  isRunning,
  progress,
  sessionsCompleted,
  activeTaskTitle,
  onPause,
  onResume,
  onReset,
  onStartBreak,
  onStartWithoutTask,
}: PomodoroTimerProps) {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const pad = (n: number) => String(n).padStart(2, "0");

  // Timer can be resumed if: already running, a task is active, or we're in a break
  const canResume = isRunning || !!activeTaskTitle || mode !== "focus";

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Active task or current mode label */}
      <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-widest text-gray-500">Session en cours</p>
        <p className="mt-1 font-semibold text-white">
          {mode !== "focus"
            ? MODE_LABELS[mode]
            : activeTaskTitle ?? "Aucune tâche sélectionnée"}
        </p>
      </div>

      {/* Circular progress timer */}
      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle
            cx="110" cy="110" r={radius}
            fill="none" stroke="currentColor" strokeWidth="8"
            className="text-white/10"
          />
          <circle
            cx="110" cy="110" r={radius}
            fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${RING_COLOR[mode]} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold tabular-nums">
            {pad(minutes)}:{pad(seconds)}
          </span>
          <span className="mt-1 text-sm text-gray-400">{MODE_LABELS[mode]}</span>
        </div>
      </div>

      {/* Play / pause / reset controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          title="Reset timer"
          className="rounded-full bg-white/10 p-3 text-lg hover:bg-white/20 transition-colors"
        >
          🔄
        </button>
        <button
          onClick={isRunning ? onPause : onResume}
          disabled={!canResume}
          className="rounded-full bg-linear-to-r from-red-500 to-orange-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? "⏸ Pause" : "▶ Reprendre"}
        </button>
        <div className="w-12 rounded-full bg-white/10 p-3 text-center text-lg">
          {sessionsCompleted}🍅
        </div>
      </div>

      {/* Start without task — only shown when idle with no active task */}
      {!activeTaskTitle && !isRunning && mode === "focus" && (
        <button
          onClick={onStartWithoutTask}
          className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-300 transition-colors"
        >
          Démarrer sans tâche (rien ne sera enregistré)
        </button>
      )}

      {/* Break buttons */}
      <div className="flex w-full gap-2">
        <button
          onClick={() => onStartBreak("short_break")}
          className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          ☕ Pause courte
        </button>
        <button
          onClick={() => onStartBreak("long_break")}
          className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          🌿 Pause longue
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Sessions :{" "}
        <span className="font-medium text-gray-300">{sessionsCompleted}</span>
      </p>

    </div>
  );
}