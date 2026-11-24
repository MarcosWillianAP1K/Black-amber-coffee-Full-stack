import { create } from "zustand";
import type { Product, ProductInput } from "shared-utils/types/product";
import * as menuService from "../services/menuService";

const POLL_INTERVAL_MS = 35_000;

export interface MenuStoreState {
    items: Product[];
    isLoading: boolean;
    isSubmitting: boolean;
    deletingId: number | null;
    error: string | null;
    refresh: () => Promise<void>;
    onCreate: (data: ProductInput) => Promise<void>;
    onEdit: (id: number, data: ProductInput) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useMenuStore = create<MenuStoreState>((set, get) => ({
    items: [],
    isLoading: true,
    isSubmitting: false,
    deletingId: null,
    error: null,

    refresh: async () => {
        set({ error: null });
        try {
            const data = await menuService.fetchMenuItems();
            set({ items: data, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load menu";
            set({ error: message, isLoading: false });
        }
    },

    onCreate: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
            const { imageFile, ...productData } = data;
            let created = await menuService.createMenuItem(productData);

            if (imageFile) {
                created = await menuService.uploadProductImage(created.publicId, imageFile);
            }

            set((state) => ({ items: [...state.items, created] }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create menu item";
            set({ error: message });
            throw err;
        } finally {
            set({ isSubmitting: false });
        }
    },

    onEdit: async (id, data) => {
        set({ isSubmitting: true, error: null });
        try {
            const product = get().items.find((item) => item.id === id);
            if (!product) throw new Error(`Product ${id} not found`);

            const { imageFile, ...productData } = data;
            let updated = await menuService.updateMenuItem(product.publicId, productData);

            if (imageFile) {
                updated = await menuService.uploadProductImage(product.publicId, imageFile);
            }

            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updated : item)),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update menu item";
            set({ error: message });
            throw err;
        } finally {
            set({ isSubmitting: false });
        }
    },

    onDelete: async (id) => {
        const product = get().items.find((item) => item.id === id);
        if (!product) return;

        set({ deletingId: id, error: null });
        try {
            await menuService.deleteMenuItem(product.publicId);
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete menu item";
            set({ error: message });
            throw err;
        } finally {
            set({ deletingId: null });
        }
    },

    startPolling: () => {
        subscriberCount += 1;
        if (pollingTimer !== null) return;

        void get().refresh();
        pollingTimer = setInterval(() => {
            void get().refresh();
        }, POLL_INTERVAL_MS);
    },

    stopPolling: () => {
        subscriberCount = Math.max(0, subscriberCount - 1);
        if (subscriberCount === 0 && pollingTimer !== null) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
    },

    reset: () => {
        subscriberCount = 0;
        if (pollingTimer !== null) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
        set({
            items: [],
            isLoading: true,
            isSubmitting: false,
            deletingId: null,
            error: null,
        });
    },
}));
