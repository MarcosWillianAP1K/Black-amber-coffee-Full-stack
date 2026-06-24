/**
 * Payment domain types aligned with backend payment schema.
 */

import type { Order } from "./order";

export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    method: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SimulatePaymentInput {
    paymentMethod: "pix" | "cartao_credito" | "cartao_debito" | "dinheiro";
    observation?: string | null;
}

export interface SimulatePaymentResponse {
    data: {
        order: Order;
        payment: Payment;
    };
    message?: string;
}
