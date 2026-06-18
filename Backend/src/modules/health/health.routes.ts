import { Router } from "express";
import { healthController } from "@/modules/health/health.controller";

const healthRoutes = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica se a API esta online
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API online
 */
healthRoutes.get("/health", healthController);

export { healthRoutes };
