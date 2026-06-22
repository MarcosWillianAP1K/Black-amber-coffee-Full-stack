import type { Worker, GetWorkerResponse } from "shared-utils/types/worker";
import type {
    RefreshTokenResponse,
    LogoutResponse,
} from "shared-utils/types/auth";
import { API } from "shared-utils/core/APIroutes";
import { MOCK_WORKERS } from "shared-utils/MockBD.js";

// API endpoint and mock toggle
const USE_MOCK = false; // Toggle to false when API is ready

const DEFAULT_WORKER_ROLE: Worker["role"] = "BARISTA";

export interface AuthResponse {
    token: string | null;
    refreshToken?: string;
    user: Worker;
}

/**
 * Mock login - searches MOCK_WORKERS by email+password.
 * Simulates a real API delay.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function mockLogin(email: string, _password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const employee = MOCK_WORKERS.find((e) => e.profile.email === email);

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
 * Mock sign-up - validates and adds employee to mock data.
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
        role: DEFAULT_WORKER_ROLE,
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
 * Mock refresh token - returns a new mock access/refresh token.
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
 * Mock logout - clears server-side tokens (simulated).
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

function mapApiWorkerToWorker(data: GetWorkerResponse["data"]): Worker {
    const profileCreatedAt = data.profile.createdAt;
    const profileUpdatedAt = data.profile.updatedAt ?? profileCreatedAt;
    const workerUpdatedAt = data.updatedAt ?? data.createdAt;

    return {
        publicId: data.publicId,
        role: data.role,
        salary: data.salary,
        isActive: data.isActive,
        profile: {
            fullName: data.profile.fullName,
            phone: data.profile.phone ?? null,
            avatarImage: data.profile.avatarImage ?? null,
            email: data.profile.email,
            createdAt: profileCreatedAt,
            updatedAt: profileUpdatedAt,
        },
        createdAt: data.createdAt,
        updatedAt: workerUpdatedAt,
    };
}

function mapRegisteredWorkerToWorker(payload: {
    data: {
        publicId: string;
        email: string;
        role: string;
        salary: number;
        createdAt: string;
        updatedAt: string;
        profile: {
            fullName: string;
            phone: string | null;
            avatarImage: string | null;
            email: string;
            createdAt: string;
            updatedAt: string;
        };
    };
}): Worker {
    return {
        publicId: payload.data.publicId,
        role: payload.data.role as Worker["role"],
        salary: payload.data.salary,
        isActive: true,
        profile: {
            fullName: payload.data.profile.fullName,
            phone: payload.data.profile.phone ?? null,
            avatarImage: payload.data.profile.avatarImage ?? null,
            email: payload.data.profile.email,
            createdAt: payload.data.profile.createdAt,
            updatedAt: payload.data.profile.updatedAt,
        },
        createdAt: payload.data.createdAt,
        updatedAt: payload.data.updatedAt,
    };
}

/**
 * Real API login - calls POST /worker/login (worker-specific endpoint).
 * Then fetches full worker profile via /worker/get/me.
 */
async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API.Workers.Login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Email or password incorrect");
    }

    const payload = await response.json() as { data: { accessToken: string; refreshToken: string } };

    // Fetch full worker profile with salary, isActive etc.
    const worker = await apiGetWorker(payload.data.accessToken);

    return {
        token: payload.data.accessToken,
        refreshToken: payload.data.refreshToken,
        user: worker,
    };
}

async function apiGetWorker(accessToken?: string): Promise<Worker> {
    const token = accessToken ?? getStoredToken();
    if (!token) {
        throw new Error("Access token missing");
    }

    const response = await fetch(API.Workers.GetMe, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Get worker failed");
    }

    const payload = (await response.json()) as GetWorkerResponse;
    return mapApiWorkerToWorker(payload.data);
}

/**
 * Real API sign-up - calls POST /admin/workers (worker registration).
 * Note: requires admin authentication. Workers cannot self-register.
 */
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

    const payload = await response.json();
    return {
        token: null,
        user: mapRegisteredWorkerToWorker(payload),
    };
}

/**
 * Real API refresh token - calls POST /api/auth/jwt/refresh-token.
 */
async function apiRefreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(API.Auth.RefreshToken, {
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
 * Real API logout - calls POST /api/auth/logout.
 */
async function apiLogout(refreshToken: string, logoutAllDevices: boolean): Promise<LogoutResponse> {
    const response = await fetch(API.Auth.Logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, logoutAllDevices }),
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    return response.json();
}

// -- Public API ----------------------------------

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
    localStorage.setItem("userRole", data.user.role);

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
    localStorage.removeItem("userRole");
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