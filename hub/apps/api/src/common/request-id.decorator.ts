import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { REQUEST_ID_HEADER } from "./request-id.middleware";

export const RequestId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.id || request.get(REQUEST_ID_HEADER) || "unknown";
});
