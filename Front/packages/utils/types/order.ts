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

/** Represents a single item within an order */
export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    createdAt: string;
    updatedAt: string;
}

/** Represents the payment attached to an order */
export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    method: string;
    createdAt: string;
    updatedAt: string;
}

/** Represents a customer order */
export interface Order {
    id: number;
    publicId: string;
    clientId: number;
    totalAmount: number;
    status: OrderStatus;
    observation: string | null;
    createdAt: string;
    updatedAt: string;
    items?: OrderItem[];
    payment?: Payment | null;
}
