"use client";

import { useState, useMemo } from "react";
import type { Task } from "@/types";

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (title: string, scheduledDate: Date) => void;
  onCompleteTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onStartPomodoroTask: (id: string) => void;
}

const DAYS_HEADER = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function CalendarView({
  tasks,
  onAddTask,
  onCompleteTask,
  onRemoveTask,
  onStartPomodoroTask,
}: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Build calendar grid
  const cells: DayCell[] = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // Monday = 0 … Sunday = 6
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: DayCell[] = [];

    // Cells from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      result.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    // Cells for current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      result.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
    }

    // Fill remaining cells (next month) to complete last row
    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d);
        result.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // Map date string → tasks
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const d = task.scheduledDate;
      if (!d) continue;
      const key = toLocalDateStr(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const selectedDateStr = selectedDate ? toLocalDateStr(selectedDate) : null;
  const selectedTasks = selectedDateStr ? (tasksByDate.get(selectedDateStr) ?? []) : [];

  const handleAddNewTask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed || !selectedDate) return;
    onAddTask(trimmed, selectedDate);
    setNewTaskTitle("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          ‹ Préc.
        </button>
        <h3 className="font-semibold text-white">
          {MONTHS[month]} {year}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          Suiv. ›
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {DAYS_HEADER.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const key = toLocalDateStr(cell.date);
          const dayTasks = tasksByDate.get(key) ?? [];
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`relative min-h-[52px] rounded-xl p-1 text-left transition-all ${
                isSelected
                  ? "border-2 border-orange-400 bg-orange-500/10"
                  : cell.isToday
                  ? "border border-orange-500/40 bg-orange-500/5"
                  : cell.isCurrentMonth
                  ? "border border-white/5 bg-white/5 hover:bg-white/10"
                  : "border border-white/5 bg-white/[0.02] opacity-40"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  cell.isToday ? "text-orange-400" : cell.isCurrentMonth ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {cell.date.getDate()}
              </span>

              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        t.status === "completed"
                          ? "bg-green-400"
                          : t.type === "pomodoro"
                          ? "bg-orange-400"
                          : "bg-blue-400"
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-gray-500">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-3 font-semibold text-white">
            📅{" "}
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h4>

          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune tâche prévue pour ce jour.</p>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-sm transition-all ${
                    task.status === "completed"
                      ? "border-green-500/30 bg-green-500/5 opacity-70"
                      : task.type === "pomodoro"
                      ? "border-orange-500/30 bg-orange-500/5"
                      : "border-blue-500/30 bg-blue-500/5"
                  }`}
                >
                  <span className="text-base">{task.type === "pomodoro" ? "🍅" : "📋"}</span>
                  <span className={`flex-1 truncate ${task.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>
                    {task.title}
                  </span>
                  {task.durationMinutes && (
                    <span className="text-xs text-gray-400 shrink-0">{task.durationMinutes} min</span>
                  )}
                  <div className="flex gap-1 shrink-0">
                    {task.type === "pomodoro" && task.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onStartPomodoroTask(task.id)}
                        className="px-2 py-0.5 text-xs rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                      >
                        ▶
                      </button>
                    )}
                    {task.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => onCompleteTask(task.id)}
                        className="px-2 py-0.5 text-xs rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveTask(task.id)}
                      className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick add for selected day */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNewTask()}
              placeholder="Ajouter une tâche pour ce jour..."
              className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleAddNewTask}
              disabled={!newTaskTitle.trim()}
              className="rounded-xl bg-blue-500/20 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Utilise le formulaire &quot;Tâches simples&quot; pour plus d&apos;options.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Pomodoro
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Simple
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Terminée
        </span>
      </div>
    </div>
  );
}

export { parseLocalDate };
