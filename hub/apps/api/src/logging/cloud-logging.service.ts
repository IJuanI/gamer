import { Injectable } from "@nestjs/common";

interface ErrorLog {
  timestamp: string;
  level: "error" | "warning" | "info";
  message: string;
  context?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CloudLoggingService {
  async logError(log: ErrorLog): Promise<void> {
    const entry = {
      timestamp: log.timestamp,
      severity: "ERROR",
      message: log.message,
      context: log.context,
      userId: log.userId,
      userAgent: log.userAgent,
      url: log.url,
      stack: log.stack,
      metadata: log.metadata,
    };

    console.error("[ERROR]", JSON.stringify(entry));
  }

  async logWarning(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = {
      timestamp: new Date().toISOString(),
      severity: "WARNING",
      message,
      metadata,
    };

    console.warn("[WARNING]", JSON.stringify(entry));
  }

  async logInfo(message: string, metadata?: Record<string, any>, context?: string): Promise<void> {
    const entry = {
      timestamp: new Date().toISOString(),
      severity: "INFO",
      message,
      context,
      metadata,
    };

    console.log("[INFO]", JSON.stringify(entry));
  }
}
