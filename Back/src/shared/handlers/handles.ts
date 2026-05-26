import { Response } from "express";
import helpers from "@/shared/helpers";
import { env } from "@/config/env";
import { logger } from "@/shared/errors";

const error = (res: Response, err: unknown) => {
  let code = err instanceof Error ? err.message : "INTERNAL_ERROR";

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
    },
  });
};
export default {
  error,
};
