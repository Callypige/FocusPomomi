"use client";

import type { Task } from "@/types";

interface SimpleTaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = ["jan.", "fév.", "mar.", "avr.", "mai", "jun.", "jul.", "août", "sep.", "oct.", "nov.", "déc."];

function formatDate(date: Date): string {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export default function SimpleTaskItem({ task, onComplete, onRemove }: SimpleTaskItemProps) {
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isCompleted
          ? "border-green-500/30 bg-green-500/5 opacity-70"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => !isCompleted && onComplete(task.id)}
        disabled={isCompleted}
        className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
          isCompleted
            ? "border-green-500/50 bg-green-500/20 text-green-400 cursor-default"
            : "border-white/20 hover:border-blue-400 hover:bg-blue-500/10"
        }`}
        title={isCompleted ? "Terminée" : "Marquer comme terminée"}
      >
        {isCompleted && <span className="text-xs">✓</span>}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCompleted ? "line-through text-gray-500" : "text-white"}`}>
          {task.title}
        </p>
        {task.scheduledDate && (
          <p className="text-xs text-gray-400 mt-0.5">📅 {formatDate(task.scheduledDate)}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(task.id)}
        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
        title="Supprimer"
      >
        🗑
      </button>
    </div>
  );
}
