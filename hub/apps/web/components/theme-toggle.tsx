"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { captureEvent } from "@/lib/telemetry";
import { useEffect, useRef } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    captureEvent("event", "ThemeToggle component mounted", "info", { theme });
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      captureEvent("event", "Button ref not found", "error");
      return;
    }

    const handleClick = () => {
      console.log("✅ Native click handler fired!");
      captureEvent("event", "Button clicked (native)", "warning");
      toggleTheme();
    };

    button.addEventListener("click", handleClick);
    captureEvent("event", "Native click listener attached", "info");

    return () => {
      button.removeEventListener("click", handleClick);
    };
  }, [toggleTheme]);

  return (
    <button
      ref={buttonRef}
      className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-50"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      type="button"
      style={{ pointerEvents: "auto" }}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
