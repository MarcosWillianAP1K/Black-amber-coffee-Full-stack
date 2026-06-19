import AnalyticsService from "./analytics.service";
import { NextFunction, Request, Response } from "express";

export default class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  /**
   * GET /analytics/dashboard
   * Get dashboard analytics data
   */
  async getDashboard(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await this.analyticsService.getDashboard();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }
}
