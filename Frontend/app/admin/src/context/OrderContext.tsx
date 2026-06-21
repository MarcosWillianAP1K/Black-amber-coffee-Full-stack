/**
 * OrderContext — Centralized order state with auto-polling.
 *
 * Fetches orders once on mount, then polls every 30s.
 * Exposes refresh, addOrder, and handleAction for mutations.
 */

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { Order, OrderStatus } from "shared-utils/types/order";
import * as orderService from "../services/orderService";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000; // 30 seconds — starts immediately (no stagger)

const ACTION_STATUS_MAP: Record<string, OrderStatus> = {
    start: "IN PROGRESS",
    hold: "PENDING",
    ready: "COMPLETED",
};

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface NewOrderData {
    clientPublicId?: string;
    observation?: string | null;
    totalPrice: number;
    paymentMethod?: string;
    itens?: Array<{ productId: number; quantity: number; unitPrice: number; name?: string }>;
}

interface OrderContextValue {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    handleAction: (orderId: number, action: string) => Promise<void>;
    addOrder: (data: NewOrderData) => Promise<void>;
    deleteOrder: (orderId: number) => Promise<void>;
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(false);
    const abortedRef = useRef(false);

    // ── Fetch orders ───────────────────────────

    const refresh = useCallback(async () => {
        if (abortedRef.current) return;
        setError(null);
        try {
            const data = await orderService.fetchOrders();
            if (!abortedRef.current) setOrders(data);
        } catch (err) {
            if (!abortedRef.current) {
                const message = err instanceof Error ? err.message : "Failed to load orders";
                setError(message);
            }
        } finally {
            if (!abortedRef.current) setIsLoading(false);
        }
    }, []);

    // ── Initial fetch + polling ────────────────

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        abortedRef.current = false;

        // Initial fetch immediately (no stagger — first to load)
        refresh();

        pollingRef.current = setInterval(refresh, POLL_INTERVAL_MS);

        return () => {
            abortedRef.current = true;
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            mountedRef.current = false;
        };
    }, [refresh]);

    // ── Actions ────────────────────────────────

    const handleAction = useCallback(
        async (orderId: number, action: string) => {
            const order = orders.find((o) => o.id === orderId);
            if (!order) return;
            const publicId = order.publicId;

            try {
                if (action === "complete") {
                    await orderService.completeOrder(publicId);
                    setOrders((prev) => prev.filter((o) => o.id !== orderId));
                    refresh();
                    return;
                }

                if (action === "delete") {
                    await orderService.deleteOrder(publicId);
                    setOrders((prev) => prev.filter((o) => o.id !== orderId));
                    refresh();
                    return;
                }

                const newStatus = ACTION_STATUS_MAP[action];
                if (!newStatus) return;

                await orderService.updateOrderStatus(publicId, newStatus);
                // Optimistic update
                setOrders((prev) => {
                    const now = new Date().toISOString();
                    return prev.map((o) =>
                        o.id === orderId ? { ...o, status: newStatus, updatedAt: now } : o,
                    );
                });
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Order action failed";
                setError(message);
                // Revert optimistic update by refreshing from server
                refresh();
            }
        },
        [orders, refresh],
    );

    const addOrder = useCallback(
        async (data: NewOrderData) => {
            try {
                const created = await orderService.createOrder({
                    clientPublicId: data.clientPublicId,
                    items:
                        data.itens?.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            name: item.name,
                            observation: null,
                        })) ?? [],
                    totalPrice: data.totalPrice,
                    paymentMethod: data.paymentMethod ?? "CASH",
                    observation: data.observation ?? null,
                });

                setOrders((prev) => [created, ...prev]);
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create order";
                setError(message);
                throw err;
            }
        },
        [refresh],
    );

    const deleteOrder = useCallback(
        async (orderId: number) => {
            const order = orders.find((o) => o.id === orderId);
            if (!order) return;

            try {
                await orderService.deleteOrder(order.publicId);
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
                refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete order";
                setError(message);
                throw err;
            }
        },
        [orders, refresh],
    );

    // ── Render ─────────────────────────────────

    return (
        <OrderContext.Provider
            value={{
                orders,
                isLoading,
                error,
                refresh,
                handleAction,
                addOrder,
                deleteOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderContext(): OrderContextValue {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrderContext must be used within an OrderProvider");
    }
    return context;
}
