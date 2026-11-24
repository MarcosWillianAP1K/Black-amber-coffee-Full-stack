import { useAuthStore, type AuthState } from "../stores/useAuthStore";

export type { AuthState };

export function useAuth(): AuthState {
    return useAuthStore();
}
