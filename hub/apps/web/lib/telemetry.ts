const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface TelemetryError {
  message: string;
  stack?: string;
  url?: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function reportError(error: TelemetryError): Promise<void> {
  if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
    // Don't report errors in production if API isn't configured
    return;
  }

  try {
    await fetch(`${API_URL}/api/telemetry/error`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: error.url || typeof window !== "undefined" ? window.location.href : undefined,
        context: error.context,
        userId: error.userId,
        metadata: error.metadata,
      }),
    }).catch(() => {
      // Silently fail if telemetry endpoint is down
    });
  } catch {
    // Fail silently
  }
}

export function setupGlobalErrorHandler(userId?: string): void {
  if (typeof window === "undefined") return;

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    reportError({
      message: error?.message || String(error),
      stack: error?.stack,
      context: "unhandledRejection",
      userId,
    });
  });

  // Catch global errors
  window.addEventListener("error", (event) => {
    reportError({
      message: event.message,
      stack: event.error?.stack,
      context: "globalError",
      userId,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
}

// Aliases for backward compatibility
export const initTelemetry = setupGlobalErrorHandler;

// Handle the old captureEvent API with 3-4 arguments
export function captureEvent(
  type: string,
  message: string,
  level?: string,
  metadata?: Record<string, any>
): Promise<void> {
  return reportError({
    message,
    context: type,
    metadata: { level, ...metadata },
  });
}

// Handle the old captureError API with optional metadata
export function captureError(error: any, metadata?: Record<string, any>): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  return reportError({
    message,
    stack,
    metadata,
  });
}
