import "dotenv/config";
import express, { Response } from "express";
import cors from "cors";
import { seed } from "./seed/seed";
import { env } from "./config/env";
import router from "./routes/v1.route";
import sharedHandlers from "./shared/handlers/handles";
import { secureHeaders, rateLimit, bodySizeLimit, securityLogger } from "./shared/middlewares/security.middleware";
const app = express();
const PORT = env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Security middlewares (ASVS)
app.use(secureHeaders);
app.use(rateLimit);
app.use(bodySizeLimit);
app.use(securityLogger);

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const startedAt = new Date().toISOString();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      `${startedAt} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${durationMs.toFixed(2)} ms`,
    );
  });

  next();
});

app.use("/v1", router);

app.use((_req, _res, next) => {
  next(new Error("NOT_FOUND"));
});

app.use(sharedHandlers.error);

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    const publicPort = process.env.PUBLIC_PORT || PORT;
    console.log(`🚀 Server running internally on PORT ${PORT}`);
    console.log(`📚 Docs v1 available at http://localhost:${publicPort}/v1/docs`);

    if (process.env.NODE_ENV !== "production") {
      try {
        await seed();
      } catch (error) {
        console.error("❌ Erro ao executar seed:", error);
      }
    }
  });
}

export default app;
