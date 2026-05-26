/**
 * Order Service — Data access layer for orders.
 *
 * Currently uses in-memory mock data.
 * Replace the implementations with real API calls when backend is ready.
 *
 * Each function is async to match the real API contract from day one.
 */

import type { Order, OrderStatus } from "shared-utils/types/order";
import { MOCK_ORDERS } from "shared-utils/MockBD.js";



// In-memory store (simulates server state)
let orders = [...MOCK_ORDERS];
let completedOrders: Order[] = [];

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all orders */
export async function fetchOrders(): Promise<Order[]> {
    // TODO: return await fetch("/api/orders").then(res => res.json());
    return [...orders];
}

/** Update the status of an order */
export async function updateOrderStatus(id: number, newStatus: OrderStatus): Promise<Order> {
    // TODO: return await fetch(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) }).then(res => res.json());
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error(`Order ${id} not found`);

    const now = new Date().toISOString();
    const updated = { ...order, status: newStatus, updatedAt: now };
    orders = orders.map((o) => (o.id === id ? updated : o));
    return updated;
}

/** Delete an order */
export async function deleteOrder(id: number): Promise<void> {
    // TODO: await fetch(`/api/orders/${id}`, { method: "DELETE" });
    orders = orders.filter((o) => o.id !== id);
}

/** Create a new order */
export async function createOrder(order: Order): Promise<Order> {
    // TODO: return await fetch(`/api/orders`, { method: "POST", body: JSON.stringify(order) }).then(res => res.json());
    orders = [order, ...orders];
    return order;
}

/** Move an order to completed list */
export async function completeOrder(id: number): Promise<Order> {
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error(`Order ${id} not found`);

    orders = orders.filter((o) => o.id !== id);
    completedOrders = [order, ...completedOrders];
    return order;
}
