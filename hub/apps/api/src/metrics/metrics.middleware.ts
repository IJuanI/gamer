import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on("finish", () => {
      const responseTime = Date.now() - startTime;
      // Normalize path by removing IDs to group similar endpoints
      const normalizedPath = req.path.replace(/\/[a-f0-9\-]{24,36}\//g, "/:id/");
      this.metrics.recordRequest(
        normalizedPath,
        req.method,
        res.statusCode,
        responseTime
      );
    });

    next();
  }
}
