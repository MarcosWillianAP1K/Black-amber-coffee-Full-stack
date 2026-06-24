/**
 * Auth domain types aligned with backend auth schema.
 */

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

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

export type UserType = "user" | "worker";

export interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            publicId: string;
            email: string;
            userType: UserType;
            role?: string | null;
            profile: ProfileResponse;
        };
    };
}

export interface SendPasswordResetInput {
    email: string;
}

export interface CheckPasswordResetInput {
    userTokenId: string;
    code: string;
}

export interface ResetPasswordInput {
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface RefreshTokenInput {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface LogoutInput {
    refreshToken: string;
    logoutAllDevices?: boolean;
}

export interface LogoutResponse {
    data: {
        success: boolean;
    };
}

export interface SendPasswordResetResponse {
    email: string;
    userTokenId: string | null;
    expiresAt: string;
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
