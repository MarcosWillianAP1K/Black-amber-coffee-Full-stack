/**
 * Order domain types aligned with backend order schema.
 */

/** Possible order statuses */
export const ORDER_STATUSES = [
    "PENDING",
    "IN PROGRESS",
    "COMPLETED",
    "LATE",
    "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Represents a single item within an order (API shape from OrdersWorker) */
export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    observation: string | null;
}

/** Represents an order from the API */
export interface Order {
    id: number;
    publicId: string;
    code: string;
    status: OrderStatus;
    totalPrice: number;
    paymentMethod: string | null;
    observation: string | null;
    itens: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

/** API response wrapper for admin orders list */
export interface AdminOrderListResponse {
    data: Order[];
}

/** API response wrapper for worker order detail */
export interface WorkerOrderResponse {
    data: Order;
}
