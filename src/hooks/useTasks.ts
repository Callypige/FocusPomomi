"use client";

import { useState, useCallback } from "react";
import type { Task, TaskStatus } from "@/types";

const TASK_STATUS: {
  PENDING: TaskStatus;
  IN_PROGRESS: TaskStatus;
  COMPLETED: TaskStatus;
  FAILED: TaskStatus;
} = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((title: string, durationMinutes: number): string => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      durationMinutes,
      status: TASK_STATUS.PENDING,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask.id;
  }, []);

  const startTask = useCallback((id: string) => {
  setTasks((prev) =>
    prev.map((task) => {
      if (task.status === TASK_STATUS.COMPLETED) return task;

      const newStatus = task.id === id
        ? TASK_STATUS.IN_PROGRESS
        : task.status === TASK_STATUS.IN_PROGRESS
          ? TASK_STATUS.PENDING
          : task.status;

      return { ...task, status: newStatus };
    })
  );
}, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: TASK_STATUS.COMPLETED, completedAt: new Date() }
          : task
      )
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeTask = tasks.find((t) => t.status === TASK_STATUS.IN_PROGRESS) ?? null;
  const pendingTasks = tasks.filter((t) => t.status === TASK_STATUS.PENDING);
  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);
  const failedTasks = tasks.filter((t) => t.status === TASK_STATUS.FAILED);

  return {
    tasks,
    activeTask,
    pendingTasks,
    completedTasks,
    failedTasks,
    addTask,
    startTask,
    completeTask,
    removeTask,
  };
}