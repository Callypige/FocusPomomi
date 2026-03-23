"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/types";
import { getRandomFruit } from "@/lib/fruits";

type TaskApiItem = Omit<Task, "id"> & { _id: string };

// Raw fetch helpers — keep API logic separate from UI logic
const api = {
  getTasks: (): Promise<TaskApiItem[]> => fetch("/api/tasks").then((r) => r.json()),
  createTask: (body: { title: string; durationMinutes: number }) =>
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  updateTask: (id: string, body: Partial<Task>) =>
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  deleteTask: (id: string) =>
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

// Normalizes task from API — converts _id to id and parses dates
function normalizeTask(t: TaskApiItem): Task {
  return {
    id: t._id,
    title: t.title,
    durationMinutes: t.durationMinutes,
    status: t.status,
    fruit: t.fruit,
    createdAt: new Date(t.createdAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  };
}

export function useTasks() {
  const queryClient = useQueryClient();

  // Fetch all tasks on mount — React Query handles caching and abort
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks().then((data) => data.map(normalizeTask)),
  });

  const addMutation = useMutation({
    mutationFn: (vars: { title: string; durationMinutes: number }) =>
      api.createTask(vars).then(normalizeTask),
    onSuccess: (newTask) => {
      // Prepend new task to cache without refetching
      queryClient.setQueryData<Task[]>(["tasks"], (prev = []) => [newTask, ...prev]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Partial<Task> & { id: string }) =>
      api.updateTask(id, body).then(normalizeTask),
    onSuccess: (updatedTask) => {
      // Replace only the updated task in cache — no refetch to avoid flash
      queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: (_, id) => {
      // Remove deleted task from cache — no refetch
      queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
        prev.filter((t) => t.id !== id)
      );
    },
  });

  const addTask = async (title: string, durationMinutes: number): Promise<string> => {
    const task = await addMutation.mutateAsync({ title, durationMinutes });
    return task.id;
  };

  const startTask = (id: string) => {
    // Optimistic update — update cache immediately, then sync to DB
    queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
      prev.map((t) => {
        if (t.status === "completed" || t.status === "failed") return t;
        if (t.id === id) return { ...t, status: "in_progress" };
        if (t.status === "in_progress") return { ...t, status: "pending" };
        return t;
      })
    );
    updateMutation.mutate({ id, status: "in_progress" });
  };

  const completeTask = (id: string) => {
    const fruit = getRandomFruit();
    const completedAt = new Date();
    // Optimistic update — show fruit immediately before DB confirms
    queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed", fruit, completedAt } : t))
    );
    updateMutation.mutate({ id, status: "completed", fruit, completedAt });
  };

  const failTask = (id: string) => {
    // Optimistic update
    queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
      prev.map((t) => (t.id === id ? { ...t, status: "failed" } : t))
    );
    updateMutation.mutate({ id, status: "failed" });
  };

  const removeTask = (id: string) => {
    // Optimistic update — remove from cache before DB confirms
    queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
      prev.filter((t) => t.id !== id)
    );
    deleteMutation.mutate(id);
  };

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