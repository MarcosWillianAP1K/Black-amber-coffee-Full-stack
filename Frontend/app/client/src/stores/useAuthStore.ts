import { create } from "zustand";
import {
    loginService,
    registerService,
    logoutService,
    logoutApiService,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken,
    type AuthResponse,
} from "../services/authService";
import type { User } from "shared-utils/types/user";
import type { NotificationProps } from "ui-shared/components/NotificationBell";
import { MOCK_NOTIFICATIONS } from "shared-utils/MockBD.js";
import { useCartStore } from "./useCartStore";
import { useMenuStore } from "./useMenuStore";

export interface ClientAuthState {
    user: User | null;
    notifications: NotificationProps[];
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthResponse | null>;
    register: (
        name: string,
        email: string,
        password: string,
        phone?: string,
    ) => Promise<AuthResponse | null>;
    logout: (logoutAllDevices?: boolean) => Promise<void>;
    syncTokensFromStorage: () => void;
    handleSessionExpired: () => void;
    clearError: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationProps[] = MOCK_NOTIFICATIONS.map((n) => ({
    ...n,
    action: () => undefined,
}));

export const useAuthStore = create<ClientAuthState>((set, get) => {
    const initialToken = getStoredToken();

    return {
        user: getStoredUser(),
        notifications: DEFAULT_NOTIFICATIONS,
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

        register: async (name, email, password, phone) => {
            set({ loading: true, error: null });
            try {
                const data = await registerService(name, email, password, phone);
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
            useCartStore.getState().reset();
            useMenuStore.getState().reset();
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
            useCartStore.getState().reset();
            useMenuStore.getState().reset();
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

let clientAuthEventsRegistered = false;

export function registerClientAuthEventListeners(): void {
    if (clientAuthEventsRegistered || typeof window === "undefined") return;
    clientAuthEventsRegistered = true;

    window.addEventListener("auth:session-expired", () => {
        useAuthStore.getState().handleSessionExpired();
    });

    window.addEventListener("auth:token-refreshed", () => {
        useAuthStore.getState().syncTokensFromStorage();
    });
}

registerClientAuthEventListeners();
