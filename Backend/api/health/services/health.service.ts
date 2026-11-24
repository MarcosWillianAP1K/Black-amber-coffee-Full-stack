import { checkDatabaseHealth } from "../../../core/database/postgres.client.js";
import { env } from "../../../core/config/env.js";

export interface HealthStatus {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  dbLatencyMs: number;
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface SystemMetrics {
  uptime_seconds: number;
  memory_rss_mb: number;
  memory_heap_used_mb: number;
  memory_heap_total_mb: number;
  memory_external_mb: number;
  cpu_user_ms: number;
  cpu_system_ms: number;
  event_loop_lag_ms: number;
  node_version: string;
  environment: string;
}

let eventLoopLag = 0;

setInterval(() => {
  const start = Date.now();
  setImmediate(() => {
    eventLoopLag = Date.now() - start;
  });
}, 1000).unref();

export class HealthService {
  static async check(): Promise<HealthStatus> {
    const dbHealth = await checkDatabaseHealth();
    return {
      status: dbHealth.connected ? "ok" : "degraded",
      database: dbHealth.connected ? "connected" : "disconnected",
      dbLatencyMs: dbHealth.latencyMs,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
    };
  }

  static getMetrics(): SystemMetrics {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      uptime_seconds: Math.floor(process.uptime()),
      memory_rss_mb: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
      memory_heap_used_mb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
      memory_heap_total_mb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(2)),
      memory_external_mb: parseFloat((mem.external / 1024 / 1024).toFixed(2)),
      cpu_user_ms: parseFloat((cpu.user / 1000).toFixed(2)),
      cpu_system_ms: parseFloat((cpu.system / 1000).toFixed(2)),
      event_loop_lag_ms: eventLoopLag,
      node_version: process.version,
      environment: env.NODE_ENV,
    };
  }
}
