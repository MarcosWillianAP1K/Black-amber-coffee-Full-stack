import type { User, GetUserResponse } from "shared-utils/types/user";
import type { LoginResponse, RegisterResponse, RefreshTokenResponse, LogoutResponse } from "shared-utils/types/auth";
import { API } from "shared-utils/core/APIroutes";

export interface AuthResponse {
    token: string | null;
    refreshToken?: string;
    user: User;
}

interface ApiErrorPayload {
    message?: string;
    error?: {
        code?: string;
        message?: string;
    };
}

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
    if (response.status === 429) {
        return "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
    }
    try {
        const body = (await response.json()) as ApiErrorPayload;
        const msg = body?.error?.message ?? body?.message;
        if (msg && msg.trim().length > 0) {
            return msg;
        }
    } catch {
        // ignore JSON parse failure
    }
    if (response.status === 401) return "E-mail ou senha incorretos.";
    if (response.status === 403) return "Esta conta está desativada. Procure o atendimento.";
    return fallback;
}

async function apiGetMe(accessToken?: string): Promise<User> {
    const token = accessToken ?? getStoredToken();
    if (!token) throw new Error("Token de acesso ausente.");

    const response = await fetch(API.Users.GetMe, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Falha ao carregar os dados do perfil.");
    const payload = (await response.json()) as GetUserResponse;
    return payload.data;
}

async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API.Auth.Login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const message = await extractErrorMessage(response, "E-mail ou senha incorretos.");
        throw new Error(message);
    }

    const payload = (await response.json()) as LoginResponse;
    const { accessToken, refreshToken, user } = payload.data;

    if (user.userType !== "user") {
        throw new Error("Use o painel operacional para acessar como funcionário.");
    }

    const profile = await apiGetMe(accessToken);

    return { token: accessToken, refreshToken, user: profile };
}

async function apiRegister(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    const response = await fetch(API.Auth.Register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
    });

    if (!response.ok) {
        if (response.status === 409) throw new Error("Este e-mail já está cadastrado.");
        const message = await extractErrorMessage(response, "Falha ao criar conta. Confira os dados informados.");
        throw new Error(message);
    }

    const payload = (await response.json()) as RegisterResponse;
    const { publicId, email: registeredEmail, profile, createdAt, updatedAt } = payload.data;

    const loginData = await apiLogin(registeredEmail, password);
    if (loginData.user.publicId !== publicId) {
        loginData.user = {
            publicId,
            fullName: profile.fullName,
            email: registeredEmail,
            phone: profile.phone,
            avatarUrl: profile.avatarUrl,
            isActive: true,
            createdAt,
            updatedAt,
        };
    }

    return loginData;
}

function persistSession(data: AuthResponse): void {
    if (data.token) localStorage.setItem("token", data.token);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
}

export async function loginService(email: string, password: string): Promise<AuthResponse> {
    const data = await apiLogin(email, password);
    persistSession(data);
    return data;
}

export async function registerService(
    name: string,
    email: string,
    password: string,
    phone?: string,
): Promise<AuthResponse> {
    const data = await apiRegister(name, email, password, phone);
    persistSession(data);
    return data;
}

export async function refreshTokenService(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(API.Auth.RefreshToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Falha ao renovar sessão.");

    const data = (await response.json()) as RefreshTokenResponse;
    localStorage.setItem("token", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    return data;
}

export async function logoutApiService(
    refreshToken: string,
    logoutAllDevices = false,
): Promise<LogoutResponse> {
    const response = await fetch(API.Auth.Logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, logoutAllDevices }),
    });

    if (!response.ok) throw new Error("Falha ao encerrar sessão.");
    return response.json();
}

export function logoutService(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function getStoredToken(): string | null {
    return localStorage.getItem("token");
}

export function getStoredRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
}
