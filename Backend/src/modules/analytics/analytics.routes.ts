import { Router } from "express";
import AnalyticsController from "./analytics.controller";
import AnalyticsService from "./analytics.service";
import { AuthMiddleware } from "../auth/auth.middleware";
import { requireAdmin } from "../../shared/middlewares/permission.middleware";

/**
 * Creates analytics routes (admin only).
 *
 * Endpoints:
 *   GET /analytics/dashboard → Dashboard analytics data
 */
export function createAnalyticsRoutes(): Router {
  const router = Router();

  const analyticsSvc = new AnalyticsService();
  const analyticsCtrl = new AnalyticsController(analyticsSvc);

  // All analytics routes require auth + admin
  router.use(AuthMiddleware, requireAdmin());

  /**
   * @swagger
   * /api/analytics/dashboard:
   *   get:
   *     summary: Get dashboard analytics (admin only)
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dashboard analytics data
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get("/dashboard", (req, res, next) =>
    analyticsCtrl.getDashboard(req, res, next),
  );

  return router;
}
