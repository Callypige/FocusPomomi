"use client";

import { useState } from "react";

interface SimpleTaskFormProps {
  onAdd: (title: string, scheduledDate?: Date) => void;
}

export default function SimpleTaskForm({ onAdd }: SimpleTaskFormProps) {
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const scheduledDate = dateStr ? new Date(dateStr) : undefined;
    onAdd(trimmed, scheduledDate);
    setTitle("");
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
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400"
      />
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span>Date :</span>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-white outline-none focus:border-blue-400"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
      >
        + Ajouter la tâche
      </button>
    </div>
  );
}
