import { Body, Controller, Post, Req, Headers, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsString, IsOptional, MaxLength } from "class-validator";
import type { Request } from "express";
import { CloudLoggingService } from "../logging/cloud-logging.service";

class ErrorReportDto {
  @IsString()
  @MaxLength(500)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  stack?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  context?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

@ApiTags("Telemetry")
@Controller("telemetry")
export class TelemetryController {
  constructor(private readonly logging: CloudLoggingService) {}

  @Post("error")
  @ApiOperation({ summary: "Report a frontend error" })
  @ApiResponse({ status: 200, description: "Error logged successfully" })
  @ApiResponse({ status: 400, description: "Invalid error data" })
  async reportError(
    @Body() report: ErrorReportDto,
    @Req() req: Request,
    @Headers("user-agent") userAgent?: string,
  ) {
    if (!report.message) {
      throw new BadRequestException("Error message is required");
    }

    // Truncate metadata to prevent logging abuse
    const metadata = report.metadata ? Object.fromEntries(
      Object.entries(report.metadata)
        .slice(0, 10)
        .map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 500) : v])
    ) : undefined;

    await this.logging.logError({
      timestamp: new Date().toISOString(),
      level: "error",
      message: report.message,
      context: report.context || "frontend",
      userId: report.userId,
      userAgent,
      url: report.url,
      stack: report.stack,
      metadata,
    });

    return { ok: true };
  }
}
