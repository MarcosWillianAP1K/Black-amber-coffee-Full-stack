import type { NextFunction, Request, Response } from "express";
import { JWTService } from "../jwt/jwt.service.js";
import { pool } from "../database/postgres.client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        publicId: string;
        role?: string;
        isAdmin?: boolean;
      };
    }
  }
}

const jwtService = new JWTService();

/**
 * Validates the Bearer JWT token and verifies that the account remains active in PostgreSQL.
 */
export async function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Token de autenticação não fornecido." },
      });
      return;
    }

    const payload = jwtService.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        error: { code: "INVALID_TOKEN", message: "Token expirado ou inválido." },
      });
      return;
    }

    const isWorker = payload.role !== undefined || payload.isAdmin === true;
    const table = isWorker ? "public.workers" : "public.clients";

    const statusResult = await pool.query<{ is_active: boolean }>(
      `SELECT is_active FROM ${table} WHERE public_id = $1 LIMIT 1`,
      [payload.publicId],
    );

    if (statusResult.rows.length === 0) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Conta não encontrada." },
      });
      return;
    }

    if (!statusResult.rows[0].is_active) {
      res.status(403).json({
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "Esta conta está desativada. Contate o administrador.",
        },
      });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Falha ao autenticar token." },
    });
  }
}
