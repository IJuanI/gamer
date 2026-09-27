import { BadRequestException } from "@nestjs/common";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function parsePaginationParams(
  pageParam?: string | number,
  limitParam?: string | number
): PaginationParams {
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  if (pageParam !== undefined) {
    page = Number(pageParam);
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException("Page must be a positive integer");
    }
  }

  if (limitParam !== undefined) {
    limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit must be between 1 and ${MAX_LIMIT}`);
    }
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
