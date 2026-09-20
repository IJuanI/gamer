export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: "error" | "event" | "performance" | "navigation";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  data?: Record<string, unknown>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  sessionId?: string;
}

const STORAGE_KEY = "telemetry_events";
const MAX_EVENTS = 500;
const SESSION_ID = typeof window !== "undefined" ? generateSessionId() : "";

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getStoredEvents(): TelemetryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: TelemetryEvent[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save telemetry:", e);
  }
}

export function captureEvent(
  type: TelemetryEvent["type"],
  message: string,
  severity: TelemetryEvent["severity"] = "info",
  data?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const event: TelemetryEvent = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    type,
    severity,
    message,
    data,
    url: window.location.href,
    sessionId: SESSION_ID,
    userAgent: navigator.userAgent,
  };

  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch((e) => {
    console.error("Failed to send telemetry:", e);
  });

  const events = getStoredEvents();
  events.push(event);
  saveEvents(events);

  if (severity === "error" || severity === "critical") {
    console.error(`[${type}]`, message, data);
  } else if (severity === "warning") {
    console.warn(`[${type}]`, message, data);
  } else {
    console.log(`[${type}]`, message, data);
  }
}

export function captureError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  captureEvent("error", errorObj.message, "error", {
    name: errorObj.name,
    stack: errorObj.stack,
    ...context,
  });
}

export function getAllEvents(): TelemetryEvent[] {
  return getStoredEvents();
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getEventsByType(type: TelemetryEvent["type"]): TelemetryEvent[] {
  return getStoredEvents().filter((e) => e.type === type);
}

export function getErrorEvents(): TelemetryEvent[] {
  return getStoredEvents().filter((e) => e.severity === "error" || e.severity === "critical");
}

export function initTelemetry() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureError(event.reason, {
      type: "unhandledRejection",
    });
  });
}
