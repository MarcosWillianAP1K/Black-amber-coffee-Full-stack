import { AnalyticsModel } from "../models/analytics.model.js";
import type { DashboardAnalyticsDTO } from "../dtos/analytics.dto.js";

export class AnalyticsService {
  static async getDashboard(): Promise<DashboardAnalyticsDTO> {
    return AnalyticsModel.fetchDashboard();
  }
}
