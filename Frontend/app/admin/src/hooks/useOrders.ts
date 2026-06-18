/**
 * useOrders — Consumes the shared OrderContext.
 */

import { useOrderContext } from "../context/OrderContext";
import type { NewOrderData } from "../context/OrderContext";

interface UseOrdersReturn {
    orders: ReturnType<typeof useOrderContext>["orders"];
    isLoading: ReturnType<typeof useOrderContext>["isLoading"];
    error: ReturnType<typeof useOrderContext>["error"];
    refresh: ReturnType<typeof useOrderContext>["refresh"];
    handleAction: (orderId: number, action: string) => Promise<void>;
    addOrder: (data: NewOrderData) => Promise<void>;
}

export type { NewOrderData };

export function useOrders(): UseOrdersReturn {
    const { orders, isLoading, error, refresh, handleAction, addOrder } = useOrderContext();

    return {
        orders,
        isLoading,
        error,
        refresh,
        handleAction,
        addOrder,
    };
}
