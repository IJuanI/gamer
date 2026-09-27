import { Injectable, OnModuleInit } from "@nestjs/common";

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
export class CloudLoggingService implements OnModuleInit {
  private logName = "gamer-hub";
  private logger: any;

  async onModuleInit() {
    if (process.env.NODE_ENV === "production") {
      try {
        const { Logging } = await import("@google-cloud/logging");
        const logging = new Logging({
          projectId: process.env.GOOGLE_CLOUD_PROJECT,
        });
        this.logger = logging.log(this.logName);
      } catch (err) {
        console.error("Failed to initialize Google Cloud Logging:", err);
        this.logger = null;
      }
    }
  }

  async logError(log: ErrorLog): Promise<void> {
    const entry = {
      timestamp: new Date(log.timestamp),
      severity: "ERROR",
      jsonPayload: {
        message: log.message,
        context: log.context,
        userId: log.userId,
        userAgent: log.userAgent,
        url: log.url,
        stack: log.stack,
        metadata: log.metadata,
      },
    };

    if (this.logger) {
      try {
        await this.logger.write(this.logger.entry(entry));
      } catch (err) {
        console.error("Failed to write to Cloud Logging:", err);
      }
    } else {
      // Fallback to console in dev
      console.error("[CloudLog]", log.message, log);
    }
  }

  async logWarning(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = {
      timestamp: new Date(),
      severity: "WARNING",
      jsonPayload: {
        message,
        metadata,
      },
    };

    if (this.logger) {
      try {
        await this.logger.write(this.logger.entry(entry));
      } catch (err) {
        console.error("Failed to write to Cloud Logging:", err);
      }
    }
  }

  async logInfo(message: string, metadata?: Record<string, any>, context?: string): Promise<void> {
    const entry = {
      timestamp: new Date(),
      severity: "INFO",
      jsonPayload: {
        message,
        context,
        metadata,
      },
    };

    if (this.logger) {
      try {
        await this.logger.write(this.logger.entry(entry));
      } catch (err) {
        console.error("Failed to write to Cloud Logging:", err);
      }
    } else {
      // Fallback to console in dev
      console.log("[INFO]", context || "", message, metadata || "");
    }
  }
}
