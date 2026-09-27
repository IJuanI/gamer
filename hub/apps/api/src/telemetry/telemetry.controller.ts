import { Body, Controller, Post, Req, Headers } from "@nestjs/common";
import type { Request } from "express";
import { CloudLoggingService } from "../logging/cloud-logging.service";

interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

@Controller("telemetry")
export class TelemetryController {
  constructor(private readonly logging: CloudLoggingService) {}

  @Post("error")
  async reportError(
    @Body() report: ErrorReport,
    @Req() req: Request,
    @Headers("user-agent") userAgent?: string,
  ) {
    await this.logging.logError({
      timestamp: new Date().toISOString(),
      level: "error",
      message: report.message,
      context: report.context || "frontend",
      userId: report.userId,
      userAgent,
      url: report.url,
      stack: report.stack,
      metadata: report.metadata,
    });

    return { ok: true };
  }
}
