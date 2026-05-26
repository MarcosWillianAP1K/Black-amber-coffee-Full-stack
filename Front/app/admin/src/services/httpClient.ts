import { getStoredRefreshToken, getStoredToken, logoutService, refreshTokenService } from "./authService";

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

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
        return response;
    }

    try {
        await refreshTokenService(refreshToken);
    } catch {
        logoutService();
        return response;
    }

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
