/**
 * Testes unitários — authService (4.3 Testes)
 *
 * Cobre os fluxos principais:
 *  1. create()        — registro com email já existente
 *  2. create()        — registro com sucesso
 *  3. login()         — credenciais inválidas (usuário não encontrado)
 *  4. login()         — credenciais inválidas (senha errada)
 *  5. login()         — login com sucesso
 *  6. refreshToken()  — token inválido
 *  7. refreshToken()  — sucesso
 *  8. logout()        — refresh token inválido
 *  9. logout()        — sucesso
 */

import authService from "@/modules/auth/auth.service";
import SecurityUtils from "@/core/security";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockAuthRepo = {
  getByEmail: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  createPasswordReset: jest.fn(),
  getPasswordResetByCode: jest.fn(),
  markPasswordResetAsUsed: jest.fn(),
  updateUserPassword: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn().mockReturnValue("access_token"),
  generateRefreshToken: jest.fn().mockReturnValue("refresh_token"),
  verifyRefreshToken: jest.fn(),
  generatePasswordResetToken: jest.fn().mockReturnValue("reset_token"),
  verifyPasswordResetToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
  verifyToken: jest.fn(),
};

// Stub mailService used inside authService
jest.mock("@/infra/mail", () => ({
  mailService: { send: jest.fn().mockResolvedValue(undefined) },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────

const fakeUser = {
  id: 1,
  publicId: "pub-123",
  email: "user@test.com",
  name: "Test User",
  phone: null,
  avatarUrl: null,
  password: "hashed_password",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const fakeAuthEntity = {
  type: "user",
  user: fakeUser,
  role: null,
  isAdmin: false,
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe("authService", () => {
  let service: authService;

  beforeEach(() => {
    service = new authService(mockAuthRepo as any, mockJwtService as any);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe("create()", () => {
    it("deve lançar erro se email já está em uso", async () => {
      mockAuthRepo.getByEmail.mockResolvedValueOnce(fakeAuthEntity);

      await expect(
        service.create({
          name: "Test",
          email: "user@test.com",
          password: "Senha123",
        })
      ).rejects.toThrow("EMAIL_ALREADY_IN_USE");
    });

    it("deve registrar novo usuário com sucesso", async () => {
      mockAuthRepo.getByEmail.mockResolvedValueOnce(null);
      mockAuthRepo.create.mockResolvedValueOnce(fakeUser);
      jest.spyOn(SecurityUtils, "hashPassword").mockResolvedValueOnce("hashed");

      const result = await service.create({
        name: "Test User",
        email: "user@test.com",
        password: "Senha123",
      });

      expect(result.data.email).toBe("user@test.com");
      expect(result.data.publicId).toBe("pub-123");
    });
  });

  // ── login ───────────────────────────────────────────────────────────────

  describe("login()", () => {
    it("deve lançar erro se usuário não existe", async () => {
      mockAuthRepo.getByEmail.mockResolvedValueOnce(null);

      await expect(
        service.login({ email: "no@test.com", password: "Senha123" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("deve lançar erro se senha está incorreta", async () => {
      mockAuthRepo.getByEmail.mockResolvedValueOnce(fakeAuthEntity);
      jest.spyOn(SecurityUtils, "comparePassword").mockResolvedValueOnce(false);

      await expect(
        service.login({ email: "user@test.com", password: "WrongPass1" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("deve retornar tokens no login bem-sucedido", async () => {
      mockAuthRepo.getByEmail.mockResolvedValueOnce(fakeAuthEntity);
      jest.spyOn(SecurityUtils, "comparePassword").mockResolvedValueOnce(true);

      const result = await service.login({
        email: "user@test.com",
        password: "Senha123",
      });

      expect(result.data.accessToken).toBe("access_token");
      expect(result.data.refreshToken).toBe("refresh_token");
      expect(result.data.user.email).toBe("user@test.com");
    });
  });

  // ── refreshToken ────────────────────────────────────────────────────────

  describe("refreshToken()", () => {
    it("deve lançar erro para refresh token inválido", async () => {
      mockJwtService.verifyRefreshToken.mockReturnValueOnce(null);

      await expect(
        service.refreshToken({ refreshToken: "bad_token" })
      ).rejects.toThrow("INVALID_REFRESH_TOKEN");
    });

    it("deve retornar novos tokens com refresh token válido", async () => {
      mockJwtService.verifyRefreshToken.mockReturnValueOnce({ id: "pub-123" });
      mockAuthRepo.getById.mockResolvedValueOnce(fakeAuthEntity);

      const result = await service.refreshToken({ refreshToken: "good_token" });

      expect(result.data.accessToken).toBe("access_token");
      expect(result.data.refreshToken).toBe("refresh_token");
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────

  describe("logout()", () => {
    it("deve lançar erro para refresh token inválido", async () => {
      mockJwtService.verifyRefreshToken.mockReturnValueOnce(null);

      await expect(
        service.logout({ refreshToken: "bad_token", logoutAllDevices: false })
      ).rejects.toThrow("INVALID_REFRESH_TOKEN");
    });

    it("deve efetuar logout com sucesso", async () => {
      mockJwtService.verifyRefreshToken.mockReturnValueOnce({ id: "pub-123" });
      mockAuthRepo.getById.mockResolvedValueOnce(fakeAuthEntity);

      const result = await service.logout({
        refreshToken: "good_token",
        logoutAllDevices: false,
      });

      expect(result.data.success).toBe(true);
    });
  });
});
