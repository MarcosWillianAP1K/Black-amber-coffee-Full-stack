import type { Request, Response } from "express";
import { HealthService } from "../services/health.service.js";

export class HealthController {
  static async check(_req: Request, res: Response): Promise<void> {
    const health = await HealthService.check();
    const statusCode = health.database === "connected" ? 200 : 503;
    res.status(statusCode).json(health);
  }

  static metrics(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      collectedAt: new Date().toISOString(),
      metrics: HealthService.getMetrics(),
    });
  }
}
