"use client";

import React, { useEffect, ReactNode } from "react";
import { reportError } from "@/lib/telemetry";

interface Props {
  children: ReactNode;
  userId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    reportError({
      message: `React Error: ${error.message}`,
      severity: "ERROR",
      stack: error.stack,
      context: "reactErrorBoundary",
      userId: this.props.userId,
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
              <h1 className="text-xl font-semibold text-destructive mb-2">Algo salió mal</h1>
              <p className="text-sm text-foreground/80 mb-4">
                Nos disculpamos por el inconveniente. El error ha sido reportado automáticamente.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

// Wrapper to inject userId from context
export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundaryWithContext userId={undefined}>
      {children}
    </ErrorBoundaryWithContext>
  );
}

function ErrorBoundaryWithContext({ children, userId }: Props) {
  useEffect(() => {
    // Catch unhandled console errors
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      originalError(...args);
      const error = args[0];
      if (error instanceof Error && !error.message.includes("React does not recognize")) {
        reportError({
          message: error.message,
          stack: error.stack,
          context: "consoleError",
          userId,
        });
      }
    };

    return () => {
      console.error = originalError;
    };
  }, [userId]);

  return <ErrorBoundaryClass userId={userId}>{children}</ErrorBoundaryClass>;
}
