import { Router } from "express";
import { healthController } from "@/modules/health/health.controller";
import { metricsController } from "@/modules/health/health.metrics";

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

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Retorna 10 métricas do sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Métricas coletadas com sucesso
 */
healthRoutes.get("/metrics", metricsController);

export { healthRoutes };
