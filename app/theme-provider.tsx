"use client";

import { useEffect } from "react";

/**
 * Keeps `html.dark` in sync with user preference stored in localStorage.
 * Default is dark (per hackathon requirement).
 */
export function ThemeProvider() {
  useEffect(() => {
    const stored = window.localStorage.getItem("filmn1_theme");
    const html = document.documentElement;

    if (stored === "light") {
      html.classList.remove("dark");
    } else {
      // Default to dark.
      html.classList.add("dark");
    }
  }, []);

  return null;
}

