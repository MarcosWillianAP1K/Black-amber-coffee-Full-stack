import type { NextFunction, Request, Response } from "express";
import pino from "pino";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.isTest ? "silent" : env.isDev ? "debug" : "info",
});

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(code: string, statusCode?: number, message?: string) {
    super(code);
    this.code = code;
    this.statusCode = statusCode ?? errorMap[code]?.status ?? 500;
    if (message) {
      this.name = message;
    }
  }
}

export const errorMap: Record<string, { status: number; message: string }> = {
  INVALID_CREDENTIALS: { status: 401, message: "Email ou senha inválidos." },
  INVALID_TOKEN: { status: 401, message: "Token inválido ou expirado." },
  TOKEN_EXPIRED: { status: 401, message: "Token expirado. Faça login novamente." },
  INVALID_REFRESH_TOKEN: { status: 401, message: "Refresh token inválido ou expirado." },
  UNAUTHORIZED: { status: 401, message: "Token de autenticação não fornecido." },
  FORBIDDEN: { status: 403, message: "Acesso negado. Você não tem permissão para esta operação." },
  ACCOUNT_DEACTIVATED: { status: 403, message: "Esta conta está desativada. Contate o administrador." },
  EMAIL_ALREADY_IN_USE: { status: 409, message: "Este email já está registrado." },
  CLIENT_ALREADY_EXISTS: { status: 409, message: "Já existe um cliente com esse email." },
  CLIENT_NOT_FOUND: { status: 404, message: "Cliente não encontrado." },
  USER_NOT_FOUND: { status: 404, message: "Usuário não encontrado." },
  WORKER_ALREADY_EXISTS: { status: 409, message: "Já existe um funcionário com esse email." },
  WORKER_NOT_FOUND: { status: 404, message: "Funcionário não encontrado." },
  WORKER_INACTIVE: { status: 403, message: "Funcionário inativo." },
  ORDER_NOT_FOUND: { status: 404, message: "Pedido não encontrado." },
  ORDER_ALREADY_CANCELLED: { status: 400, message: "O pedido já foi cancelado." },
  INVALID_STATUS: { status: 400, message: "Status inválido." },
  INVALID_STATUS_TRANSITION: { status: 400, message: "Transição de status inválida." },
  PRODUCT_NOT_FOUND: { status: 404, message: "Produto não encontrado." },
  PRODUCT_INACTIVE: { status: 400, message: "Produto inativo." },
  INVENTORY_NOT_FOUND: { status: 404, message: "Item de inventário não encontrado." },
  CART_EMPTY: { status: 400, message: "O carrinho está vazio." },
  CART_ITEM_NOT_FOUND: { status: 404, message: "Item não encontrado no carrinho." },
  PAYMENT_NOT_FOUND: { status: 404, message: "Pagamento não encontrado." },
  INVALID_PAYMENT_METHOD: { status: 400, message: "Método de pagamento inválido." },
  PROFILE_NOT_FOUND: { status: 404, message: "Perfil não encontrado." },
  INVALID_RESET_CODE: { status: 400, message: "Código de reset inválido." },
  EXPIRED_CODE: { status: 400, message: "Código de reset expirado." },
  CODE_ALREADY_USED: { status: 400, message: "Código de reset já utilizado." },
  PASSWORD_MISMATCH: { status: 400, message: "As senhas não conferem." },
  INVALID_REQUEST: { status: 400, message: "Requisição inválida. Verifique os parâmetros enviados." },
  UPDATE_REQUIRES_FIELDS: { status: 400, message: "Pelo menos um campo deve ser fornecido para atualização." },
  INVALID_FILE_TYPE: { status: 400, message: "Arquivo inválido. Envie uma imagem JPEG, PNG ou WebP." },
  LIMIT_FILE_SIZE: { status: 400, message: "Arquivo muito grande. O limite é 5MB." },
  STORAGE_NOT_CONFIGURED: {
    status: 503,
    message: "Armazenamento de imagens (S3/R2) não configurado nas variáveis de ambiente.",
  },
  MAIL_NOT_CONFIGURED: {
    status: 503,
    message: "Serviço de e-mail (Resend) não configurado nas variáveis de ambiente.",
  },
  NOT_FOUND: { status: 404, message: "Recurso não encontrado." },
  BAD_REQUEST: { status: 400, message: "Solicitação inválida." },
  DATABASE_CONNECTION_ERROR: { status: 500, message: "Erro de conexão com o banco de dados." },
  INTERNAL_ERROR: { status: 500, message: "Erro interno do servidor. Tente novamente mais tarde." },
};

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: err.issues[0]?.message ?? "Dados inválidos na requisição.",
        details: err.issues,
      },
    });
    return;
  }

  let code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  if (err instanceof AppError) {
    code = err.code;
  }

  const mapped = errorMap[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  if (mapped.status === 500) {
    logger.error({ err }, "Erro interno não mapeado");
    code = "INTERNAL_ERROR";
  }

  res.status(mapped.status).json({
    error: {
      code,
      message: env.isDev && mapped.status === 500 && err instanceof Error ? err.message : mapped.message,
    },
  });
}
