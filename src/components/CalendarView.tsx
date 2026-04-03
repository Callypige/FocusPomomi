"use client";

import { useState, useMemo } from "react";
import type { Task } from "@/types";

interface CalendarViewProps {
  tasks: Task[];
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getTaskDateKey(task: Task): Date {
  // Show task on the day it was created
  return new Date(task.createdAt);
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_DOT: Record<Task["status"], string> = {
  pending: "bg-gray-400",
  in_progress: "bg-yellow-400",
  completed: "bg-green-400",
  failed: "bg-red-400",
};

export default function CalendarView({ tasks }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  // Build map: "YYYY-MM-DD" -> Task[]
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const d = getTaskDateKey(task);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  const dayKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  // Build the calendar grid for the current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday-based week: getDay() returns 0=Sun, convert to Mon-based
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon … 6=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    // Pad end to complete final row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectedTasks = useMemo(
    () => (selectedDate ? (tasksByDay.get(dayKey(selectedDate)) ?? []) : []),
    [selectedDate, tasksByDay]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          ‹
        </button>
        <h3 className="font-semibold text-(--foreground)">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const dayTasks = tasksByDay.get(dayKey(date)) ?? [];
          const hasTasks = dayTasks.length > 0;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-sm transition-all ${
                isSelected
                  ? "bg-orange-500/30 text-orange-200 border border-orange-400/50"
                  : isToday
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <span>{date.getDate()}</span>
              {hasTasks && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[t.status]}`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-gray-400">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      {selectedDate && (
        <div className="mt-2">
          <p className="text-sm font-medium text-(--foreground) mb-2">
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Aucune tâche ce jour-là.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {selectedTasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                    task.status === "completed"
                      ? "border-green-500/30 bg-green-500/5 text-green-300"
                      : task.status === "failed"
                      ? "border-red-500/30 bg-red-500/5 text-red-300 opacity-70"
                      : task.status === "in_progress"
                      ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-200"
                      : task.durationMinutes !== undefined
                      ? "border-white/10 bg-white/5 text-gray-300"
                      : "border-blue-500/20 bg-blue-500/5 text-blue-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[task.status]}`}
                  />
                  <span className={`flex-1 truncate ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.fruit && <span className="mr-1">{task.fruit}</span>}
                    {task.title}
                  </span>
                  {task.durationMinutes !== undefined ? (
                    <span className="text-xs text-gray-500 shrink-0">
                      🍅 {task.durationMinutes}min
                    </span>
                  ) : (
                    <span className="text-xs text-blue-400 shrink-0">📌</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
