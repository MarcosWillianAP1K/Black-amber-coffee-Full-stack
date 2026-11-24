import type { NextFunction, Request, Response } from "express";

type UserRole = "admin" | "worker" | "user";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Token de autenticação não fornecido.",
        },
      });
      return;
    }

    const userRole: UserRole = req.user.isAdmin
      ? "admin"
      : req.user.role
        ? "worker"
        : "user";

    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Acesso negado. Você não tem permissão para esta operação.",
        },
      });
      return;
    }

    next();
  };
}

export function requireAdmin() {
  return requireRole("admin");
}

export function requireWorker() {
  return requireRole("worker", "admin");
}
