"use client";

import { useEffect } from "react";
import { initTelemetry, captureEvent } from "@/lib/telemetry";

export function TelemetryInit() {
  useEffect(() => {
    initTelemetry();

    const info = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      documentReady: document.readyState,
      hasButton: !!document.querySelector('[aria-label="Toggle theme"]'),
      buttonCount: document.querySelectorAll('button').length,
      htmlClass: document.documentElement.className,
    };

    console.log("📊 Page Load Info:", info);
    captureEvent("navigation", "Page loaded", "warning", info);

    setTimeout(() => {
      const buttonAfter = document.querySelector('[aria-label="Toggle theme"]');
      captureEvent("navigation", "Post-load check", "info", {
        buttonFound: !!buttonAfter,
        buttonClasses: buttonAfter?.className,
        buttonParent: buttonAfter?.parentElement?.className,
      });
    }, 500);
  }, []);

  return null;
}
