import { useAuthStore, type ClientAuthState } from "../stores/useAuthStore";

export type { ClientAuthState };

export function useAuth(): ClientAuthState {
    return useAuthStore();
}
