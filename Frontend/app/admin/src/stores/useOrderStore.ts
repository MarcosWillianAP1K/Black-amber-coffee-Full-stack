import { create } from "zustand";
import type { Order, OrderStatus } from "shared-utils/types/order";
import * as orderService from "../services/orderService";

const POLL_INTERVAL_MS = 30_000;

const ACTION_STATUS_MAP: Record<string, OrderStatus> = {
    start: "em_preparo",
    hold: "criado",
    ready: "pronto",
};

export interface NewOrderData {
    clientPublicId?: string;
    observation?: string | null;
    totalPrice: number;
    paymentMethod?: string;
    itens?: Array<{ productId: number; quantity: number; unitPrice: number; name?: string }>;
}

export interface OrderStoreState {
    orders: Order[];
    isLoading: boolean;
    isCreating: boolean;
    error: string | null;
    pendingOrderIds: Record<number, boolean>;
    refresh: () => Promise<void>;
    handleAction: (orderId: number, action: string) => Promise<void>;
    addOrder: (data: NewOrderData) => Promise<void>;
    deleteOrder: (orderId: number) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
}

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

export const useOrderStore = create<OrderStoreState>((set, get) => ({
    orders: [],
    isLoading: true,
    isCreating: false,
    error: null,
    pendingOrderIds: {},

    refresh: async () => {
        set({ error: null });
        try {
            const data = await orderService.fetchOrders();
            set({ orders: data, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load orders";
            set({ error: message, isLoading: false });
        }
    },

    handleAction: async (orderId, action) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        const publicId = order.publicId;

        set((state) => ({
            pendingOrderIds: { ...state.pendingOrderIds, [orderId]: true },
            error: null,
        }));

        try {
            if (action === "complete") {
                await orderService.completeOrder(publicId);
                const now = new Date().toISOString();
                set((state) => ({
                    orders: state.orders.map((o) =>
                        o.id === orderId ? { ...o, status: "finalizado", updatedAt: now } : o,
                    ),
                }));
                void get().refresh();
                return;
            }

            if (action === "delete") {
                await orderService.deleteOrder(publicId);
                set((state) => ({
                    orders: state.orders.filter((o) => o.id !== orderId),
                }));
                void get().refresh();
                return;
            }

            const newStatus = ACTION_STATUS_MAP[action];
            if (!newStatus) return;

            await orderService.updateOrderStatus(publicId, newStatus);
            const now = new Date().toISOString();
            set((state) => ({
                orders: state.orders.map((o) =>
                    o.id === orderId ? { ...o, status: newStatus, updatedAt: now } : o,
                ),
            }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Order action failed";
            set({ error: message });
            void get().refresh();
        } finally {
            set((state) => {
                const nextPending = { ...state.pendingOrderIds };
                delete nextPending[orderId];
                return { pendingOrderIds: nextPending };
            });
        }
    },

    addOrder: async (data) => {
        set({ isCreating: true, error: null });
        try {
            const created = await orderService.createOrder({
                clientPublicId: data.clientPublicId,
                items:
                    data.itens?.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        observation: null,
                    })) ?? [],
                paymentMethod: data.paymentMethod ?? "dinheiro",
                observation: data.observation ?? null,
            });

            set((state) => ({ orders: [created, ...state.orders] }));
            void get().refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create order";
            set({ error: message });
            throw err;
        } finally {
            set({ isCreating: false });
        }
    },

    deleteOrder: async (orderId) => {
        await get().handleAction(orderId, "delete");
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
            orders: [],
            isLoading: true,
            isCreating: false,
            error: null,
            pendingOrderIds: {},
        });
    },
}));
