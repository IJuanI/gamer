import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";
import { CloudLoggingService } from "../logging/cloud-logging.service";

interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logging: CloudLoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log unexpected errors
      this.logging.logError({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `Unhandled error in ${request.method} ${request.path}`,
        context: "apiError",
        stack: exception.stack,
        metadata: {
          path: request.path,
          method: request.method,
          error: exception.message,
        },
      });
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
