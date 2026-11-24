import { create } from "zustand";
import type {
    InventoryItem,
    InventoryAddStockData,
    InventoryEditData,
} from "shared-utils/types/inventory";
import * as inventoryService from "../services/inventoryService";

const POLL_INTERVAL_MS = 45_000;

export interface InventoryStoreState {
    items: InventoryItem[];
    isLoading: boolean;
    isSubmitting: boolean;
    deletingId: string | null;
    error: string | null;
    refresh: () => Promise<void>;
    onEdit: (id: string, data: InventoryEditData) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddStock: (data: InventoryAddStockData) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useInventoryStore = create<InventoryStoreState>((set, get) => ({
    items: [],
    isLoading: true,
    isSubmitting: false,
    deletingId: null,
    error: null,

    refresh: async () => {
        set({ error: null });
        try {
            const data = await inventoryService.fetchInventoryItems();
            set({ items: data, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load inventory";
            set({ error: message, isLoading: false });
        }
    },

    onEdit: async (id, data) => {
        set({ isSubmitting: true, error: null });
        try {
            const updated = await inventoryService.updateInventoryItem(id, data);
            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updated : item)),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update item";
            set({ error: message });
            throw err;
        } finally {
            set({ isSubmitting: false });
        }
    },

    onDelete: async (id) => {
        set({ deletingId: id, error: null });
        try {
            await inventoryService.deleteInventoryItem(id);
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete item";
            set({ error: message });
            throw err;
        } finally {
            set({ deletingId: null });
        }
    },

    onAddStock: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
            const result = await inventoryService.addStock(data);
            set((state) => {
                const exists = state.items.some((item) => item.id === result.id);
                return {
                    items: exists
                        ? state.items.map((item) => (item.id === result.id ? result : item))
                        : [...state.items, result],
                };
            });
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to add stock";
            set({ error: message });
            throw err;
        } finally {
            set({ isSubmitting: false });
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
