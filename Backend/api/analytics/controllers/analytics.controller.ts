import type { NextFunction, Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  static async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getDashboard();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }
}
