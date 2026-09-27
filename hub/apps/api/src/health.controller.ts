import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FirestoreService } from "./firestore/firestore.service";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  environment: string;
  uptime: number;
  checks: {
    firestore: "ok" | "error";
  };
}

@ApiTags("Health")
@Controller("health")
export class HealthController {
  private startTime = Date.now();

  constructor(@Inject(FirestoreService) private readonly firestore: FirestoreService) {}

  @Get()
  @ApiOperation({ summary: "Get comprehensive health status" })
  @ApiResponse({ status: 200, description: "Detailed health check results" })
  async check(): Promise<HealthResponse> {
    const uptime = Date.now() - this.startTime;
    let firestoreStatus: "ok" | "error" = "ok";
    try {
      await this.firestore.getFirestore();
    } catch {
      firestoreStatus = "error";
    }

    const status = firestoreStatus === "error" ? "degraded" : "healthy";

    return {
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime,
      checks: {
        firestore: firestoreStatus,
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
      await this.firestore.getFirestore();
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
