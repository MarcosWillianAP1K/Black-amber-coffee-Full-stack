/**
 * Order Service — Data access layer for orders.
 */

import type { Order, OrderStatus, AdminOrderListResponse, WorkerOrderResponse } from "shared-utils/types/order";
import { MOCK_ORDERS } from "shared-utils/MockBD.js";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";
import { isStoredAdmin } from "./authService.ts";

const USE_MOCK = false;

let orders = [...MOCK_ORDERS];

export async function fetchOrders(): Promise<Order[]> {
    if (USE_MOCK) return [...orders];

    const response = await authFetch(
        isStoredAdmin() ? API.AdminOrders.List : API.OrdersWorker.List,
        { method: "GET" },
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const payload = (await response.json()) as AdminOrderListResponse;
    return payload.data;
}

export async function updateOrderStatus(publicId: string, newStatus: OrderStatus): Promise<Order> {
    if (USE_MOCK) {
        const order = orders.find((o) => o.publicId === publicId);
        if (!order) throw new Error(`Order ${publicId} not found`);

        const now = new Date().toISOString();
        const updated = { ...order, status: newStatus, updatedAt: now };
        orders = orders.map((o) => (o.publicId === publicId ? updated : o));
        return updated;
    }

    const response = await authFetch(API.OrdersWorker.UpdateStatus(publicId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
    }

    const payload = (await response.json()) as WorkerOrderResponse;
    return payload.data;
}

export async function createOrder(data: {
    clientPublicId?: string;
    items: Array<{ productId: number; quantity: number; observation?: string | null }>;
    paymentMethod?: string;
    observation?: string | null;
}): Promise<Order> {
    if (USE_MOCK) {
        const id = Date.now();
        const now = new Date().toISOString();
        const newOrder: Order = {
            id,
            publicId: `ord-${id}`,
            code: `BAC-${String(id).slice(-4)}`,
            status: "criado",
            totalPrice: 0,
            paymentMethod: data.paymentMethod ?? null,
            observation: data.observation ?? null,
            itens: data.items.map((item, idx) => ({
                id: idx,
                name: `Product #${item.productId}`,
                price: 0,
                quantity: item.quantity,
                observation: item.observation ?? null,
            })),
            createdAt: now,
            updatedAt: now,
        };
        orders = [newOrder, ...orders];
        return newOrder;
    }

    const response = await authFetch(API.AdminOrders.Create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            clientPublicId: data.clientPublicId || undefined,
            items: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                observation: item.observation || undefined,
            })),
            paymentMethod: data.paymentMethod || undefined,
            observation: data.observation || undefined,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create order: ${response.status}`);
    }

    const payload = (await response.json()) as { data: Order };
    return payload.data;
}

export async function completeOrder(publicId: string): Promise<Order> {
    if (USE_MOCK) {
        const order = orders.find((o) => o.publicId === publicId);
        if (!order) throw new Error(`Order ${publicId} not found`);
        orders = orders.filter((o) => o.publicId !== publicId);
        return order;
    }

    return updateOrderStatus(publicId, "finalizado");
}

export async function cancelOrder(publicId: string): Promise<Order> {
    if (USE_MOCK) {
        const order = orders.find((o) => o.publicId === publicId);
        if (!order) throw new Error(`Order ${publicId} not found`);

        const now = new Date().toISOString();
        const updated = { ...order, status: "cancelado" as OrderStatus, updatedAt: now };
        orders = orders.map((o) => (o.publicId === publicId ? updated : o));
        return updated;
    }

    const response = await authFetch(API.AdminOrders.CancelById(publicId), {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.status}`);
    }

    const payload = (await response.json()) as WorkerOrderResponse;
    return payload.data;
}

export async function deleteOrder(publicId: string): Promise<void> {
    if (USE_MOCK) {
        orders = orders.filter((o) => o.publicId !== publicId);
        return;
    }

    const response = await authFetch(API.AdminOrders.DeleteById(publicId), {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete order: ${response.status}`);
    }
}
