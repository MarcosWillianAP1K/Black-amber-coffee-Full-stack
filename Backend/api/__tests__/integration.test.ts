import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

const mockCheckDatabaseHealth = vi.hoisted(() => vi.fn());
const mockPoolQuery = vi.hoisted(() => vi.fn());
const mockWithTransaction = vi.hoisted(() => vi.fn());
const mockComparePassword = vi.hoisted(() => vi.fn());
const mockHashPassword = vi.hoisted(() => vi.fn());

vi.mock("../../core/database/postgres.client.js", () => ({
  pool: { query: mockPoolQuery },
  checkDatabaseHealth: mockCheckDatabaseHealth,
  withTransaction: mockWithTransaction,
}));

vi.mock("../../core/mail/mail.service.js", () => ({
  mailService: { send: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../../core/security/security.utils.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../core/security/security.utils.js")>();
  return {
    SecurityUtils: {
      ...actual.SecurityUtils,
      hashPassword: mockHashPassword,
      comparePassword: mockComparePassword,
    },
  };
});

import { createApp } from "../../src/server.js";
import { JWTService } from "../../core/jwt/jwt.service.js";
import { buildPublicAssetUrl } from "../../core/storage/bucket.provider.js";
import { bodySizeLimit } from "../../core/middlewares/security.middleware.js";

const now = new Date("2026-11-23T12:00:00.000Z");

const activeClientRow = {
  id: 1,
  public_id: "11111111-1111-4111-8111-111111111111",
  full_name: "Test Client",
  email: "user@test.com",
  password: "$2b$10$hashedpasswordfortesting1234567",
  phone: null,
  avatar_url: null,
  is_active: true,
  created_at: now,
  updated_at: now,
};

const inactiveClientRow = {
  ...activeClientRow,
  id: 2,
  public_id: "22222222-2222-4222-8222-222222222222",
  email: "blocked@test.com",
  is_active: false,
};

const activeAdminWorkerRow = {
  id: 10,
  public_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  full_name: "Gerente Black Amber",
  email: "admin@blackamber.com",
  password: "$2b$10$hashedpasswordfortesting1234567",
  phone: "11999999999",
  avatar_url: null,
  role: "gerente" as const,
  salary: "5500.00",
  is_admin: true,
  is_active: true,
  created_at: now,
  updated_at: now,
};

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp({ enableRateLimit: false });
});

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckDatabaseHealth.mockResolvedValue({ connected: true, latencyMs: 4 });
  mockHashPassword.mockResolvedValue("$2b$10$mocked_hash");
  mockComparePassword.mockImplementation(async (plain: string) => plain === "Senha123");
});

describe("Health & Metrics Endpoints", () => {
  it("GET /v1/api/health retorna 200 com status do banco e latência", async () => {
    const res = await request(app).get("/v1/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("connected");
    expect(typeof res.body.dbLatencyMs).toBe("number");
  });

  it("GET /v1/api/health retorna 503 quando o PostgreSQL está inacessível", async () => {
    mockCheckDatabaseHealth.mockResolvedValueOnce({ connected: false, latencyMs: 120 });
    const res = await request(app).get("/v1/api/health");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.database).toBe("disconnected");
  });

  it("GET /v1/api/metrics retorna 200 com 10 métricas", async () => {
    const res = await request(app).get("/v1/api/metrics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Object.keys(res.body.metrics)).toHaveLength(10);
  });

  it("Rota inexistente retorna 404", async () => {
    const res = await request(app).get("/v1/api/nao-existe");
    expect(res.status).toBe(404);
  });
});

describe("Auth Routes & Account Status", () => {
  it("POST /v1/api/auth/register retorna 400 se body inválido ou senha fraca", async () => {
    const emptyRes = await request(app).post("/v1/api/auth/register").send({});
    expect(emptyRes.status).toBe(400);

    const weakRes = await request(app).post("/v1/api/auth/register").send({
      name: "Teste",
      email: "novo@test.com",
      password: "fraca",
    });
    expect(weakRes.status).toBe(400);
  });

  it("POST /v1/api/auth/register retorna 201 com dados válidos", async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [] }) // clients check
      .mockResolvedValueOnce({ rows: [] }) // workers check
      .mockResolvedValueOnce({ rows: [activeClientRow] }); // insert

    const res = await request(app).post("/v1/api/auth/register").send({
      name: "Test Client",
      email: "novo@test.com",
      password: "Senha123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("user@test.com");
  });

  it("POST /v1/api/auth/register retorna 409 se email já existir", async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [activeClientRow] });

    const res = await request(app).post("/v1/api/auth/register").send({
      name: "Test Client",
      email: "user@test.com",
      password: "Senha123",
    });

    expect(res.status).toBe(409);
  });

  it("POST /v1/api/auth/login retorna 401 com senha errada", async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [activeClientRow] });

    const res = await request(app).post("/v1/api/auth/login").send({
      email: "user@test.com",
      password: "Errada123",
    });

    expect(res.status).toBe(401);
  });

  it("POST /v1/api/auth/login retorna 403 se a conta estiver desativada (is_active = false)", async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [inactiveClientRow] });

    const res = await request(app).post("/v1/api/auth/login").send({
      email: "blocked@test.com",
      password: "Senha123",
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_DEACTIVATED");
  });

  it("POST /v1/api/auth/login retorna 201 com tokens quando credenciais válidas", async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [activeClientRow] });

    const res = await request(app).post("/v1/api/auth/login").send({
      email: "user@test.com",
      password: "Senha123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });
});

describe("Admin Toggle Status (Workers & Users)", () => {
  it("PATCH /v1/api/workers/:publicId/status alterna isActive", async () => {
    const jwt = new JWTService();
    const adminToken = jwt.generateToken({
      id: activeAdminWorkerRow.id,
      email: activeAdminWorkerRow.email,
      publicId: activeAdminWorkerRow.public_id,
      role: "gerente",
      isAdmin: true,
    });

    const targetWorker = { ...activeAdminWorkerRow, public_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", is_active: true };
    const toggledWorker = { ...targetWorker, is_active: false };

    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // AuthMiddleware status check
      .mockResolvedValueOnce({ rows: [targetWorker] }) // WorkerModel.findByPublicId
      .mockResolvedValueOnce({ rows: [toggledWorker] }); // WorkerModel.updateByPublicId

    const res = await request(app)
      .patch(`/v1/api/workers/${targetWorker.public_id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("PATCH /v1/api/users/:publicId/status alterna isActive do cliente", async () => {
    const jwt = new JWTService();
    const adminToken = jwt.generateToken({
      id: activeAdminWorkerRow.id,
      email: activeAdminWorkerRow.email,
      publicId: activeAdminWorkerRow.public_id,
      role: "gerente",
      isAdmin: true,
    });

    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // AuthMiddleware status check
      .mockResolvedValueOnce({ rows: [activeClientRow] }) // UserModel.findByPublicId
      .mockResolvedValueOnce({ rows: [{ ...activeClientRow, is_active: false }] }); // UserModel.updateByPublicId

    const res = await request(app)
      .patch(`/v1/api/users/${activeClientRow.public_id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});

describe("Storage Public URL & ASVS Security", () => {
  it("buildPublicAssetUrl gera URL pública completa para imagens", () => {
    const url = buildPublicAssetUrl("products/123/foto-lg.webp");
    expect(url).toMatch(/^http:\/\/localhost:9000\/test-bucket\/products\/123\/foto-lg\.webp$/);
  });

  it("Headers ASVS estão presentes e bodySizeLimit retorna 413 > 1MB (mas libera multipart/form-data)", async () => {
    const res = await request(app).get("/v1/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");

    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockNext = vi.fn();

    bodySizeLimit(
      { headers: { "content-length": "2000000", "content-type": "application/json" } } as unknown as Request,
      { status: mockStatus } as unknown as Response,
      mockNext,
    );
    expect(mockStatus).toHaveBeenCalledWith(413);
    expect(mockNext).not.toHaveBeenCalled();

    const mockNextMultipart = vi.fn();
    bodySizeLimit(
      { headers: { "content-length": "2000000", "content-type": "multipart/form-data; boundary=---123" } } as unknown as Request,
      { status: mockStatus } as unknown as Response,
      mockNextMultipart,
    );
    expect(mockNextMultipart).toHaveBeenCalledTimes(1);
  });
});
