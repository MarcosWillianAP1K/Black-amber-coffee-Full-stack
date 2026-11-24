import { create } from "zustand";
import type { Cart, CartItem } from "shared-utils/types/cart";
import type { Product } from "shared-utils/types/product";
import * as cartService from "../services/cartService";

export interface CartStoreState {
    cart: Cart | null;
    items: CartItem[];
    count: number;
    subtotal: number;
    discount: number;
    observation: string;
    isLoading: boolean;
    isClearing: boolean;
    pendingProductIds: Record<number, boolean>;
    error: string | null;
    setObservation: (value: string) => void;
    refresh: () => Promise<void>;
    addItem: (product: Product, quantity?: number) => Promise<void>;
    increment: (productId: number) => Promise<void>;
    decrement: (productId: number) => Promise<void>;
    clear: () => Promise<void>;
    reset: () => void;
}

function mapCartState(cart: Cart | null) {
    return {
        cart,
        items: cart?.items ?? [],
        count: cart?.itemCount ?? 0,
        subtotal: cart?.subtotal ?? 0,
        discount: 0,
    };
}

function dispatchCartUpdated() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:updated"));
    }
}

export const useCartStore = create<CartStoreState>((set, get) => ({
    cart: null,
    items: [],
    count: 0,
    subtotal: 0,
    discount: 0,
    observation: "",
    isLoading: true,
    isClearing: false,
    pendingProductIds: {},
    error: null,

    setObservation: (value) => set({ observation: value }),

    refresh: async () => {
        set({ error: null });
        try {
            const data = await cartService.fetchCart();
            set({ ...mapCartState(data), isLoading: false });
            dispatchCartUpdated();
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Falha ao carregar carrinho",
                isLoading: false,
            });
        }
    },

    addItem: async (product, quantity = 1) => {
        set((state) => ({
            pendingProductIds: { ...state.pendingProductIds, [product.id]: true },
            error: null,
        }));

        try {
            const data = await cartService.addCartItem({
                productId: product.id,
                quantity,
            });
            set(mapCartState(data));
            dispatchCartUpdated();
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Falha ao adicionar item" });
            throw err;
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingProductIds };
                delete nextPending[product.id];
                return { pendingProductIds: nextPending };
            });
        }
    },

    increment: async (productId) => {
        const item = get().cart?.items.find((i) => i.productId === productId);
        if (!item) return;

        set((state) => ({
            pendingProductIds: { ...state.pendingProductIds, [productId]: true },
            error: null,
        }));

        try {
            const data = await cartService.updateCartItem(productId, {
                quantity: item.quantity + 1,
            });
            set(mapCartState(data));
            dispatchCartUpdated();
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Falha ao atualizar item" });
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingProductIds };
                delete nextPending[productId];
                return { pendingProductIds: nextPending };
            });
        }
    },

    decrement: async (productId) => {
        const item = get().cart?.items.find((i) => i.productId === productId);
        if (!item) return;

        set((state) => ({
            pendingProductIds: { ...state.pendingProductIds, [productId]: true },
            error: null,
        }));

        try {
            const data =
                item.quantity <= 1
                    ? await cartService.removeCartItem(productId)
                    : await cartService.updateCartItem(productId, {
                          quantity: item.quantity - 1,
                      });
            set(mapCartState(data));
            dispatchCartUpdated();
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Falha ao atualizar item" });
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingProductIds };
                delete nextPending[productId];
                return { pendingProductIds: nextPending };
            });
        }
    },

    clear: async () => {
        set({ isClearing: true, error: null });
        try {
            const data = await cartService.clearCart();
            set({ ...mapCartState(data), observation: "" });
            dispatchCartUpdated();
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Falha ao limpar carrinho" });
        } finally {
            set({ isClearing: false });
        }
    },

    reset: () =>
        set({
            cart: null,
            items: [],
            count: 0,
            subtotal: 0,
            discount: 0,
            observation: "",
            isLoading: true,
            isClearing: false,
            pendingProductIds: {},
            error: null,
        }),
}));
