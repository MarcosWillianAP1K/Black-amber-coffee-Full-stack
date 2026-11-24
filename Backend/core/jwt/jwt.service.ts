import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JWTPayload {
  id: number;
  email: string;
  publicId: string;
  role?: string;
  isAdmin?: boolean;
}

export interface PasswordResetPayload {
  userId: number;
  publicUserId: string;
}

export class JWTService {
  private readonly secret: string;
  private readonly expiration: SignOptions["expiresIn"];
  private readonly refreshSecret: string;

  constructor() {
    this.secret = env.JWT_SECRET;
    this.expiration = this.normalizeExpiration(env.JWT_EXPIRATION);
    this.refreshSecret = env.JWT_SECRET_REFRESH ?? env.REFRESH_SECRET ?? env.JWT_SECRET;
  }

  private normalizeExpiration(value: string | undefined): SignOptions["expiresIn"] {
    if (!value) return "15m";
    const cleaned = value
      .split("///")[0]
      .trim()
      .replace(/^['"]|['"]$/g, "");
    return (cleaned || "15m") as SignOptions["expiresIn"];
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiration });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch {
      return null;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;
    return parts[1];
  }

  generateRefreshToken(publicId: string): string {
    return jwt.sign({ id: publicId }, this.refreshSecret, { expiresIn: "30d" });
  }

  verifyRefreshToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, this.refreshSecret) as { id: string };
    } catch {
      return null;
    }
  }

  generatePasswordResetToken(payload: PasswordResetPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: "10m" });
  }

  verifyPasswordResetToken(token: string): PasswordResetPayload | null {
    try {
      return jwt.verify(token, this.secret) as PasswordResetPayload;
    } catch {
      return null;
    }
  }
}
