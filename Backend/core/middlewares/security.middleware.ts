import type { NextFunction, Request, Response } from "express";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const AUTH_RATE_LIMIT_MAX = 25;
const API_RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const SENSITIVE_FIELDS = new Set([
  "password",
  "newPassword",
  "confirmNewPassword",
  "token",
  "refreshToken",
  "accessToken",
  "code",
]);

function maskSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = SENSITIVE_FIELDS.has(key) ? "***REDACTED***" : obj[key];
  }
  return result;
}

export function secureHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.removeHeader("X-Powered-By");
  next();
}

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  if (req.path.endsWith("/health") || req.path === "/") {
    next();
    return;
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : undefined) ||
    req.socket.remoteAddress ||
    "unknown";

  const isAuthRoute = req.path.includes("/auth/");
  const bucketKey = `${ip}:${isAuthRoute ? "auth" : "api"}`;
  const maxRequests = isAuthRoute ? AUTH_RATE_LIMIT_MAX : API_RATE_LIMIT_MAX;
  const now = Date.now();

  const entry = rateLimitStore.get(bucketKey);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(bucketKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
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

export function bodySizeLimit(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers["content-type"] ?? "";
  if (contentType.startsWith("multipart/form-data")) {
    next();
    return;
  }

  const MAX_BYTES = 1_048_576;
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

export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  const sensitiveRoutes = ["/login", "/register", "/refresh", "/forgotpassword"];
  const isSensitive = sensitiveRoutes.some((r) => req.path.includes(r));

  if (isSensitive) {
    const safeBody =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? maskSensitiveFields(req.body as Record<string, unknown>)
        : {};

    console.log(
      `[SECURITY] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | body: ${JSON.stringify(safeBody)}`,
    );

    res.on("finish", () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(
          `[SECURITY ALERT] Failed auth attempt | ${req.method} ${req.originalUrl} | status: ${res.statusCode}`,
        );
      }
    });
  }

  next();
}
