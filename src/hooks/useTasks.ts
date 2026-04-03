"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { Task } from "@/types";
import { getRandomFruit } from "@/lib/fruits";

type TaskApiItem = Omit<Task, "id"> & { _id: string };

const api = {
  getTasks: (): Promise<TaskApiItem[]> => fetch("/api/tasks").then((r) => r.json()),
  createTask: (body: { title: string; durationMinutes?: number }) =>
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<TaskApiItem>),
  updateTask: (id: string, body: Partial<Task>) =>
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<TaskApiItem>),
  deleteTask: (id: string) =>
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

function normalizeTask(t: TaskApiItem): Task {
  return {
    ...t,
    id: t._id,
    createdAt: new Date(t.createdAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  };
}

// Guest mode — load and save tasks to localStorage
function loadGuestTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("focuspomomi:guest:tasks");
    if (!saved) return [];
    return JSON.parse(saved).map((t: Task) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveGuestTasks(tasks: Task[]) {
  localStorage.setItem("focuspomomi:guest:tasks", JSON.stringify(tasks));
}

export function useTasks() {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  // Wait for client mount before reading localStorage
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- AUTHENTICATED MODE — fetch from DB ---
  const { data: dbTasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks().then((data) => data.map(normalizeTask)),
    enabled: !!isSignedIn,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // --- GUEST MODE — use localStorage ---
  const { data: guestTasks = [] } = useQuery<Task[]>({
    queryKey: ["guest-tasks"],
    queryFn: () => loadGuestTasks(),
    enabled: isLoaded && !isSignedIn && isMounted,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const tasks = isSignedIn ? dbTasks : guestTasks;

  // --- MUTATIONS ---

  const addMutation = useMutation({
    mutationFn: async (vars: { title: string; durationMinutes?: number }) => {
      if (isSignedIn) {
        return api.createTask(vars).then(normalizeTask);
      }
      // Guest — create locally
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: vars.title,
        durationMinutes: vars.durationMinutes,
        status: "pending",
        createdAt: new Date(),
      };
      return newTask;
    },
    onSuccess: (newTask) => {
      if (isSignedIn) {
        queryClient.setQueryData<Task[]>(["tasks"], (prev = []) => [newTask, ...prev]);
      } else {
        queryClient.setQueryData<Task[]>(["guest-tasks"], (prev = []) => {
          const updated = [newTask, ...prev];
          saveGuestTasks(updated);
          return updated;
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: Partial<Task> & { id: string }) => {
      if (isSignedIn) return api.updateTask(id, body).then(normalizeTask);
      // Guest — return merged task
      const current = guestTasks.find((t) => t.id === id);
      return { ...current, ...body } as Task;
    },
    onSuccess: (updatedTask) => {
      if (isSignedIn) {
        queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      } else {
        queryClient.setQueryData<Task[]>(["guest-tasks"], (prev = []) => {
          const updated = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          saveGuestTasks(updated);
          return updated;
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSignedIn) return api.deleteTask(id);
      return { id };
    },
    onSuccess: (_, id) => {
      if (isSignedIn) {
        queryClient.setQueryData<Task[]>(["tasks"], (prev = []) =>
          prev.filter((t) => t.id !== id)
        );
      } else {
        queryClient.setQueryData<Task[]>(["guest-tasks"], (prev = []) => {
          const updated = prev.filter((t) => t.id !== id);
          saveGuestTasks(updated);
          return updated;
        });
      }
    },
  });

  const addTask = async (title: string, durationMinutes?: number): Promise<string> => {
    const task = await addMutation.mutateAsync({ title, durationMinutes });
    return task.id;
  };

  const startTask = async (id: string) => {
    const queryKey = isSignedIn ? ["tasks"] : ["guest-tasks"];

    // Optimistic update — update both old active task and new one simultaneously
    queryClient.setQueryData<Task[]>(queryKey, (prev = []) =>
      prev.map((t) => {
        if (t.status === "completed" || t.status === "failed") return t;
        if (t.id === id) return { ...t, status: "in_progress" };
        if (t.status === "in_progress") return { ...t, status: "pending" };
        return t;
      })
    );

    if (isSignedIn) {
      try {
        await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        });
      } catch (error) {
        console.error("startTask failed:", error);
      }
    } else {
      const updated = guestTasks.map((t) => {
        if (t.status === "completed" || t.status === "failed") return t;
        if (t.id === id) return { ...t, status: "in_progress" as const };
        if (t.status === "in_progress") return { ...t, status: "pending" as const };
        return t;
      });
      saveGuestTasks(updated);
    }
  };

  const completeTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const fruit = task?.durationMinutes !== undefined ? getRandomFruit() : undefined;
    const completedAt = new Date();
    updateMutation.mutate({ id, status: "completed", fruit, completedAt });
  };

  const failTask = (id: string) => {
    updateMutation.mutate({ id, status: "failed" });
  };

  const removeTask = (id: string) => {
    deleteMutation.mutate(id);
  };

  const activeTask = tasks.find((t) => t.status === "in_progress" && t.durationMinutes !== undefined) ?? null;
  const pendingTasks = tasks.filter((t) => t.status === "pending" && t.durationMinutes !== undefined);
  const completedTasks = tasks.filter(
    (t) => (t.status === "completed" || t.status === "failed") && t.durationMinutes !== undefined
  );
  // Non-pomodoro tasks: pending and completed (no in_progress, no fail)
  const nonPomodoroTasks = tasks.filter((t) => t.durationMinutes === undefined);

  return {
    tasks,
    activeTask,
    pendingTasks,
    completedTasks,
    nonPomodoroTasks,
    addTask,
    startTask,
    completeTask,
    failTask,
    removeTask,
  };
}
