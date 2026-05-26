import type { Worker } from "shared-utils/types/worker";
import { MOCK_WORKERS } from "shared-utils/MockBD.js";

// API endpoint and mock toggle
const URL_API = "http://localhost:8080/v1/api/auth";
const USE_MOCK = false; // Toggle to false when API is ready


export interface AuthResponse {
    token: string | null;
    refreshToken?: string;
    user: Worker;
}

interface ApiAuthUser {
    publicId: string;
    email: string;
    userType: "worker" | "customer" | string;
    profile: {
        fullName: string;
        phone: string | null;
        avatarImage: string | null;
        createdAt: string;
        updatedAt?: string;
    };
}

interface ApiAuthResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        user: ApiAuthUser;
    };
}

interface ApiRegisterResponse {
    data: {
        publicId: string;
        email: string;
        createdAt: string;
        updatedAt: string;
        profile: {
            fullName: string;
            phone: string | null;
            avatarImage: string | null;
            createdAt: string;
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


/**
 * Mock login — searches MOCK_WORKERS by email+password.
 * Simulates a real API delay.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function mockLogin(email: string, _password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const employee = MOCK_WORKERS.find(
        (e) => e.profile.email === email
    );

    if (!employee) {
        throw new Error("Email or password incorrect");
    }

    if (!employee.isActive) {
        throw new Error("Account is deactivated");
    }

    return {
        token: `mock-token-${employee.publicId}-${Date.now()}`,
        refreshToken: `mock-refresh-${employee.publicId}-${Date.now()}`,
        user: employee,
    };
}

/**
 * Mock sign-up — validates and adds employee to mock data.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function mockSignUp(name: string, email: string, _password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const exists = MOCK_WORKERS.find((e) => e.profile.email === email);
    if (exists) {
        throw new Error("Email already registered");
    }

    const now = new Date().toISOString();
    const newEmployee: Worker = {
        publicId: String(MOCK_WORKERS.length + 1),
        role: "WAITER",
        salary: 0,
        isActive: true,
        profile: {
            fullName: name,
            phone: null,
            avatarImage: null,
            email,
            createdAt: now,
            updatedAt: now,
        },
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

/**
 * Mock refresh token — returns a new mock access/refresh token.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function mockRefreshToken(_refreshToken: string): Promise<RefreshTokenResponse> {
    await new Promise((r) => setTimeout(r, 200));

    return {
        data: {
            accessToken: `mock-access-${Date.now()}`,
            refreshToken: `mock-refresh-${Date.now()}`,
        },
    };
}

/**
 * Mock logout — clears server-side tokens (simulated).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function mockLogout(_refreshToken: string, _logoutAllDevices: boolean): Promise<LogoutResponse> {
    await new Promise((r) => setTimeout(r, 150));

    return {
        data: {
            success: true,
        },
    };
}

function mapApiUserToWorker(user: ApiAuthUser): Worker {
    const profileCreatedAt = user.profile.createdAt;
    const profileUpdatedAt = user.profile.updatedAt ?? profileCreatedAt;

    return {
        publicId: user.publicId,
        role: "ADMIN",
        salary: 0,
        isActive: true,
        profile: {
            fullName: user.profile.fullName,
            phone: user.profile.phone ?? null,
            avatarImage: user.profile.avatarImage ?? null,
            email: user.email,
            createdAt: profileCreatedAt,
            updatedAt: profileUpdatedAt,
        },
        createdAt: profileCreatedAt,
        updatedAt: profileUpdatedAt,
    };
}

function mapRegisterToWorker(payload: ApiRegisterResponse): Worker {
    const profileCreatedAt = payload.data.profile.createdAt;
    const profileUpdatedAt = payload.data.updatedAt;

    return {
        publicId: payload.data.publicId,
        role: "ADMIN",
        salary: 0,
        isActive: true,
        profile: {
            fullName: payload.data.profile.fullName,
            phone: payload.data.profile.phone ?? null,
            avatarImage: payload.data.profile.avatarImage ?? null,
            email: payload.data.email,
            createdAt: profileCreatedAt,
            updatedAt: profileUpdatedAt,
        },
        createdAt: payload.data.createdAt,
        updatedAt: payload.data.updatedAt,
    };
}


/**
 * Real API login — calls POST /api/login.
 */
async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${URL_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Email or password incorrect");
    }

    const payload = (await response.json()) as ApiAuthResponse;
    return {
        token: payload.data.accessToken,
        refreshToken: payload.data.refreshToken,
        user: mapApiUserToWorker(payload.data.user),
    };
}

/**
 * Real API sign-up — calls POST /api/signup.
 */
async function apiSignUp(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${URL_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        throw new Error("Sign up failed");
    }

    const payload = (await response.json()) as ApiRegisterResponse;
    return {
        token: null,
        user: mapRegisterToWorker(payload),
    };
}

/**
 * Real API refresh token — calls POST /api/auth/jwt/refresh-token.
 */
async function apiRefreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${URL_API}/jwt/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error("Refresh token failed");
    }

    return response.json();
}

/**
 * Real API logout — calls POST /api/auth/logout.
 */
async function apiLogout(refreshToken: string, logoutAllDevices: boolean): Promise<LogoutResponse> {
    const response = await fetch(`${URL_API}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, logoutAllDevices }),
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    return response.json();
}


// ── Public API ──────────────────────────────────

export async function loginService(email: string, password: string): Promise<AuthResponse> {
    const data = USE_MOCK
        ? await mockLogin(email, password)
        : await apiLogin(email, password);

    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export async function signUpService(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = USE_MOCK
        ? await mockSignUp(name, email, password)
        : await apiSignUp(name, email, password);

    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export async function refreshTokenService(refreshToken: string): Promise<RefreshTokenResponse> {
    const data = USE_MOCK
        ? await mockRefreshToken(refreshToken)
        : await apiRefreshToken(refreshToken);

    localStorage.setItem("token", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);

    return data;
}

export async function logoutApiService(
    refreshToken: string,
    logoutAllDevices = false
): Promise<LogoutResponse> {
    return USE_MOCK
        ? mockLogout(refreshToken, logoutAllDevices)
        : apiLogout(refreshToken, logoutAllDevices);
}

export function logoutService(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

export function getStoredUser(): Worker | null {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") {
        return null;
    }

    try {
        return JSON.parse(raw);
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