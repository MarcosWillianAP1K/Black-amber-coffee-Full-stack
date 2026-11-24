import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin } from "../../../core/middlewares/permission.middleware.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(AuthMiddleware, requireAdmin());

analyticsRoutes.get("/dashboard", (req, res, next) =>
  void AnalyticsController.getDashboard(req, res, next),
);
