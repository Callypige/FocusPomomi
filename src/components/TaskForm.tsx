"use client";

import { useState } from "react";

interface TaskFormProps {
  onAdd: (title: string, durationMinutes?: number) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(25);
  const [isPomodoro, setIsPomodoro] = useState(true);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, isPomodoro ? duration : undefined);
    setTitle("");
    setDuration(25);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Task type toggle */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setIsPomodoro(true)}
          className={`flex-1 rounded-xl py-1.5 font-medium transition-all ${
            isPomodoro
              ? "bg-linear-to-r from-red-500/30 to-orange-500/30 border border-orange-400/50 text-orange-300"
              : "border border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
          }`}
        >
          🍅 Pomodoro
        </button>
        <button
          type="button"
          onClick={() => setIsPomodoro(false)}
          className={`flex-1 rounded-xl py-1.5 font-medium transition-all ${
            !isPomodoro
              ? "bg-blue-500/20 border border-blue-400/50 text-blue-300"
              : "border border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
          }`}
        >
          📌 À ne pas oublier
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={isPomodoro ? "Nom de la tâche..." : "Ce que vous ne devez pas oublier..."}
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-400"
      />

      {isPomodoro && (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Durée :</span>
          <input
            type="number"
            min={1}
            max={120}
            value={duration}
            onChange={(e) =>
              setDuration(Math.max(1, Math.min(120, Number(e.target.value))))
            }
            className="w-20 rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-white outline-none focus:border-orange-400"
          />
          <span>min</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className={`w-full rounded-xl py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all ${
          isPomodoro
            ? "bg-linear-to-r from-red-500 to-orange-500"
            : "bg-linear-to-r from-blue-600 to-blue-500"
        }`}
      >
        {isPomodoro ? "+ Ajouter et démarrer" : "+ Ajouter le rappel"}
      </button>
    </div>
  );
}
