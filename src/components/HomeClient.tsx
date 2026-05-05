"use client";

import { useCallback, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { usePomodoro } from "@/hooks/usePomodoro";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import PomodoroTimer from "@/components/PomodoroTimer";
import SimpleTaskForm from "@/components/SimpleTaskForm";
import SimpleTaskItem from "@/components/SimpleTaskItem";
import CalendarView from "@/components/CalendarView";

type Tab = "pomodoro" | "simple" | "calendar";

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro");

  // Tasks state + actions
  const {
    tasks,
    activeTask,
    simpleTasks,
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
    stop: stopTimer,
  } = usePomodoro(handleSessionComplete);

  // Helper to know if the timer just completed
  // (used to show "Mark as done" button on tasks)
  const isTimerDone = !isRunning && minutes === 0 && seconds === 0;

  const handleAddPomodoroTask = useCallback(
    async (title: string, durationMinutes: number, scheduledDate?: Date) => {
      const id = await addTask(title, "pomodoro", durationMinutes, scheduledDate);
      startTask(id);
      startFocusSession(durationMinutes);
    },
    [addTask, startTask, startFocusSession]
  );

  const handleAddSimpleTask = useCallback(
    async (title: string, scheduledDate?: Date) => {
      await addTask(title, "simple", undefined, scheduledDate);
    },
    [addTask]
  );

  // Add a simple task for a given date (from calendar quick-add)
  const handleCalendarAddTask = useCallback(
    (title: string, scheduledDate: Date) => {
      addTask(title, "simple", undefined, scheduledDate);
    },
    [addTask]
  );

  // Switch active task + restart timer with its duration
  const handleStartTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || !task.durationMinutes) return;
      startTask(id);
      startFocusSession(task.durationMinutes);
      setActiveTab("pomodoro");
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

  const completedSimpleTasks = simpleTasks.filter((t) => t.status === "completed");
  const pendingSimpleTasks = simpleTasks.filter((t) => t.status === "pending");

  return (
    <main className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
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
        <nav className="flex justify-center gap-2">
          {(
            [
              { key: "pomodoro", label: "🍅 Pomodoro" },
              { key: "simple", label: "📋 Tâches simples" },
              { key: "calendar", label: "📅 Calendrier" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-linear-to-r from-red-500 to-orange-500 text-white shadow"
                  : "border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── POMODORO TAB ── */}
        {activeTab === "pomodoro" && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* LEFT - tasks panel */}
            <section className="flex flex-col gap-4 rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur lg:flex-[1.4]">
              <div>
                <h2 className="text-xl font-semibold text-(--foreground)">Tâches Pomodoro</h2>
                <p className="text-sm text-(--muted)">
                  Démarrer une tâche lance automatiquement le pomodoro.
                </p>
              </div>
              <TaskForm onAdd={handleAddPomodoroTask} />
              <hr className="border-(--border)" />
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

            {/* RIGHT - pomodoro timer */}
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
        )}

        {/* ── SIMPLE TASKS TAB ── */}
        {activeTab === "simple" && (
          <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-(--foreground)">Tâches simples</h2>
              <p className="text-sm text-(--muted)">
                Tâches sans minuterie pomodoro — cochez-les au fur et à mesure.
              </p>
            </div>
            <SimpleTaskForm onAdd={handleAddSimpleTask} />
            <hr className="my-4 border-(--border)" />

            {pendingSimpleTasks.length === 0 && completedSimpleTasks.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Aucune tâche simple — créez-en une ! 📋
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingSimpleTasks.map((task) => (
                  <SimpleTaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onRemove={handleRemoveTask}
                  />
                ))}
                {completedSimpleTasks.length > 0 && (
                  <>
                    <p className="text-xs text-gray-600 mt-2 mb-1">Terminées</p>
                    {completedSimpleTasks.map((task) => (
                      <SimpleTaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                        onRemove={handleRemoveTask}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-(--foreground)">Calendrier</h2>
              <p className="text-sm text-(--muted)">
                Visualisez et planifiez vos tâches par date.
              </p>
            </div>
            <CalendarView
              tasks={tasks.filter((t) => !!t.scheduledDate)}
              onAddTask={handleCalendarAddTask}
              onCompleteTask={handleCompleteTask}
              onRemoveTask={handleRemoveTask}
              onStartPomodoroTask={(id) => {
                handleStartTask(id);
              }}
            />
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