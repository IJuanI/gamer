import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles } from "../auth/decorators";
import { MetricsService } from "./metrics.service";

@ApiTags("Metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get API metrics (admin only)" })
  @ApiResponse({ status: 200, description: "API metrics including response times and error rates" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - requires ADMIN role" })
  getAllMetrics() {
    return this.metrics.getMetrics();
  }

  @Get("search")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Search metrics by endpoint path" })
  @ApiResponse({ status: 200, description: "Matching endpoint metrics" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - requires ADMIN role" })
  searchMetrics(@Query("path") path: string) {
    if (!path) {
      return { error: "path query parameter is required" };
    }
    return this.metrics.getMetricsByPath(path);
  }

  @Get("summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get metrics summary (admin only)" })
  @ApiResponse({ status: 200, description: "Overall API metrics summary" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - requires ADMIN role" })
  getSummary() {
    return this.metrics.getSummary();
  }
}
