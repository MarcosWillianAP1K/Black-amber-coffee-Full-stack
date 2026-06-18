import { Request, Response, NextFunction } from "express";
import JWTservice from "@/core/jwt.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        publicId?: string;
        isAdmin?: boolean;
      };
    }
  }
}

const jwtservice = new JWTservice();

export function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtservice.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        detail: "Token not found",
      });
      return;
    }

    const payload = jwtservice.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        detail: "Token expired or invalid",
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      detail: "Failed to authenticate",
    });
  }
}
