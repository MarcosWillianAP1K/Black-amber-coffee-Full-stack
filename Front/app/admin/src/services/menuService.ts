/**
 * Menu Service — Data access layer for menu items.
 *
 * Currently uses in-memory mock data.
 * Replace the implementations with real API calls when backend is ready.
 *
 * Each function is async to match the real API contract from day one.
 */

import type { Product, ProductInput } from "shared-utils/types/product";
import { MOCK_PRODUCTS } from "shared-utils/MockBD.js";


let nextId = 4;



// In-memory store (simulates server state)
let items = [...MOCK_PRODUCTS];

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all menu items */
export async function fetchMenuItems(): Promise<Product[]> {
    // TODO: return await fetch("/api/menu-items").then(res => res.json());
    return [...items];
}

/** Create a new menu item */
export async function createMenuItem(data: ProductInput): Promise<Product> {
    // TODO: return await fetch("/api/menu-items", { method: "POST", body: JSON.stringify(data) }).then(res => res.json());
    const id = nextId++;
    const now = new Date().toISOString();
    const newItem: Product = {
        id,
        publicId: `product-${id}`,
        name: data.name,
        description: data.description ?? null,
        size: data.size ?? null,
        category: data.category,
        price: data.price,
        isActive: data.isActive ?? true,
        imageUrl: data.imageUrl ?? null,
        createdAt: now,
        updatedAt: now,
    };
    items = [...items, newItem];
    return newItem;
}

/** Update an existing menu item */
export async function updateMenuItem(id: number, data: ProductInput): Promise<Product> {
    // TODO: return await fetch(`/api/menu-items/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(res => res.json());
    const now = new Date().toISOString();
    const existing = items.find((item) => item.id === id);
    const updated: Product = {
        id,
        publicId: existing?.publicId ?? `product-${id}`,
        name: data.name,
        description: data.description ?? null,
        size: data.size ?? null,
        category: data.category,
        price: data.price,
        isActive: data.isActive ?? true,
        imageUrl: data.imageUrl ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };
    items = items.map((item) => (item.id === id ? updated : item));
    return updated;
}

/** Delete a menu item by ID */
export async function deleteMenuItem(id: number): Promise<void> {
    // TODO: await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
    items = items.filter((item) => item.id !== id);
}
