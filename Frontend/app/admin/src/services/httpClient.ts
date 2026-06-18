import { getStoredRefreshToken, getStoredToken, logoutService, refreshTokenService } from "./authService.ts";

/**
 * Singleton refresh promise — ensures concurrent 401 responses share a single
 * refresh token call instead of each firing their own, which would cause the
 * backend to invalidate tokens mid-flight.
 */
let refreshPromise: Promise<void> | null = null;

async function ensureTokenRefreshed(): Promise<void> {
    if (refreshPromise) {
        // Another request is already refreshing — wait for it
        return refreshPromise;
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    refreshPromise = refreshTokenService(refreshToken)
        .then(() => {
            // success — new tokens saved to localStorage by refreshTokenService
        })
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

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status !== 401) {
        return response;
    }

    // Try to refresh the access token (shared across concurrent 401s)
    try {
        await ensureTokenRefreshed();
        // Notify AuthContext that new tokens are available in localStorage
        window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
    } catch {
        // Refresh failed — session is over, notify AuthContext to clear React state
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return response;
    }

    // Retry the original request with the new token
    const retryHeaders = new Headers(init.headers);
    const newToken = getStoredToken();

    if (newToken) {
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
    }

    if (init.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
    }

    return fetch(input, { ...init, headers: retryHeaders });
}
