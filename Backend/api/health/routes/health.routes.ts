import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";

export const healthRoutes = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica se a API e o banco PostgreSQL estão online
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API e PostgreSQL operacionais
 *       503:
 *         description: Banco de dados indisponível
 */
healthRoutes.get("/health", (req, res) => void HealthController.check(req, res));

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Retorna métricas operacionais do servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Métricas coletadas com sucesso
 */
healthRoutes.get("/metrics", (req, res) => HealthController.metrics(req, res));
