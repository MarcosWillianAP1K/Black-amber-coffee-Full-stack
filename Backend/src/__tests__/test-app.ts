/**
 * Test App Factory — usado nos testes de integração
 *
 * Cria uma instância do Express sem:
 *  - chamar app.listen()
 *  - executar seed
 *  - depender de variáveis de ambiente reais
 */

import express from "express";
import cors from "cors";
import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import sharedHandlers from "../shared/handlers/handles";
import { secureHeaders, rateLimit, bodySizeLimit, securityLogger } from "../shared/middlewares/security.middleware";

export function createTestApp() {
  const app = express();
  const router = Router();

  app.use(express.json());
  app.use(cors());
  app.use(secureHeaders);
  app.use(bodySizeLimit);
  app.use(securityLogger);
  // Note: rateLimit omitted in tests to avoid state pollution between suites

  router.use("/api", healthRoutes);
  router.use("/api", authRoutes);

  app.use("/v1", router);

  app.use((_req, _res, next) => {
    next(new Error("NOT_FOUND"));
  });

  app.use(sharedHandlers.error);

  return app;
}
