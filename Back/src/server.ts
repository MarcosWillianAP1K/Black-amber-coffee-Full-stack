import "dotenv/config";
import express, { Response } from "express";
import cors from "cors";
import { seed } from "@/seed/seed";
import { env } from "@/config/env";
import router from "@/routes/v1.route";
const app = express();
const PORT = env.PORT || 3000;

app.use(express.json());
app.use(cors());

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

app.use((_req, res: Response) => {
  res.status(404).json({ data: { message: "not found" } });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`📚 Docs v1 available at http://localhost:${PORT}/v1/docs`);

  if (process.env.NODE_ENV !== "production") {
    try {
      await seed();
    } catch (error) {
      console.error("❌ Erro ao executar seed:", error);
    }
  }
});
