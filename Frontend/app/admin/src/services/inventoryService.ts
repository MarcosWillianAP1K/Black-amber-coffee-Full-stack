/**
 * Inventory Service — Data access layer for inventory items.
 *
 * Currently uses in-memory mock data.
 * Replace with real API calls when backend is ready.
 */

import type { InventoryItem, InventoryAddStockData, InventoryEditData, InventoryUnit } from "shared-utils/types/inventory";
import { deriveStockStatus } from "shared-utils/types/inventory";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient";

interface PaginatedInventoryResponse {
    data: Record<string, unknown>[];
}

interface SingleInventoryResponse {
    data: Record<string, unknown>;
}

// Helper to map backend format to frontend InventoryItem
function mapToInventoryItem(item: Record<string, unknown>): InventoryItem {
    return {
        id: item.publicId as string,
        name: item.name as string,
        code: (item.code as string) ?? "",
        description: (item.description as string) ?? "",
        amount: (item.quantity as number) ?? 0,
        unit: item.quantityType as InventoryUnit,
        status: deriveStockStatus((item.quantity as number) ?? 0),
    };
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
    const response = await authFetch(API.AdminInventory.List, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
    }

    const payload = (await response.json()) as PaginatedInventoryResponse;
    return (payload.data ?? []).map(mapToInventoryItem);
}

export async function addStock(data: InventoryAddStockData): Promise<InventoryItem> {
    const response = await authFetch(API.AdminInventory.AddStock, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            code: data.code,
            description: data.description,
            quantity: data.amount,
            quantityType: data.unit,
        }),
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `Failed to add stock: ${response.status}`);
    }

    const payload = (await response.json()) as SingleInventoryResponse;
    return mapToInventoryItem(payload.data);
}

export async function updateInventoryItem(id: string, data: InventoryEditData): Promise<InventoryItem> {
    const response = await authFetch(API.AdminInventory.UpdateById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            code: data.code,
            description: data.description,
            quantity: data.amount,
            quantityType: data.unit,
        }),
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `Failed to update inventory item: ${response.status}`);
    }

    const payload = (await response.json()) as SingleInventoryResponse;
    return mapToInventoryItem(payload.data);
}

export async function deleteInventoryItem(id: string): Promise<void> {
    const response = await authFetch(API.AdminInventory.DeleteById(id), {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete inventory item: ${response.status}`);
    }
}
