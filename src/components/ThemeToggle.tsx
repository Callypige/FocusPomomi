"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "focuspomomi.theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--foreground) transition-colors hover:bg-(--surface-elevated) disabled:opacity-60"
      title={theme === "dark" ? "Passer en theme clair" : "Passer en theme sombre"}
      aria-label={theme === "dark" ? "Activer le theme clair" : "Activer le theme sombre"}
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  );
}
