import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const REQUEST_ID_HEADER = "x-request-id";

declare global {
  // Express's Request type is augmented through a namespace. ES modules can't do this.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing request ID from header, or generate new one
    const requestId = (req.get(REQUEST_ID_HEADER) || uuidv4()).substring(0, 36);
    req.id = requestId;

    // Send request ID back in response headers for tracking
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
