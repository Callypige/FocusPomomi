"use client";

import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  isTimerDone?: boolean; // controls visibility of "Réussie" button on active task
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onRemove: (id: string) => void;
}

const STATUS_BADGE: Record<Task["status"], string> = {
  pending: "bg-gray-500/30 text-gray-300",
  in_progress: "bg-yellow-500/30 text-yellow-300",
  completed: "bg-green-500/30 text-green-300",
  failed: "bg-red-500/30 text-red-300",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Réussie ✓",
  failed: "Échouée",
};

export default function TaskItem({
  task,
  isTimerDone = false,
  onStart,
  onComplete,
  onFail,
  onRemove,
}: TaskItemProps) {
  const isFinished = task.status === "completed" || task.status === "failed";
  const isCurrentTask = task.status === "in_progress";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        task.status === "completed"
          ? "border-green-500/30 bg-green-500/5"
          : task.status === "failed"
          ? "border-red-500/30 bg-red-500/5 opacity-60"
          : task.status === "in_progress"
          ? "border-yellow-500/40 bg-yellow-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Fruit reward shown once task is completed */}
      {task.fruit ? (
        <span className="text-2xl animate-bounce" title="Bravo !">
          {task.fruit}
        </span>
      ) : (
        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-500">
          {task.durationMinutes}m
        </span>
      )}

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${task.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
          {isCurrentTask && (
            <span className="text-xs text-amber-300">
              {isTimerDone ? "⏱ Timer terminé !" : "Pomodoro lié"}
            </span>
          )}
          {/* Display planned duration for quick scan */}
          <span className="text-xs text-gray-400">{task.durationMinutes} min</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {task.status === "pending" && (
          <button
            type="button"
            onClick={() => onStart(task.id)}
            className="px-2 py-1 text-xs rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
          >
            ▶ Lancer
          </button>
        )}
        {task.status === "in_progress" && (
          <>
            {/* "Réussie" only unlocked when timer has reached zero */}
            <button
              type="button"
              onClick={() => onComplete(task.id)}
              disabled={!isTimerDone}
              className="px-2 py-1 text-xs rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ✓ Réussie
            </button>
            <button
              type="button"
              onClick={() => onFail(task.id)}
              className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              ✗ Échouer
            </button>
          </>
        )}
        {isFinished && (
          <button
            type="button"
            onClick={() => onRemove(task.id)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}