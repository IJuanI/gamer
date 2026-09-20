"use client";

import { useEffect, useRef } from "react";
import { captureEvent } from "@/lib/telemetry";

export function RenderTelemetry({ component }: { component: string }) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;

    captureEvent("event", `Component render: ${component}`, "info", {
      renderCount: renderCountRef.current,
      timestamp: new Date().toISOString(),
      pathname: typeof window !== "undefined" ? window.location.pathname : "unknown",
    });

    console.log(`✅ ${component} rendered (count: ${renderCountRef.current})`);
  }, [component]);

  return null;
}
