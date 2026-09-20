"use client";

import React, { createContext, useContext, useLayoutEffect, useState, useCallback } from "react";
import { captureEvent, captureError } from "./telemetry";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(newTheme: Theme) {
  try {
    const root = document.documentElement;
    const before = root.className;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    const after = root.className;

    captureEvent("event", `Theme changed to ${newTheme}`, "info", {
      theme: newTheme,
      before,
      after,
      classList: Array.from(root.classList),
    });
  } catch (e) {
    captureError(e, { context: "applyTheme", theme: newTheme });
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initialTheme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    console.log("📍 toggleTheme called, current theme:", theme);
    captureEvent("event", "toggleTheme function invoked", "warning");

    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      console.log(`🔄 State update: ${prev} -> ${newTheme}`);
      captureEvent("event", `Theme state update: ${prev} -> ${newTheme}`, "warning", { previousTheme: prev, newTheme });
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
