import { createContext, useEffect, useState, type ReactNode } from "react";
import {
    loginService,
    registerService,
    logoutService,
    logoutApiService,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken,
} from "../services/authService.ts";
import type { AuthResponse } from "../services/authService.ts";
import type { User } from "shared-utils/types/user";
import type { NotificationProps } from "ui-shared/components/NotificationBell";
import { MOCK_NOTIFICATIONS } from "shared-utils/MockBD.js";

export type AuthContextValue = {
    user: User | null;
    notifications: NotificationProps[];
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthResponse | null>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<AuthResponse | null>;
    logout: (logoutAllDevices?: boolean) => Promise<void>;
    clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(getStoredUser);
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [refreshToken, setRefreshToken] = useState<string | null>(getStoredRefreshToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const notifications: NotificationProps[] = MOCK_NOTIFICATIONS.map((n) => ({
        ...n,
        action: () => undefined,
    }));

    const isAuthenticated = !!token;

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
            if (data.refreshToken) setRefreshToken(data.refreshToken);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha no login");
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function register(name: string, email: string, password: string, phone?: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await registerService(name, email, password, phone);
            setUser(data.user);
            setToken(data.token);
            if (data.refreshToken) setRefreshToken(data.refreshToken);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha no cadastro");
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
                // ignore
            }
        }
        logoutService();
        setUser(null);
        setToken(null);
        setRefreshToken(null);
    }

    function clearError() {
        setError(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                notifications,
                token,
                loading,
                error,
                isAuthenticated,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
