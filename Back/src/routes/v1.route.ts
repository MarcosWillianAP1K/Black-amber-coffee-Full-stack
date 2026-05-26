import { Router, Response } from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { healthRoutes } from "@/modules/health/health.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { workerRoutes } from "@/modules/worker/worker.routes";

const routes = Router();

const swaggerRouteGlobs = [
  path.join(__dirname, "..", "modules", "**", "*.ts"),
  path.join(__dirname, "..", "modules", "**", "*.js"),
];

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Black Amber Coffes API",
      description: "Documentação da API utilizando Express",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login",
        },
      },
    },
  },
  apis: swaggerRouteGlobs,
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

routes.use(healthRoutes);
routes.use("/api", authRoutes);
routes.use("/api", userRoutes);
routes.use("/api", workerRoutes);

routes.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
routes.get("/docs.json", (_req, res: Response) => {
  res.json(swaggerSpec);
});

export default routes;
