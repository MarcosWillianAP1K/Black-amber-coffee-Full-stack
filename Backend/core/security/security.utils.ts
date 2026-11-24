import crypto from "node:crypto";
import * as bcrypt from "bcrypt";

export class SecurityUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generatePublicId(): string {
    return crypto.randomUUID();
  }

  static generateOrderCode(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const random = crypto.randomInt(0, 10000).toString().padStart(4, "0");
    return `ORD-${y}${m}${d}-${random}`;
  }
}
