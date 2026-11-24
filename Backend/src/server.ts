import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { env } from "../core/config/env.js";
import { runMigrations } from "../core/database/migrator.js";
import { runSeed } from "../core/database/seeder.js";
import { globalErrorHandler, logger } from "../core/errors/index.js";
import {
  bodySizeLimit,
  rateLimit,
  secureHeaders,
  securityLogger,
} from "../core/middlewares/security.middleware.js";
import { setupSwagger } from "../core/swagger/swagger.js";
import { apiRouter } from "../api/index.js";
import { HealthController } from "../api/health/controllers/health.controller.js";

export function createApp(options: { enableRateLimit?: boolean } = {}): Express {
  const app = express();
  const { enableRateLimit = true } = options;

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: env.corsOrigins !== "*",
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(secureHeaders);
  if (enableRateLimit) {
    app.use(rateLimit);
  }
  app.use(bodySizeLimit);
  app.use(securityLogger);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      if (req.originalUrl === "/" && req.method === "GET") return;
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(2)}ms)`);
    });
    next();
  });

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "online",
      message: "Black Amber Coffee API está rodando com sucesso.",
      health: "/v1/api/health",
      docs: "/v1/docs",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health", (req: Request, res: Response) => void HealthController.check(req, res));

  setupSwagger(app);

  app.use("/v1/api", apiRouter);
  app.use("/api", apiRouter);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new Error("NOT_FOUND"));
  });

  app.use(globalErrorHandler);

  return app;
}

const app = createApp();

async function bootstrap(): Promise<void> {
  try {
    await runMigrations();
    if (env.AUTO_SEED) {
      await runSeed();
    }

    app.listen(env.PORT, () => {
      const publicPort = env.PUBLIC_PORT ?? env.PORT;
      console.log(`[Backend] Servidor rodando na porta ${env.PORT}`);
      console.log(`[Backend] Health Check: http://localhost:${publicPort}/v1/api/health`);
      console.log(`[Backend] Swagger UI: http://localhost:${publicPort}/v1/docs`);
    });
  } catch (error) {
    console.error("[Backend] Falha fatal ao iniciar o servidor:", error);
    process.exit(1);
  }
}

if (!env.isTest) {
  void bootstrap();
}

export default app;
