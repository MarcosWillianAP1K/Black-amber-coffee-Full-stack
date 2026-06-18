import { createContext, useEffect, useState, type ReactNode } from "react";
import {
    loginService,
    signUpService,
    logoutService,
    refreshTokenService,
    logoutApiService,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken,
} from "../services/authService.ts";
import type { AuthResponse } from "../services/authService.ts";
import type { Worker } from "shared-utils/types/worker";

export type AuthContextValue = {
    user: Worker | null;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthResponse | null>;
    signUp: (name: string, email: string, password: string) => Promise<AuthResponse | null>;
    refreshSession: () => Promise<void>;
    logout: (logoutAllDevices?: boolean) => Promise<void>;
    clearError: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Worker | null>(getStoredUser);
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [refreshToken, setRefreshToken] = useState<string | null>(getStoredRefreshToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!token;

    // Note: user, token and refreshToken are lazy-initialized from localStorage
    // directly in useState above, so no useEffect is needed to hydrate them.

    /**
     * Listen for events dispatched by httpClient:
     * - auth:session-expired  → refresh token is invalid, force logout
     * - auth:token-refreshed  → silent refresh succeeded, sync new tokens into state
     */
    useEffect(() => {
        function handleSessionExpired() {
            setUser(null);
            setToken(null);
            setRefreshToken(null);
        }

        function handleTokenRefreshed() {
            setToken(getStoredToken());
            setRefreshToken(getStoredRefreshToken());
        }

        window.addEventListener("auth:session-expired", handleSessionExpired);
        window.addEventListener("auth:token-refreshed", handleTokenRefreshed);

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
            window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
        };
    }, []);

    async function login(email: string, password: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await loginService(email, password);
            setUser(data.user);
            setToken(data.token);
            if (data.refreshToken) {
                setRefreshToken(data.refreshToken);
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function signUp(name: string, email: string, password: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await signUpService(name, email, password);
            setUser(data.user);
            setToken(data.token);
            if (data.refreshToken) {
                setRefreshToken(data.refreshToken);
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign up failed");
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function logout(logoutAllDevices = false) {
        if (refreshToken) {
            try {
                await logoutApiService(refreshToken, logoutAllDevices);
            } catch {
                // Ignore logout API errors; we still clear local session.
            }
        }

        logoutService();
        setUser(null);
        setToken(null);
        setRefreshToken(null);
    }

    async function refreshSession() {
        if (!refreshToken) {
            throw new Error("Refresh token missing");
        }

        const data = await refreshTokenService(refreshToken);
        setToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
    }

    function clearError() {
        setError(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                refreshToken,
                loading,
                error,
                isAuthenticated,
                login,
                signUp,
                refreshSession,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
