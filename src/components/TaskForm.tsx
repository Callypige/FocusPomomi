"use client";

import { useState } from "react";

interface TaskFormProps {
  onAdd: (title: string, durationMinutes: number, scheduledDate?: Date) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(25);
  const [dateStr, setDateStr] = useState("");

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const scheduledDate = dateStr ? new Date(dateStr) : undefined;
    onAdd(trimmed, duration, scheduledDate);
    setTitle("");
    setDuration(25);
    setDateStr("");
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Nom de la tâche..."
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-400"
      />
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span>Durée :</span>
        <input
          type="number"
          min={1}
          max={120}
          value={duration}
          onChange={(e) => setDuration(Math.max(1, Math.min(120, Number(e.target.value))))}
          className="w-20 rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-white outline-none focus:border-orange-400"
        />
        <span>min</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span>Date :</span>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-white outline-none focus:border-orange-400"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full rounded-xl bg-linear-to-r from-red-500 to-orange-500 py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
      >
        + Ajouter et démarrer
      </button>
    </div>
  );
}