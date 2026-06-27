/**
 * Testes de Integração — Backend (4.3 Testes)
 *
 * Testa as rotas HTTP reais via supertest, mockando camadas de DB e serviços.
 *
 *  1.  GET  /v1/api/health          → 200 + campos esperados
 *  2.  GET  /v1/api/metrics         → 200 + 10 métricas
 *  3.  GET  /rota-inexistente       → 404 NOT_FOUND
 *  4.  POST /v1/api/register        → 400 se body inválido (sem campos)
 *  5.  POST /v1/api/register        → 400 se senha fraca
 *  6.  POST /v1/api/register        → 201 com dados válidos (mock DB)
 *  7.  POST /v1/api/register        → 400 se email já existir
 *  8.  POST /v1/api/login           → 400 se body inválido
 *  9.  POST /v1/api/login           → 401 se credenciais erradas
 * 10.  POST /v1/api/login           → 201 com credenciais válidas (mock DB)
 * 11.  Headers de segurança (ASVS)  → X-Content-Type-Options presente
 * 12.  POST body > 1MB              → 413 Payload Too Large
 */

import request from "supertest";
import { createTestApp } from "./test-app";

// ── Mock: env (evita process.exit em CI) ──────────────────────────────────
jest.mock("@/config/env", () => ({
  env: {
    NODE_ENV: "test",
    isDev: false,
    PORT: 3000,
    JWT_SECRET: "test_jwt_secret_at_least_16chars",
    JWT_EXPIRATION: "15m",
    JWT_SECRET_REFRESH: "test_refresh_secret_16chars",
    REFRESH_SECRET: "test_refresh_secret_16chars",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    RESEND_API_KEY: "re_test_key",
    SYSTEM_MAIL_ADDR: "test@test.com",
    BUCKET_NAME: "bucket",
    BUCKET_ACCESS_KEY: "key",
    BUCKET_SECRET_KEY: "secret",
    BUCKET_URL: "http://localhost:9000",
    BUCKET_REGION: "us-east-1",
  },
}));

// ── Mock: database ─────────────────────────────────────────────────────────
jest.mock("@/config/database", () => ({
  db: {},
}));

// ── Mock: mail service ─────────────────────────────────────────────────────
jest.mock("@/infra/mail", () => ({
  mailService: { send: jest.fn().mockResolvedValue(undefined) },
}));

// ── Mock: auth repository ──────────────────────────────────────────────────

jest.mock("@/modules/auth/auth.repository", () => {
  const user = {
    id: 1,
    publicId: "pub-test-001",
    email: "user@test.com",
    name: "Test User",
    password: "$2b$10$hashedpasswordfortesting1234567",
    phone: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return jest.fn().mockImplementation(() => ({
    getByEmail: jest.fn().mockImplementation(async (email: string) => {
      if (email === "user@test.com") {
        return { type: "user", user, role: null, isAdmin: false };
      }
      return null;
    }),
    create: jest.fn().mockResolvedValue(user),
    getById: jest.fn().mockResolvedValue({ type: "user", user }),
    createPasswordReset: jest.fn(),
    getPasswordResetByCode: jest.fn(),
    markPasswordResetAsUsed: jest.fn(),
    updateUserPassword: jest.fn(),
  }));
});

// ── Mock: bcrypt.compare para senha correta ────────────────────────────────
jest.mock("bcrypt", () => ({
  ...jest.requireActual("bcrypt"),
  compare: jest.fn().mockImplementation(async (plain: string) => {
    return plain === "Senha123";
  }),
  hash: jest.fn().mockResolvedValue("$2b$10$mocked_hash"),
}));

// ── App ────────────────────────────────────────────────────────────────────
let app: ReturnType<typeof createTestApp>;

beforeAll(() => {
  app = createTestApp();
});

// ── Testes ─────────────────────────────────────────────────────────────────

describe("GET /v1/api/health", () => {
  it("1. deve retornar 200 e status ok", async () => {
    const res = await request(app).get("/v1/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });
});

describe("GET /v1/api/metrics", () => {
  it("2. deve retornar 200 com 10 métricas", async () => {
    const res = await request(app).get("/v1/api/metrics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const keys = Object.keys(res.body.metrics);
    expect(keys.length).toBe(10);
  });
});

describe("Rota não encontrada", () => {
  it("3. deve retornar 404 para rotas inexistentes", async () => {
    const res = await request(app).get("/v1/api/nao-existe");
    expect(res.status).toBe(404);
  });
});

describe("POST /v1/api/auth/register", () => {
  it("4. deve retornar 400 se body estiver vazio", async () => {
    const res = await request(app).post("/v1/api/auth/register").send({});
    expect(res.status).toBe(400);
  });

  it("5. deve retornar 400 se senha for fraca (sem maiúscula ou número)", async () => {
    const res = await request(app).post("/v1/api/auth/register").send({
      name: "Test",
      email: "new@test.com",
      password: "fraca",
    });
    expect(res.status).toBe(400);
  });

  it("6. deve retornar 201 com dados válidos", async () => {
    const res = await request(app).post("/v1/api/auth/register").send({
      name: "New User",
      email: "new@test.com",
      password: "Senha123",
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("email");
  });

  it("7. deve retornar 400 se email já existir", async () => {
    const res = await request(app).post("/v1/api/auth/register").send({
      name: "Test User",
      email: "user@test.com",
      password: "Senha123",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /v1/api/auth/login", () => {
  it("8. deve retornar 400 se body inválido", async () => {
    const res = await request(app).post("/v1/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("9. deve retornar 401 com credenciais erradas", async () => {
    const res = await request(app).post("/v1/api/auth/login").send({
      email: "user@test.com",
      password: "SenhaErrada1",
    });
    expect(res.status).toBe(401);
  });

  it("10. deve retornar 201 com credenciais válidas", async () => {
    const res = await request(app).post("/v1/api/auth/login").send({
      email: "user@test.com",
      password: "Senha123",
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });
});

describe("Headers de segurança (ASVS 14.4.1)", () => {
  it("11. deve incluir X-Content-Type-Options nas respostas", async () => {
    const res = await request(app).get("/v1/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
  });
});

describe("bodySizeLimit middleware (ASVS 12.1.1)", () => {
  it("12. deve chamar res.status(413) quando Content-Length > 1MB", () => {
    const { bodySizeLimit } = require("@/shared/middlewares/security.middleware");

    const mockReq = {
      headers: { "content-length": "2000000" },
    } as unknown as import("express").Request;

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockRes = { status: mockStatus } as unknown as import("express").Response;
    const mockNext = jest.fn();

    bodySizeLimit(mockReq, mockRes, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(413);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: "PAYLOAD_TOO_LARGE" }) })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
