"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/telemetry";
import { useAuth } from "./auth-provider";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    // Catch React errors in error boundary
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      const error = args[0];
      if (error instanceof Error) {
        reportError({
          message: error.message,
          stack: error.stack,
          context: "reactError",
          userId: user?.id,
        });
      }
    };

    return () => {
      console.error = originalError;
    };
  }, [user?.id]);

  return <>{children}</>;
}
