/**
 * Order domain types aligned with backend order schema.
 */

export const ORDER_STATUSES = [
    "criado",
    "em_preparo",
    "pronto",
    "finalizado",
    "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
    "pix",
    "cartao_credito",
    "cartao_debito",
    "dinheiro",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Represents a single item within an order */
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
    clientId?: number | null;
    updatedBy?: number | null;
    status: OrderStatus;
    totalPrice: number;
    paymentMethod: PaymentMethod | string | null;
    observation: string | null;
    itens: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

/** API response wrapper for orders list */
export interface AdminOrderListResponse {
    data: Order[];
}

/** API response wrapper for single order */
export interface WorkerOrderResponse {
    data: Order;
}

/** Human-readable labels for order statuses (admin UI) */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    criado: "CRIADO",
    em_preparo: "EM PREPARO",
    pronto: "PRONTO",
    finalizado: "FINALIZADO",
    cancelado: "CANCELADO",
};
