import { useOrderStore, type NewOrderData } from "../stores/useOrderStore";
import type { Order } from "shared-utils/types/order";

export type { NewOrderData };

interface UseOrdersReturn {
    orders: Order[];
    isLoading: boolean;
    isCreating: boolean;
    pendingOrderIds: Record<number, boolean>;
    error: string | null;
    refresh: () => Promise<void>;
    handleAction: (orderId: number, action: string) => Promise<void>;
    addOrder: (data: NewOrderData) => Promise<void>;
    deleteOrder: (orderId: number) => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
    const orders = useOrderStore((s) => s.orders);
    const isLoading = useOrderStore((s) => s.isLoading);
    const isCreating = useOrderStore((s) => s.isCreating);
    const pendingOrderIds = useOrderStore((s) => s.pendingOrderIds);
    const error = useOrderStore((s) => s.error);
    const refresh = useOrderStore((s) => s.refresh);
    const handleAction = useOrderStore((s) => s.handleAction);
    const addOrder = useOrderStore((s) => s.addOrder);
    const deleteOrder = useOrderStore((s) => s.deleteOrder);

    return {
        orders,
        isLoading,
        isCreating,
        pendingOrderIds,
        error,
        refresh,
        handleAction,
        addOrder,
        deleteOrder,
    };
}
