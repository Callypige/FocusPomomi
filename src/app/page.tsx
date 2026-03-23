 
"use client";

import { useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { usePomodoro } from "@/hooks/usePomodoro";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import PomodoroTimer from "@/components/PomodoroTimer";


export default function Home() {
  // Tasks state + actions
  const {
    tasks,
    activeTask,
    pendingTasks,
    completedTasks,
    addTask,
    startTask,
    completeTask,
    failTask,
    removeTask,
  } = useTasks();
  
  // Callback to trigger when a pomodoro session completes (either focus or break)
  const handleSessionComplete = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    // Request permission if not already granted
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("🍅 Session terminée !", {
          body: activeTask ? `Bravo pour "${activeTask.title}" !` : "C'est l'heure de la pause !",
        });
      }
    });
  }, [activeTask]);

  // Pomodoro timer state + actions
  const {
    mode,
    minutes,
    seconds,
    isRunning,
    progress,
    sessionsCompleted,
    startFocusSession,
    startBreak,
    pause,
    resume,
    reset,
    stop,
  } = usePomodoro(handleSessionComplete);

  // Helper to know if the timer just completed 
  // (used to show "Mark as done" button on tasks)
  const isTimerDone = !isRunning && minutes === 0 && seconds === 0;

  // Create task + immediately start it + start the timer
  const handleAddTask = useCallback(
  async (title: string, durationMinutes: number) => {
    const id = await addTask(title, durationMinutes); 
    startTask(id);
    startFocusSession(durationMinutes);
  },
  [addTask, startTask, startFocusSession]
  );

  // Switch active task + restart timer with its duration
  const handleStartTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      startTask(id);
      startFocusSession(task.durationMinutes);
    },
    [tasks, startTask, startFocusSession]
  );

  // Mark task done + stop timer if it was the active one
  const handleCompleteTask = useCallback(
    (id: string) => {
      completeTask(id);
      if (activeTask?.id === id) stop();
    },
    [completeTask, activeTask, stop]
  );

  // Mark task failed + stop timer if it was the active one
  const handleFailTask = useCallback(
    (id: string) => {
      failTask(id);
      if (activeTask?.id === id) stop();
    },
    [activeTask?.id, failTask, stop]
  );

  // Remove task + stop timer if it was the active one
  const handleRemoveTask = useCallback(
    (id: string) => {
      removeTask(id);
      if (activeTask?.id === id) stop();
    },
    [removeTask, activeTask, stop]
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">

        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            🍅{" "}
            <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              FocusPomomi
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Restez concentré, complétez vos tâches, récoltez vos fruits 🍎
          </p>
        </header>

        {/*
          Two-column layout: tasks (left, wider) + pomodoro (right, narrower)
          On mobile: single column, tasks on top, pomodoro below
        */}
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* LEFT — tasks panel (primary) */}
          <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:flex-[1.4]">
            <div>
              <h2 className="text-xl font-semibold text-white">Tâches</h2>
              <p className="text-sm text-gray-400">
                Démarrer une tâche lance automatiquement le pomodoro.
              </p>
            </div>
            <TaskForm onAdd={handleAddTask} />
            <hr className="border-white/10" />
            <div className="overflow-y-auto">
              <TaskList
                activeTask={activeTask}
                pendingTasks={pendingTasks}
                completedTasks={completedTasks}
                isTimerDone={isTimerDone}
                onStart={handleStartTask}
                onComplete={handleCompleteTask}
                onFail={handleFailTask}
                onRemove={handleRemoveTask}
              />
            </div>
          </section>

          {/* RIGHT — pomodoro panel (secondary) */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:flex-1">
            <PomodoroTimer
              mode={mode}
              minutes={minutes}
              seconds={seconds}
              isRunning={isRunning}
              progress={progress}
              sessionsCompleted={sessionsCompleted}
              activeTaskTitle={activeTask?.title}
              onPause={pause}
              onResume={resume}
              onReset={reset}
              onStartBreak={startBreak}
              onStartWithoutTask={() => startFocusSession(25)}
            />
          </section>

        </div>

        <footer className="pb-4 text-center text-xs text-gray-600">
          FocusPomomi — Technique Pomodoro &amp; Gestion de tâches
          <p>Copyright : So&#39; Nourry Payn</p>
          <p>All rights reserved.</p>
          <a href="https://sonourrypayn.dev" className="text-gray-400 hover:text-gray-300 transition-colors">
            Website Link: https://sonourrypayn.dev
          </a>
        </footer>

      </div>
    </main>
  );
}