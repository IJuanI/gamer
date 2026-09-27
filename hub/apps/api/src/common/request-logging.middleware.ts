import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;
    const requestId = (req as any).id || "unknown";

    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log slow requests or errors
      if (statusCode >= 400 || duration > 5000) {
        console.log(
          `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} ${statusCode} ${duration}ms`
        );
      }

      return originalSend.call(this, data);
    };

    next();
  }
}
