import type * as z from "zod";
import type {
  RegisterClientSchema,
  LoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
  SendPasswordResetSchema,
  CheckPasswordResetSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator.js";

export type RegisterInput = z.infer<typeof RegisterClientSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;
export type SendPasswordResetInput = z.infer<typeof SendPasswordResetSchema>;
export type CheckPasswordResetInput = z.infer<typeof CheckPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export interface ProfileResponse {
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterResponse {
  data: {
    publicId: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    profile: ProfileResponse;
  };
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      publicId: string;
      email: string;
      userType: "user" | "worker";
      role?: string | null;
      profile: ProfileResponse;
    };
  };
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutResponse {
  data: {
    success: boolean;
  };
}

export interface SendPasswordResetResponse {
  email: string;
  userTokenId: string | null;
  expiresAt: Date;
}

export interface CheckPasswordResetResponse {
  resetToken: string;
}

export interface ResetPasswordResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    publicId: string;
    email: string;
    profile: ProfileResponse;
  };
}
