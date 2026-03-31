"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "focuspomomi.theme";
const THEME_EVENT = "focuspomomi:theme-change";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
  };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, getStoredTheme, () => "dark");

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
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
