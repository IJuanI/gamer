import { Controller, Get, Inject } from "@nestjs/common";
import { FirestoreService } from "./firestore/firestore.service";

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  service: string;
  timestamp: string;
  checks: {
    firestore: "ok" | "error";
    environment: string;
  };
}

@Controller("health")
export class HealthController {
  constructor(@Inject(FirestoreService) private readonly firestore: FirestoreService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    let firestoreStatus: "ok" | "error" = "ok";
    try {
      await this.firestore.getFirestore();
    } catch {
      firestoreStatus = "error";
    }

    const status = firestoreStatus === "error" ? "degraded" : "ok";

    return {
      status,
      service: "gamer-hub-api",
      timestamp: new Date().toISOString(),
      checks: {
        firestore: firestoreStatus,
        environment: process.env.NODE_ENV || "development",
      },
    };
  }
}
