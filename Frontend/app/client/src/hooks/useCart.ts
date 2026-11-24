import { useCartStore, type CartStoreState } from "../stores/useCartStore";

export type { CartStoreState };

export function useCart(): CartStoreState {
    return useCartStore();
}
