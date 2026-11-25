import { create } from "zustand";
import type { Order } from "shared-utils/types/order";
import * as orderService from "../services/orderService";

interface ClientOrderStoreState {
    orders: Order[];
    isLoading: boolean;
    cancellingId: string | null;
    error: string | null;
    refresh: () => Promise<void>;
    cancelOrder: (publicId: string) => Promise<Order>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

const POLL_INTERVAL_MS = 15_000;
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useClientOrderStore = create<ClientOrderStoreState>((set, get) => ({
    orders: [],
    isLoading: false,
    cancellingId: null,
    error: null,

    refresh: async () => {
        set({ error: null });
        if (get().orders.length === 0) {
            set({ isLoading: true });
        }
        try {
            const orders = await orderService.fetchMyOrders();
            const sorted = [...orders].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
            set({ orders: sorted, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Falha ao carregar pedidos",
                isLoading: false,
            });
        }
    },

    cancelOrder: async (publicId) => {
        set({ cancellingId: publicId, error: null });
        try {
            const updated = await orderService.cancelMyOrder(publicId);
            set((state) => ({
                orders: state.orders.map((o) => (o.publicId === publicId ? updated : o)),
            }));
            void get().refresh();
            return updated;
        } finally {
            set({ cancellingId: null });
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
        set({ orders: [], isLoading: false, cancellingId: null, error: null });
    },
}));
