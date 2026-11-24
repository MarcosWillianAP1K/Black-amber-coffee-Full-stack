import type { NextFunction, Request, Response } from "express";
import { type ZodType, z } from "zod";

export function validateSchemaMiddleware<T>(
  schema: ZodType<T>,
  property: "body" | "params" | "query" = "body",
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues[0]?.message ?? "Dados inválidos.",
          details: z.flattenError(result.error),
        },
      });
      return;
    }

    if (property === "query") {
      Object.assign(req.query, result.data);
    } else if (property === "params") {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }

    next();
  };
}
