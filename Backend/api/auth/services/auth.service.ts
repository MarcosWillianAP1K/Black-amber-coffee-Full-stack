import crypto from "node:crypto";
import { JWTService } from "../../../core/jwt/jwt.service.js";
import { SecurityUtils } from "../../../core/security/security.utils.js";
import { mailService } from "../../../core/mail/mail.service.js";
import { AuthModel } from "../models/auth.model.js";
import type {
  RegisterInput,
  RegisterResponse,
  LoginInput,
  LoginResponse,
  RefreshTokenInput,
  RefreshTokenResponse,
  LogoutInput,
  LogoutResponse,
  SendPasswordResetInput,
  SendPasswordResetResponse,
  CheckPasswordResetInput,
  CheckPasswordResetResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from "../dtos/auth.dto.js";

const jwtService = new JWTService();

export class AuthService {
  static async register(data: RegisterInput): Promise<RegisterResponse> {
    const existing = await AuthModel.findByEmail(data.email);
    if (existing) {
      throw new Error("EMAIL_ALREADY_IN_USE");
    }

    const hashedPassword = await SecurityUtils.hashPassword(data.password);
    const created = await AuthModel.createClient({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    });

    return {
      data: {
        publicId: created.publicId,
        email: created.email,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        profile: {
          fullName: created.name,
          phone: created.phone,
          avatarUrl: created.avatarUrl,
          createdAt: created.createdAt,
        },
      },
    };
  }

  static async login(data: LoginInput): Promise<LoginResponse> {
    const authEntity = await AuthModel.findByEmail(data.email);
    if (!authEntity) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      data.password,
      authEntity.user.password,
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!authEntity.user.isActive) {
      throw new Error("ACCOUNT_DEACTIVATED");
    }

    const isWorker = authEntity.type === "worker";

    const accessToken = jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = jwtService.generateRefreshToken(authEntity.user.publicId);

    return {
      data: {
        accessToken,
        refreshToken,
        user: {
          publicId: authEntity.user.publicId,
          email: authEntity.user.email,
          userType: isWorker ? "worker" : "user",
          role: isWorker ? authEntity.role ?? null : null,
          profile: {
            fullName: authEntity.user.name,
            phone: authEntity.user.phone,
            avatarUrl: authEntity.user.avatarUrl,
            createdAt: authEntity.user.createdAt,
            updatedAt: authEntity.user.updatedAt,
          },
        },
      },
    };
  }

  static async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    const decoded = jwtService.verifyRefreshToken(data.refreshToken);
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await AuthModel.findByPublicId(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!authEntity.user.isActive) {
      throw new Error("ACCOUNT_DEACTIVATED");
    }

    const isWorker = authEntity.type === "worker";

    const accessToken = jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = jwtService.generateRefreshToken(authEntity.user.publicId);

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async logout(data: LogoutInput): Promise<LogoutResponse> {
    const decoded = jwtService.verifyRefreshToken(data.refreshToken);
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await AuthModel.findByPublicId(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      data: {
        success: true,
      },
    };
  }

  static async sendPasswordReset(data: SendPasswordResetInput): Promise<SendPasswordResetResponse> {
    const authEntity = await AuthModel.findByEmail(data.email);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!authEntity) {
      return {
        email: data.email,
        userTokenId: null,
        expiresAt,
      };
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const userToken = await AuthModel.createPasswordReset(data.email, code, expiresAt);

    await mailService.send({
      schema: "PASSWORD_RESET",
      to: authEntity.user.email,
      data: { code },
    });

    return {
      email: data.email,
      userTokenId: userToken.code,
      expiresAt,
    };
  }

  static async checkPasswordReset(data: CheckPasswordResetInput): Promise<CheckPasswordResetResponse> {
    const reset = await AuthModel.getPasswordResetByCode(data.code);
    if (!reset) {
      throw new Error("NOT_FOUND");
    }

    if (reset.expiresAt < new Date()) {
      throw new Error("EXPIRED_CODE");
    }

    if (reset.used) {
      throw new Error("CODE_ALREADY_USED");
    }

    const authEntity = await AuthModel.findByEmail(reset.email);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    await AuthModel.markPasswordResetAsUsed(data.code);

    const resetToken = jwtService.generatePasswordResetToken({
      userId: authEntity.user.id,
      publicUserId: authEntity.user.publicId,
    });

    return { resetToken };
  }

  static async resetPassword(data: ResetPasswordInput): Promise<ResetPasswordResponse> {
    const decoded = jwtService.verifyPasswordResetToken(data.resetToken);
    if (!decoded) {
      throw new Error("INVALID_TOKEN");
    }

    const authEntity = await AuthModel.findByPublicId(decoded.publicUserId);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!authEntity.user.isActive) {
      throw new Error("ACCOUNT_DEACTIVATED");
    }

    const hashedPassword = await SecurityUtils.hashPassword(data.newPassword);
    await AuthModel.updatePasswordByPublicId(
      authEntity.user.publicId,
      authEntity.type,
      hashedPassword,
    );

    const isWorker = authEntity.type === "worker";
    const accessToken = jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = jwtService.generateRefreshToken(authEntity.user.publicId);

    return {
      accessToken,
      refreshToken,
      user: {
        publicId: authEntity.user.publicId,
        email: authEntity.user.email,
        profile: {
          fullName: authEntity.user.name,
          phone: authEntity.user.phone,
          avatarUrl: authEntity.user.avatarUrl,
          createdAt: authEntity.user.createdAt,
        },
      },
    };
  }
}
