/**
 * Inventory Service — Data access layer for inventory items.
 *
 * Currently uses in-memory mock data.
 * Replace with real API calls when backend is ready.
 */

import type { InventoryItem, InventoryAddStockData, InventoryEditData } from "shared-utils/types/inventory";
import { deriveStockStatus } from "shared-utils/types/inventory";
import { MOCK_ITEMS_INVENTORY } from "shared-utils/MockBD.js";


let nextId = 8;



let items = [...MOCK_ITEMS_INVENTORY];

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all inventory items */
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
    // TODO: return await fetch("/api/inventory").then(res => res.json());
    return [...items];
}

/**
 * Add stock — if the code matches an existing product, increment its amount.
 * Otherwise, create a new inventory entry.
 */
export async function addStock(data: InventoryAddStockData): Promise<InventoryItem> {
    // TODO: return await fetch("/api/inventory/add-stock", { method: "POST", body: JSON.stringify(data) }).then(res => res.json());
    const existing = items.find((item) => item.code === data.code);

    if (existing) {
        const newAmount = existing.amount + data.amount;
        const updated: InventoryItem = {
            ...existing,
            name: data.name,
            amount: newAmount,
            unit: data.unit,
            status: deriveStockStatus(newAmount),
        };
        items = items.map((item) => (item.id === existing.id ? updated : item));
        return updated;
    }

    const newItem: InventoryItem = {
        id: String(nextId++),
        name: data.name,
        code: data.code,
        amount: data.amount,
        unit: data.unit,
        status: deriveStockStatus(data.amount),
    };
    items = [...items, newItem];
    return newItem;
}

/** Update an existing inventory item */
export async function updateInventoryItem(id: string, data: InventoryEditData): Promise<InventoryItem> {
    // TODO: return await fetch(`/api/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(res => res.json());
    const updated: InventoryItem = {
        id,
        name: data.name,
        code: data.code,
        amount: data.amount,
        unit: data.unit,
        status: deriveStockStatus(data.amount),
    };
    items = items.map((item) => (item.id === id ? updated : item));
    return updated;
}

/** Delete an inventory item by ID */
export async function deleteInventoryItem(id: string): Promise<void> {
    // TODO: await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    items = items.filter((item) => item.id !== id);
}
