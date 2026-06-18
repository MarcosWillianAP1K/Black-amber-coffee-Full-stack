import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the authenticated user is an admin worker.
 * Must be used AFTER AuthMiddleware.
 */
export function AdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Token de autenticação não fornecido.",
        },
      });
      return;
    }

    if (!req.user.isAdmin) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message:
            "Acesso negado. Apenas administradores podem realizar esta operação.",
        },
      });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Falha ao verificar permissões de administrador.",
      },
    });
  }
}
