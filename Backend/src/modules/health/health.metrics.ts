/**
 * Metrics Controller — ASVS 4.4 / SonarQube-compatible
 *
 * Expõe 10 métricas numéricas/qualitativas do sistema:
 *  1.  uptime_seconds          — tempo de vida do processo
 *  2.  memory_rss_mb           — memória RSS
 *  3.  memory_heap_used_mb     — heap utilizado
 *  4.  memory_heap_total_mb    — heap total
 *  5.  memory_external_mb      — memória externa (buffers C++)
 *  6.  cpu_user_ms             — tempo de CPU em modo usuário
 *  7.  cpu_system_ms           — tempo de CPU em modo kernel
 *  8.  event_loop_lag_ms       — lag estimado do event loop
 *  9.  node_version            — versão do Node.js (qualitativa)
 * 10.  environment             — ambiente de execução (qualitativa)
 */

import { Request, Response } from "express";

let eventLoopLag = 0;

// Measure event loop lag once per second
setInterval(() => {
  const start = Date.now();
  setImmediate(() => {
    eventLoopLag = Date.now() - start;
  });
}, 1000).unref();

export function metricsController(_req: Request, res: Response): void {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();

  const metrics = {
    uptime_seconds: Math.floor(process.uptime()),
    memory_rss_mb: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
    memory_heap_used_mb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
    memory_heap_total_mb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(2)),
    memory_external_mb: parseFloat((mem.external / 1024 / 1024).toFixed(2)),
    cpu_user_ms: parseFloat((cpu.user / 1000).toFixed(2)),
    cpu_system_ms: parseFloat((cpu.system / 1000).toFixed(2)),
    event_loop_lag_ms: eventLoopLag,
    node_version: process.version,
    environment: process.env.NODE_ENV ?? "development",
  };

  res.status(200).json({
    success: true,
    collectedAt: new Date().toISOString(),
    metrics,
  });
}
