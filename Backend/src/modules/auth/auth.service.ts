import JWTservice from "@/core/jwt.service";
import authModel from "@/modules/auth/auth.model";
import authRepository from "@/modules/auth/auth.repository";
import SecurityUtils from "@/core/security";

import {
  RegisterInput,
  RegisterClientSchema,
  RegisterResponse,
  RegisterResponseSchema,
  LoginInput,
  LoginResponse,
  LoginResponseSchema,
  RefreshTokenInput,
  RefreshTokenResponse,
  RefreshTokenResponseSchema,
  LogoutInput,
  LogoutResponse,
  LogoutResponseSchema,
  SendPasswordResetInput,
  SendPasswordResetResponse,
  SendPasswordResetResponseSchema,
  CheckPasswordResetInput,
  CheckPasswordResetResponse,
  CheckPasswordResetResponseSchema,
  ResetPasswordInput,
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
  RefreshtokenSchema,
  LogoutSchema,
  SendPasswordResetSchema,
  CheckPasswordResetSchema,
  ResetPasswordSchema,
} from "./auth.schema";
import { mailService } from "@/infra/mail";

export default class authService {
  private authRepository: authRepository;
  private jwtService: JWTservice;

  constructor(authRepository: authRepository, jwtService: JWTservice) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  async create(data: RegisterInput): Promise<RegisterResponse> {
    const validatedData = RegisterClientSchema.parse(data);

    const existingClient = await this.authRepository.getByEmail(
      validatedData.email,
    );
    if (existingClient) {
      throw new Error("EMAIL_ALREADY_IN_USE");
    }

    validatedData.password = await SecurityUtils.hashPassword(
      validatedData.password,
    );

    const model = authModel.fromCreateData(validatedData);
    const createdClient = await this.authRepository.create(model);

    return RegisterResponseSchema.parse({
      data: {
        publicId: createdClient.publicId,
        email: createdClient.email,
        createdAt: createdClient.createdAt,
        updatedAt: createdClient.updatedAt,
        profile: {
          fullName: createdClient.name,
          phone: createdClient.phone ?? null,
          avatarUrl: createdClient.avatarUrl ?? null,
          createdAt: createdClient.createdAt,
        },
      },
    });
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    const validateData = {
      email: data.email,
      password: data.password,
    };

    const authEntity = await this.authRepository.getByEmail(validateData.email);
    if (!authEntity) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      validateData.password,
      authEntity.user.password,
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isWorker = authEntity.type === "worker";

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

    return LoginResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
        user: {
          publicId: authEntity.user.publicId,
          email: authEntity.user.email,
          userType: isWorker ? "worker" : "user",
          role: isWorker ? authEntity.role : null,
          profile: {
            fullName: authEntity.user.name,
            phone: authEntity.user.phone ?? null,
            avatarUrl: authEntity.user.avatarUrl ?? null,
            createdAt: authEntity.user.createdAt,
            updatedAt: authEntity.user.updatedAt,
          },
        },
      },
    });
  }

  async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    const validatedData = RefreshtokenSchema.parse(data);

    const decoded = this.jwtService.verifyRefreshToken(
      validatedData.refreshToken,
    );
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await this.authRepository.getById(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    const isWorker = authEntity.type === "worker";

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

    return RefreshTokenResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  async logout(data: LogoutInput): Promise<LogoutResponse> {
    const validatedData = LogoutSchema.parse(data);

    const decoded = this.jwtService.verifyRefreshToken(
      validatedData.refreshToken,
    );
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await this.authRepository.getById(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    return LogoutResponseSchema.parse({
      data: {
        success: true,
      },
    });
  }

  async sendPasswordReset(
    data: SendPasswordResetInput,
  ): Promise<SendPasswordResetResponse> {
    const validatedData = SendPasswordResetSchema.parse(data);

    const authEntity = await this.authRepository.getByEmail(
      validatedData.email,
    );

    const genericExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (!authEntity) {
      return SendPasswordResetResponseSchema.parse({
        email: validatedData.email,
        userTokenId: null,
        expiresAt: genericExpiry,
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = genericExpiry;

    const userToken = await this.authRepository.createPasswordReset(
      validatedData.email,
      code,
      expiresAt,
    );

    await mailService.send({
      schema: "PASSWORD_RESET",
      to: authEntity.user.email,
      data: { code },
    });

    return SendPasswordResetResponseSchema.parse({
      email: validatedData.email,
      userTokenId: userToken.code as string | null,
      expiresAt,
    });
  }

  async checkPasswordReset(
    userTokenId: string,
    data: CheckPasswordResetInput,
  ): Promise<CheckPasswordResetResponse> {
    const validatedData = CheckPasswordResetSchema.parse(data);

    const reset = await this.authRepository.getPasswordResetByCode(validatedData.code);
    if (!reset) {
      throw new Error("NOT_FOUND");
    }

    if (reset.expiresAt < new Date()) {
      throw new Error("EXPIRED_CODE");
    }

    if (reset.used) {
      throw new Error("CODE_ALREADY_USED");
    }

    const authEntity = await this.authRepository.getByEmail(reset.email);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    await this.authRepository.markPasswordResetAsUsed(validatedData.code);

    const resetToken = this.jwtService.generatePasswordResetToken({
      userId: authEntity.user.id,
      publicUserId: authEntity.user.publicId,
    });

    return CheckPasswordResetResponseSchema.parse({
      resetToken,
    });
  }

  async resetPassword(
    resetToken: string,
    data: ResetPasswordInput,
  ): Promise<ResetPasswordResponse> {
    const validatedData = ResetPasswordSchema.parse(data);

    const decoded = this.jwtService.verifyPasswordResetToken(resetToken);
    if (!decoded) {
      throw new Error("INVALID_TOKEN");
    }

    const authEntity = await this.authRepository.getById(decoded.publicUserId);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    // Hash a nova senha
    const hashedPassword = await SecurityUtils.hashPassword(
      validatedData.newPassword,
    );

    // Atualizar senha do usuário
    await this.authRepository.updateUserPassword(
      authEntity.user.id,
      hashedPassword,
    );

    const isWorker = authEntity.type === "worker";

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
      ...(isWorker && { role: authEntity.role, isAdmin: authEntity.isAdmin }),
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

    return ResetPasswordResponseSchema.parse({
      accessToken,
      refreshToken,
      user: {
        publicId: authEntity.user.publicId,
        email: authEntity.user.email,
        profile: {
          fullName: authEntity.user.name,
          phone: authEntity.user.phone ?? null,
          avatarUrl: authEntity.user.avatarUrl ?? null,
          createdAt: authEntity.user.createdAt,
        },
      },
    });
  }
}
