export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export type PomodoroMode = "focus" | "short_break" | "long_break";

export interface Task {
  id: string;
  title: string;
  /** Undefined when the task has no Pomodoro timer (simple reminder task). */
  durationMinutes?: number;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  fruit?: string;
}


export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}
