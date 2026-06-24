import type { Worker, GetWorkerResponse } from "shared-utils/types/worker";
import type { LoginResponse, RefreshTokenResponse, LogoutResponse } from "shared-utils/types/auth";
import { API } from "shared-utils/core/APIroutes";
import { MOCK_WORKERS } from "shared-utils/MockBD.js";

const USE_MOCK = false;

const DEFAULT_WORKER_ROLE: Worker["role"] = "barista";

export interface AuthResponse {
    token: string | null;
    refreshToken?: string;
    user: Worker;
}

async function mockLogin(email: string, _password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const employee = MOCK_WORKERS.find((e) => e.email === email);
    if (!employee) throw new Error("Email or password incorrect");
    if (!employee.isActive) throw new Error("Account is deactivated");

    return {
        token: `mock-token-${employee.publicId}-${Date.now()}`,
        refreshToken: `mock-refresh-${employee.publicId}-${Date.now()}`,
        user: employee,
    };
}

async function mockSignUp(name: string, email: string, _password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const exists = MOCK_WORKERS.find((e) => e.email === email);
    if (exists) throw new Error("Email already registered");

    const now = new Date().toISOString();
    const newEmployee: Worker = {
        publicId: String(MOCK_WORKERS.length + 1),
        role: DEFAULT_WORKER_ROLE,
        salary: 0,
        isAdmin: false,
        isActive: true,
        email,
        fullName: name,
        phone: null,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
    };

    MOCK_WORKERS.push(newEmployee);

    return {
        token: `mock-token-${newEmployee.publicId}-${Date.now()}`,
        refreshToken: `mock-refresh-${newEmployee.publicId}-${Date.now()}`,
        user: newEmployee,
    };
}

async function mockRefreshToken(_refreshToken: string): Promise<RefreshTokenResponse> {
    await new Promise((r) => setTimeout(r, 200));
    return {
        data: {
            accessToken: `mock-access-${Date.now()}`,
            refreshToken: `mock-refresh-${Date.now()}`,
        },
    };
}

async function mockLogout(_refreshToken: string, _logoutAllDevices: boolean): Promise<LogoutResponse> {
    await new Promise((r) => setTimeout(r, 150));
    return { data: { success: true } };
}

async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API.Auth.Login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Email or password incorrect");
    }

    const payload = (await response.json()) as LoginResponse;
    const { accessToken, refreshToken, user } = payload.data;

    if (user.userType !== "worker") {
        throw new Error("Acesso restrito a funcionários. Use o app do cliente.");
    }

    const worker = await apiGetWorker(accessToken);

    return {
        token: accessToken,
        refreshToken,
        user: worker,
    };
}

async function apiGetWorker(accessToken?: string): Promise<Worker> {
    const token = accessToken ?? getStoredToken();
    if (!token) throw new Error("Access token missing");

    const response = await fetch(API.Workers.GetMe, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Get worker failed");

    const payload = (await response.json()) as GetWorkerResponse;
    return payload.data;
}

async function apiSignUp(name: string, email: string, password: string): Promise<AuthResponse> {
    const token = getStoredToken();

    const response = await fetch(API.AdminWorkers.Register, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            fullName: name,
            email,
            password,
            role: DEFAULT_WORKER_ROLE,
            salary: 0,
        }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Only admins can create workers. Please login as admin first.");
        }
        throw new Error("Failed to create worker account");
    }

    const payload = (await response.json()) as { data: Worker };
    return {
        token: null,
        user: payload.data,
    };
}

async function apiRefreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(API.Auth.RefreshToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Refresh token failed");
    return response.json();
}

async function apiLogout(refreshToken: string, logoutAllDevices: boolean): Promise<LogoutResponse> {
    const response = await fetch(API.Auth.Logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, logoutAllDevices }),
    });

    if (!response.ok) throw new Error("Logout failed");
    return response.json();
}

function persistSession(data: AuthResponse): void {
    if (data.token) localStorage.setItem("token", data.token);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userRole", data.user.isAdmin ? "gerente" : data.user.role);
}

export async function loginService(email: string, password: string): Promise<AuthResponse> {
    const data = USE_MOCK ? await mockLogin(email, password) : await apiLogin(email, password);
    persistSession(data);
    return data;
}

export async function signUpService(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = USE_MOCK ? await mockSignUp(name, email, password) : await apiSignUp(name, email, password);
    persistSession(data);
    return data;
}

export async function refreshTokenService(refreshToken: string): Promise<RefreshTokenResponse> {
    const data = USE_MOCK ? await mockRefreshToken(refreshToken) : await apiRefreshToken(refreshToken);
    localStorage.setItem("token", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    return data;
}

export async function logoutApiService(
    refreshToken: string,
    logoutAllDevices = false,
): Promise<LogoutResponse> {
    return USE_MOCK ? mockLogout(refreshToken, logoutAllDevices) : apiLogout(refreshToken, logoutAllDevices);
}

export function logoutService(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
}

export function getStoredUser(): Worker | null {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;
    try {
        return JSON.parse(raw) as Worker;
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

export function isStoredAdmin(): boolean {
    const user = getStoredUser();
    return user?.isAdmin === true;
}
