import { create } from "zustand";
import {
    loginService,
    signUpService,
    logoutService,
    refreshTokenService,
    logoutApiService,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken,
    type AuthResponse,
} from "../services/authService";
import type { Worker } from "shared-utils/types/worker";
import { useOrderStore } from "./useOrderStore";
import { useMenuStore } from "./useMenuStore";
import { useEmployeeStore } from "./useEmployeeStore";
import { useCustomerStore } from "./useCustomerStore";
import { useInventoryStore } from "./useInventoryStore";

function resetDomainStores(): void {
    useOrderStore.getState().reset();
    useMenuStore.getState().reset();
    useEmployeeStore.getState().reset();
    useCustomerStore.getState().reset();
    useInventoryStore.getState().reset();
}

export interface AuthState {
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
    syncTokensFromStorage: () => void;
    handleSessionExpired: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
    const initialToken = getStoredToken();

    return {
        user: getStoredUser(),
        token: initialToken,
        refreshToken: getStoredRefreshToken(),
        loading: false,
        error: null,
        isAuthenticated: Boolean(initialToken),

        login: async (email, password) => {
            set({ loading: true, error: null });
            try {
                const data = await loginService(email, password);
                set({
                    user: data.user,
                    token: data.token,
                    refreshToken: data.refreshToken ?? get().refreshToken,
                    isAuthenticated: Boolean(data.token),
                    loading: false,
                });
                return data;
            } catch (err) {
                set({
                    error: err instanceof Error ? err.message : "Falha no login",
                    loading: false,
                });
                return null;
            }
        },

        signUp: async (name, email, password) => {
            set({ loading: true, error: null });
            try {
                const data = await signUpService(name, email, password);
                set({
                    user: data.user,
                    token: data.token,
                    refreshToken: data.refreshToken ?? get().refreshToken,
                    isAuthenticated: Boolean(data.token),
                    loading: false,
                });
                return data;
            } catch (err) {
                set({
                    error: err instanceof Error ? err.message : "Falha no cadastro",
                    loading: false,
                });
                return null;
            }
        },

        refreshSession: async () => {
            const currentRefreshToken = get().refreshToken;
            if (!currentRefreshToken) {
                throw new Error("Refresh token missing");
            }

            const data = await refreshTokenService(currentRefreshToken);
            set({
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
                isAuthenticated: true,
            });
        },

        logout: async (logoutAllDevices = false) => {
            const currentRefreshToken = get().refreshToken;
            if (currentRefreshToken) {
                try {
                    await logoutApiService(currentRefreshToken, logoutAllDevices);
                } catch {
                    // Ignore logout API errors; local session must always clear.
                }
            }

            logoutService();
            resetDomainStores();
            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                error: null,
            });
        },

        syncTokensFromStorage: () => {
            const token = getStoredToken();
            set({
                token,
                refreshToken: getStoredRefreshToken(),
                user: getStoredUser(),
                isAuthenticated: Boolean(token),
            });
        },

        handleSessionExpired: () => {
            resetDomainStores();
            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
            });
        },

        clearError: () => set({ error: null }),
    };
});

let authEventsRegistered = false;

export function registerAdminAuthEventListeners(): void {
    if (authEventsRegistered || typeof window === "undefined") return;
    authEventsRegistered = true;

    window.addEventListener("auth:session-expired", () => {
        useAuthStore.getState().handleSessionExpired();
    });

    window.addEventListener("auth:token-refreshed", () => {
        useAuthStore.getState().syncTokensFromStorage();
    });
}

registerAdminAuthEventListeners();
