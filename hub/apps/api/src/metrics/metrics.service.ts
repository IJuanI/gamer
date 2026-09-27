import { Injectable } from "@nestjs/common";

export interface EndpointMetrics {
  path: string;
  method: string;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  lastSeen: string;
}

interface RequestMetric {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private metrics: Map<string, RequestMetric[]> = new Map();
  private readonly maxMetricsPerEndpoint = 1000;

  recordRequest(path: string, method: string, statusCode: number, responseTime: number): void {
    const key = `${method} ${path}`;

    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const endpointMetrics = this.metrics.get(key)!;
    endpointMetrics.push({
      path,
      method,
      statusCode,
      responseTime,
      timestamp: new Date(),
    });

    // Keep only recent metrics to avoid memory growth
    if (endpointMetrics.length > this.maxMetricsPerEndpoint) {
      endpointMetrics.shift();
    }
  }

  getMetrics(): EndpointMetrics[] {
    const results: EndpointMetrics[] = [];

    for (const [key, requests] of this.metrics.entries()) {
      if (requests.length === 0) continue;

      const [method, path] = key.split(" ");
      const errors = requests.filter((r) => r.statusCode >= 400).length;
      const responseTimes = requests.map((r) => r.responseTime);

      const result: EndpointMetrics = {
        path,
        method,
        totalRequests: requests.length,
        totalErrors: errors,
        avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        errorRate: Number(((errors / requests.length) * 100).toFixed(2)),
        lastSeen: requests[requests.length - 1].timestamp.toISOString(),
      };

      results.push(result);
    }

    // Sort by total requests descending
    return results.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  getMetricsByPath(path: string): EndpointMetrics[] {
    return this.getMetrics().filter((m) => m.path.includes(path));
  }

  getSummary() {
    const metrics = this.getMetrics();
    const totalRequests = metrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.totalErrors, 0);
    const avgResponseTime = Math.round(
      metrics.reduce((sum, m) => sum + m.avgResponseTime * m.totalRequests, 0) / totalRequests
    );

    return {
      totalEndpoints: metrics.length,
      totalRequests,
      totalErrors,
      overallErrorRate: Number(((totalErrors / totalRequests) * 100).toFixed(2)),
      overallAvgResponseTime: avgResponseTime,
      slowestEndpoint: metrics[0]?.path || "N/A",
      slowestResponseTime: metrics[0]?.maxResponseTime || 0,
    };
  }

  reset(): void {
    this.metrics.clear();
  }
}
