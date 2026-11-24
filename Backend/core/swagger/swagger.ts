import type { Express, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const isDist = currentDir.includes(`${path.sep}dist${path.sep}`);

const swaggerRouteGlobs = isDist
  ? [path.resolve(currentDir, "..", "..", "api", "**", "*.routes.js")]
  : [path.resolve(currentDir, "..", "..", "api", "**", "*.routes.ts")];

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Black Amber Coffee API",
      description: "API RESTful Clean MVC Feature-Driven com PostgreSQL",
      version: "2.0.0",
    },
    servers: [
      { url: "/v1/api", description: "API v1 (Principal)" },
      { url: "/api", description: "API Alias" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o accessToken JWT obtido no login",
        },
      },
    },
  },
  apis: swaggerRouteGlobs,
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  const uiOptions = { swaggerOptions: { defaultModelsExpandDepth: -1 } };
  app.use("/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, uiOptions));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, uiOptions));
  app.get("/v1/docs.json", (_req, res: Response) => {
    res.json(swaggerSpec);
  });
  app.get("/api/docs.json", (_req, res: Response) => {
    res.json(swaggerSpec);
  });
}
