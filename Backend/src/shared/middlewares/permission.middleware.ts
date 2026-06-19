import { Request, Response, NextFunction } from "express";

type UserRole = "admin" | "worker" | "user";

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * Must be used AFTER AuthMiddleware.
 *
 * @param roles - List of roles allowed to access the route
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      // If the user is a client (no role), they're "user" type
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
    } catch (error) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Falha ao verificar permissões.",
        },
      });
    }
  };
}

/**
 * Middleware to check if the authenticated user is an admin.
 * Must be used AFTER AuthMiddleware.
 */
export function requireAdmin() {
  return requireRole("admin");
}

/**
 * Middleware to check if the authenticated user is a worker or admin.
 * Must be used AFTER AuthMiddleware.
 */
export function requireWorker() {
  return requireRole("worker", "admin");
}
