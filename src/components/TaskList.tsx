"use client";

import type { Task } from "@/types";

interface TaskListProps {
  activeTask: Task | null;
  pendingTasks: Task[];
  completedTasks: Task[];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TaskList({
  activeTask,
  pendingTasks,
  completedTasks,
  onStart,
  onComplete,
  onRemove,
}: TaskListProps) {
  if (!activeTask && pendingTasks.length === 0 && completedTasks.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">
        Aucune tâche — créez-en une pour commencer 🍅
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">

      {/* Active task — shown first, highlighted */}
      {activeTask && (
        <TaskItem
          task={activeTask}
          isActive
          onComplete={onComplete}
          onRemove={onRemove}
        />
      )}

      {/* Pending tasks */}
      {pendingTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStart={onStart}
          onComplete={onComplete}
          onRemove={onRemove}
        />
      ))}

      {/* Completed tasks — dimmed at the bottom */}
      {completedTasks.length > 0 && (
        <>
          <p className="text-xs text-gray-600 mt-2 mb-1">Terminées</p>
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isDone
              onRemove={onRemove}
            />
          ))}
        </>
      )}

    </div>
  );
}

// Single task row
function TaskItem({
  task,
  isActive = false,
  isDone = false,
  onStart,
  onComplete,
  onRemove,
}: {
  task: Task;
  isActive?: boolean;
  isDone?: boolean;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all ${
        isActive
          ? "border-orange-500/40 bg-orange-500/10"
          : isDone
          ? "border-white/5 bg-white/5 opacity-50"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Status dot */}
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${
          isActive ? "bg-orange-400" : isDone ? "bg-green-500" : "bg-gray-600"
        }`}
      />

      {/* Task title */}
      <span className={`flex-1 ${isDone ? "line-through text-gray-500" : "text-white"}`}>
        {task.title}
      </span>

      {/* Duration */}
      <span className="shrink-0 text-xs text-gray-500">{task.durationMinutes}min</span>

      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        {!isDone && !isActive && onStart && (
          <button
            onClick={() => onStart(task.id)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-400 hover:bg-white/10"
          >
            Lancer
          </button>
        )}
        {!isDone && onComplete && (
          <button
            onClick={() => onComplete(task.id)}
            className="rounded-lg border border-green-500/30 px-2 py-1 text-xs text-green-400 hover:bg-green-500/10"
          >
            Fait
          </button>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(task.id)}
            className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}