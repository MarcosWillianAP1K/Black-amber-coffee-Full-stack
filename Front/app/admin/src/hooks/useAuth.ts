import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    loginService,
    signUpService,
    logoutService,
    refreshTokenService,
    logoutApiService,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken,
} from "../services/authService";
import { APP_ROUTES } from "../utils/Path";
import type { Worker } from "shared-utils/types/worker";


export function useAuth() {
    const navigate = useNavigate();

    const [user, setUser] = useState<Worker | null>(getStoredUser);
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [refreshToken, setRefreshToken] = useState<string | null>(getStoredRefreshToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!token;

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
            navigate(APP_ROUTES.DASHBOARD);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
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
            navigate(APP_ROUTES.DASHBOARD);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign up failed");
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
        navigate(APP_ROUTES.LOGIN);
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

    return {
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
    };
}
