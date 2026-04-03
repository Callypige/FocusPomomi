"use client";

import { useCallback, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { usePomodoro } from "@/hooks/usePomodoro";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import PomodoroTimer from "@/components/PomodoroTimer";
import CalendarView from "@/components/CalendarView";

type Tab = "tasks" | "calendar";

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");

  // Tasks state + actions
  const {
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
  } = useTasks();

  // Callback to trigger when a pomodoro session completes (either focus or break)
  const handleSessionComplete = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
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
    stop: stopTimer,
  } = usePomodoro(handleSessionComplete);

  const isTimerDone = !isRunning && minutes === 0 && seconds === 0;

  const handleAddTask = useCallback(
    async (title: string, durationMinutes?: number) => {
      const id = await addTask(title, durationMinutes);
      // Only start the timer for Pomodoro tasks
      if (durationMinutes !== undefined) {
        startTask(id);
        startFocusSession(durationMinutes);
      }
    },
    [addTask, startTask, startFocusSession]
  );

  // Switch active task + restart timer with its duration
  const handleStartTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.durationMinutes === undefined) return;
      startTask(id);
      startFocusSession(task.durationMinutes);
    },
    [tasks, startTask, startFocusSession]
  );

  // Mark task done + stop timer if it was the active one
  const handleCompleteTask = useCallback(
    (id: string) => {
      completeTask(id);
      if (activeTask?.id === id) stopTimer();
    },
    [completeTask, activeTask, stopTimer]
  );

  // Mark task failed + stop timer if it was the active one
  const handleFailTask = useCallback(
    (id: string) => {
      failTask(id);
      if (activeTask?.id === id) stopTimer();
    },
    [activeTask?.id, failTask, stopTimer]
  );

  // Remove task + stop timer if it was the active one
  const handleRemoveTask = useCallback(
    (id: string) => {
      removeTask(id);
      if (activeTask?.id === id) stopTimer();
    },
    [removeTask, activeTask, stopTimer]
  );

  return (
    <main className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            🍅{" "}
            <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              FocusPomomi
            </span>
          </h1>
          <p className="mt-2 text-sm text-(--muted)">
            Restez concentré, complétez vos tâches, récoltez vos fruits 🍎
          </p>
        </header>

        {/* Tab navigation */}
        <div className="flex gap-2 self-center rounded-2xl border border-(--border) bg-(--surface) p-1">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? "bg-linear-to-r from-red-500/30 to-orange-500/30 text-orange-200 border border-orange-400/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            🍅 Tâches
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
              activeTab === "calendar"
                ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📅 Calendrier
          </button>
        </div>

        {activeTab === "tasks" ? (
          /*
            Two-column layout: tasks (left, wider) + pomodoro (right, narrower)
            On mobile: single column, tasks on top, pomodoro below
          */
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* LEFT - tasks panel (primary) */}
            <section className="flex flex-col gap-4 rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur lg:flex-[1.4]">
              <div>
                <h2 className="text-xl font-semibold text-(--foreground)">Tâches</h2>
                <p className="text-sm text-(--muted)">
                  Démarrer une tâche Pomodoro lance automatiquement le timer.
                </p>
              </div>
              <TaskForm onAdd={handleAddTask} />
              <hr className="border-(--border)" />
              <div className="overflow-y-auto">
                <TaskList
                  activeTask={activeTask}
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                  nonPomodoroTasks={nonPomodoroTasks}
                  isTimerDone={isTimerDone}
                  onStart={handleStartTask}
                  onComplete={handleCompleteTask}
                  onFail={handleFailTask}
                  onRemove={handleRemoveTask}
                />
              </div>
            </section>

            {/* RIGHT - pomodoro panel (secondary) */}
            <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur lg:flex-1">
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
        ) : (
          /* Calendar view */
          <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-(--foreground)">Calendrier des tâches</h2>
              <p className="text-sm text-(--muted)">
                Visualisez vos tâches par jour. Cliquez sur une date pour voir le détail.
              </p>
            </div>
            <CalendarView tasks={tasks} />
          </section>
        )}

        <footer className="pb-4 text-center text-xs text-gray-600">
          FocusPomomi - Technique Pomodoro &amp; Gestion de tâches
          <p>Copyright : So&#39; Nourry Payn</p>
          <p>All rights reserved.</p>
          <a href="https://sonourrypayn.dev" className="text-gray-400 transition-colors hover:text-gray-300">
            Website Link: https://sonourrypayn.dev
          </a>
          <p>
            Clock icon by{" "}
            <a
              href="https://icons8.com/icons/set/clock--static--purple"
              className="text-gray-400 transition-colors hover:text-gray-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Icons8
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
