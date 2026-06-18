import { Request, Response, NextFunction } from "express";
import { ZodType, z } from "zod";

const validateSchemaMiddleware =
  (schema: ZodType, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          details: z.flattenError(result.error),
        },
      });
    }

    if (property === "query") {
      Object.assign(req.query, result.data);
    } else {
      req[property] = result.data;
    }
    next();
  };

export default validateSchemaMiddleware;