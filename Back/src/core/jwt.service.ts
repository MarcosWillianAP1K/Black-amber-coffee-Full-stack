import jwt from "jsonwebtoken";
import { env } from "../config/env";
/**
 * Interface for validate a token per role and type of user
 */
interface JWTPayload {
  id: number;
  email: string;
  publicId?: string;
  role?: string;
}

interface PasswordResetPayload {
  userId: number;
  publicUserId: string;
}

export default class JWTservice {
  private secret: string;
  private expriration: string;
  private refresh: string;

  constructor() {
    this.secret = env.JWT_SECRET ?? "seu_secret_padrao";
    this.expriration = this.normalizeExpiration(env.JWT_EXPIRATION);
    this.refresh =
      env.JWT_SECRET_REFRESH ?? env.REFRESH_SECRET ?? "seu_refresh_aqui";
  }

  private normalizeExpiration(value: string | undefined): string {
    if (!value) {
      return "30d";
    }

    const cleaned = value
      .split("///")[0]
      .trim()
      .replace(/^['\"]|['\"]$/g, "");

    return cleaned || "30d";
  }

  /**
   * Gerar o token JWT
   * @param payload
   * @returns retorna que o uruario estara logado até que sua section de 7d acabe
   */

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expriration as any,
    });
  }

  /**
   * Verificar o token do usuario ao fazer login
   * @param token
   * @returns o decoded para ver se é valido
   */

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrair o token do cabeçalho para poder checar no middleWare ou em outras instancias se existe
   * @param authHeader passo o header do json, separo em partes se for diferente 1 (token) ou  0 tipo do token retorno null se não retorno o token
   * @returns token do usuario passado via json (web né vida)
   */

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, this.refresh!, { expiresIn: "30d" });
  }

  /**
   * Verificar o refresh token do usuario
   * @param token
   * @returns o decoded para ver se é valido
   */
  verifyRefreshToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, this.refresh!) as { id: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  generatePasswordResetToken(payload: PasswordResetPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: "10m",
    });
  }

  verifyPasswordResetToken(token: string): PasswordResetPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as PasswordResetPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
