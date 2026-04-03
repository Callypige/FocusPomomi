"use client";

import type { Task } from "@/types";
import TaskItem from "@/components/TaskItem";

interface TaskListProps {
  activeTask: Task | null;
  pendingTasks: Task[];
  completedTasks: Task[];
  nonPomodoroTasks: Task[];
  isTimerDone: boolean;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TaskList({
  activeTask,
  pendingTasks,
  completedTasks,
  nonPomodoroTasks,
  isTimerDone,
  onStart,
  onComplete,
  onFail,
  onRemove,
}: TaskListProps) {
  const hasPomodoro = activeTask || pendingTasks.length > 0 || completedTasks.length > 0;
  const hasNonPomodoro = nonPomodoroTasks.length > 0;

  if (!hasPomodoro && !hasNonPomodoro) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">
        Aucune tâche — créez-en une pour commencer 🍅
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Pomodoro tasks ── */}
      {hasPomodoro && (
        <div className="flex flex-col gap-2">
          {/* Active task */}
          {activeTask && (
            <TaskItem
              task={activeTask}
              isTimerDone={isTimerDone}
              onStart={onStart}
              onComplete={onComplete}
              onFail={onFail}
              onRemove={onRemove}
            />
          )}

          {/* Pending pomodoro tasks */}
          {pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isTimerDone={false}
              onStart={onStart}
              onComplete={onComplete}
              onFail={onFail}
              onRemove={onRemove}
            />
          ))}

          {/* Completed / failed tasks */}
          {completedTasks.length > 0 && (
            <>
              <p className="text-xs text-gray-600 mt-2 mb-1">Terminées</p>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isTimerDone={false}
                  onStart={onStart}
                  onComplete={onComplete}
                  onFail={onFail}
                  onRemove={onRemove}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Non-pomodoro reminder tasks ── */}
      {hasNonPomodoro && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-300">📌 À ne pas oublier</span>
            <span className="text-xs text-gray-500">— tâches sans Pomodoro</span>
          </div>
          {nonPomodoroTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isTimerDone={false}
              onStart={onStart}
              onComplete={onComplete}
              onFail={onFail}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
