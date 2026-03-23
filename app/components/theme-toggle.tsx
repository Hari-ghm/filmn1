"use client";

import { useMemo, useState } from "react";

type ThemeMode = "dark" | "light";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("filmn1_theme");
    return stored === "light" ? "light" : "dark";
  });

  const isDark = mode === "dark";
  const label = useMemo(() => (isDark ? "Switch to light" : "Switch to dark"), [isDark]);

  function toggle() {
    const next: ThemeMode = isDark ? "light" : "dark";
    setMode(next);
    window.localStorage.setItem("filmn1_theme", next);

    const html = document.documentElement;
    if (next === "light") html.classList.remove("dark");
    else html.classList.add("dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="group inline-flex items-center gap-3 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-foreground backdrop-blur transition hover:border-primary/50"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 group-hover:text-primary transition-colors">
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className="hidden sm:inline opacity-80 group-hover:opacity-100 transition-opacity">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M21 13.2A8.4 8.4 0 0 1 10.8 3a7 7 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v2M12 20v2M22 12h-2M4 12H2M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4M19.1 19.1l-1.4-1.4M6.3 6.3 4.9 4.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

