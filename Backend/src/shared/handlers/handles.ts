import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import helpers from "../helpers";
import { env } from "../../config/env";
import { logger } from "../errors";

const error = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Full error:", err);
  let code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  if (err instanceof ZodError) {
    console.error("ZodError details:", JSON.stringify((err as any).errors, null, 2));
    code = "BAD_REQUEST";
  }

  const mapped = helpers[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  if (env.isDev && mapped.status == 500) {
    logger.error(code);
    mapped.message = code;
  }

  if (mapped.status == 500) {
    code = "INTERNAL_ERROR";
  }

  return res.status(mapped.status).json({
    error: {
      code,
      message: mapped.message,
      details: err instanceof ZodError ? (err as any).errors : undefined
    },
  });
};
export default {
  error,
};
