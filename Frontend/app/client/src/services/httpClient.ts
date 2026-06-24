import {
    getStoredRefreshToken,
    getStoredToken,
    logoutService,
    refreshTokenService,
} from "./authService.ts";

let refreshPromise: Promise<void> | null = null;

async function ensureTokenRefreshed(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    refreshPromise = refreshTokenService(refreshToken)
        .then(() => undefined)
        .catch((err) => {
            logoutService();
            throw err;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const token = getStoredToken();

    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, { ...init, headers });
    if (response.status !== 401) return response;

    try {
        await ensureTokenRefreshed();
        window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
    } catch {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return response;
    }

    const retryHeaders = new Headers(init.headers);
    const newToken = getStoredToken();
    if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);
    if (init.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
    }

    return fetch(input, { ...init, headers: retryHeaders });
}
