import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  environment: string;
  uptime: number;
  checks: {
    database: "ok" | "error";
  };
}

@ApiTags("Health")
@Controller("health")
export class HealthController {
  private startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Get comprehensive health status" })
  @ApiResponse({ status: 200, description: "Detailed health check results" })
  async check(): Promise<HealthResponse> {
    const uptime = Date.now() - this.startTime;
    let databaseStatus: "ok" | "error" = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = "error";
    }

    const status = databaseStatus === "error" ? "degraded" : "healthy";

    return {
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime,
      checks: {
        database: databaseStatus,
      },
    };
  }

  @Get("live")
  @ApiOperation({ summary: "Kubernetes liveness probe - check if process is running" })
  @ApiResponse({ status: 200, description: "Process is alive" })
  live() {
    return { ok: true };
  }

  @Get("ready")
  @ApiOperation({ summary: "Kubernetes readiness probe - check if ready to serve traffic" })
  @ApiResponse({ status: 200, description: "API is ready" })
  @ApiResponse({ status: 503, description: "API is not ready" })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
