"use client";

import type { Task } from "@/types";
import TaskItem from "@/components/TaskItem";

interface TaskListProps {
  activeTask: Task | null;
  pendingTasks: Task[];
  completedTasks: Task[];
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
  isTimerDone,
  onStart,
  onComplete,
  onFail,
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

      {/* Active task — shown first, timer controls unlocked when isTimerDone */}
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

      {/* Pending tasks — timer always false, cannot be completed yet */}
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

      {/* Completed and failed tasks — dimmed at the bottom */}
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
  );
}