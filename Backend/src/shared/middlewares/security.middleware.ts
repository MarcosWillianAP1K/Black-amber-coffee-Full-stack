/**
 * Security Middleware — OWASP ASVS Rules
 *
 * Rule 1 (ASVS 14.4.1): Secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * Rule 2 (ASVS 4.2.1):  Basic rate limiting per IP to prevent brute-force
 * Rule 3 (ASVS 12.1.1): Request body size enforcement (max 1MB)
 * Rule 4 (ASVS 7.1.1):  Security event logging (auth attempts, errors)
 * Rule 5 (ASVS 8.3.1):  Sensitive data masking in logs (password, token fields stripped)
 */

import { Request, Response, NextFunction } from "express";

// ── Rule 2: In-memory rate limiter (per IP, 100 req / 15 min) ──────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ── Rule 5: Fields to strip from logged bodies ─────────────────────────────
const SENSITIVE_FIELDS = ["password", "newPassword", "token", "refreshToken", "accessToken", "code"];

function maskSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = SENSITIVE_FIELDS.includes(key) ? "***REDACTED***" : obj[key];
  }
  return result;
}

// ── Rule 1: Secure HTTP headers ────────────────────────────────────────────
export function secureHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.removeHeader("X-Powered-By");
  next();
}

// ── Rule 2: Rate limiting ──────────────────────────────────────────────────
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Muitas requisições. Tente novamente em 15 minutos.",
      },
    });
    return;
  }

  next();
}

// ── Rule 3: Request body size limit (1 MB) ─────────────────────────────────
export function bodySizeLimit(req: Request, res: Response, next: NextFunction): void {
  const MAX_BYTES = 1_048_576; // 1 MB
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);

  if (contentLength > MAX_BYTES) {
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Corpo da requisição excede o limite de 1MB.",
      },
    });
    return;
  }

  next();
}

// ── Rule 4: Security event logging ────────────────────────────────────────
export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  const sensitiveRoutes = ["/login", "/register", "/refresh", "/reset-password", "/send-password-reset"];
  const isSensitive = sensitiveRoutes.some((r) => req.path.includes(r));

  if (isSensitive) {
    const safeBody = req.body && typeof req.body === "object"
      ? maskSensitiveFields(req.body as Record<string, unknown>)
      : {};

    console.log(
      `[SECURITY] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${req.socket.remoteAddress} | body: ${JSON.stringify(safeBody)}`
    );

    res.on("finish", () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(
          `[SECURITY ALERT] Failed auth attempt | ${req.method} ${req.originalUrl} | status: ${res.statusCode} | IP: ${req.socket.remoteAddress}`
        );
      }
    });
  }

  next();
}
