import { create } from "zustand";
import type { Product, ProductInput } from "shared-utils/types/product";
import { useToastStore } from "shared-utils/stores/useToastStore";
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
    onToggleActive: (id: number) => Promise<void>;
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
            const message = err instanceof Error ? err.message : "Falha ao carregar cardápio";
            set({ error: message, isLoading: false });
        }
    },

    onCreate: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
            const { imageFile, ...productData } = data;
            let created = await menuService.createMenuItem(productData);

            if (imageFile) {
                try {
                    created = await menuService.uploadProductImage(created.publicId, imageFile);
                } catch {
                    useToastStore.getState().showToast({
                        variant: "warning",
                        title: "Produto salvo sem imagem",
                        description: "Configure as variáveis do Bucket R2 para habilitar upload de fotos.",
                    });
                }
            }

            set((state) => ({ items: [...state.items, created] }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao criar item do cardápio";
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
            if (!product) throw new Error(`Produto ${id} não encontrado`);

            const { imageFile, ...productData } = data;
            let updated = await menuService.updateMenuItem(product.publicId, productData);

            if (imageFile) {
                try {
                    updated = await menuService.uploadProductImage(product.publicId, imageFile);
                } catch {
                    useToastStore.getState().showToast({
                        variant: "warning",
                        title: "Dados salvos sem alterar imagem",
                        description: "Configure as variáveis do Bucket R2 para habilitar upload de fotos.",
                    });
                }
            }

            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updated : item)),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao atualizar item";
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
            const message = err instanceof Error ? err.message : "Falha ao remover item";
            set({ error: message });
            throw err;
        } finally {
            set({ deletingId: null });
        }
    },

    onToggleActive: async (id) => {
        const product = get().items.find((item) => item.id === id);
        if (!product) return;

        set({ error: null });
        try {
            const updated = product.isActive
                ? await menuService.deactivateProduct(product.publicId)
                : await menuService.activateProduct(product.publicId);

            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updated : item)),
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao alterar status";
            set({ error: message });
            throw err;
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
