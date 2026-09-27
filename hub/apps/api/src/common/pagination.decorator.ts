import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { parsePaginationParams, PaginationParams } from "./pagination";

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const page = request.query.page;
    const limit = request.query.limit;
    return parsePaginationParams(page, limit);
  }
);
