"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types";
import { getRandomFruit } from "@/lib/fruits";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from DB on mount
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) =>
        setTasks(
          data.map((t: Task & { _id: string }) => ({
            ...t,
            id: t._id,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          }))
        )
      );
  }, []);

  const addTask = useCallback(async (title: string, durationMinutes: number): Promise<string> => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, durationMinutes }),
    });
    const task = await res.json();
    const newTask = { ...task, id: task._id, createdAt: new Date(task.createdAt) };
    setTasks((prev) => [newTask, ...prev]);
    return newTask.id;
  }, []);

  const startTask = useCallback(async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status === "completed" || t.status === "failed") return t;
        if (t.id === id) return { ...t, status: "in_progress" };
        if (t.status === "in_progress") return { ...t, status: "pending" };
        return t;
      })
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    });
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const fruit = getRandomFruit();
    const completedAt = new Date();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed", fruit, completedAt } : t))
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", fruit, completedAt }),
    });
  }, []);

  const failTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "failed" } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "failed" }),
    });
  }, []);

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }, []);

  const activeTask = tasks.find((t) => t.status === "in_progress") ?? null;
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed" || t.status === "failed");

  return {
    tasks,
    activeTask,
    pendingTasks,
    completedTasks,
    addTask,
    startTask,
    completeTask,
    failTask,
    removeTask,
  };
}