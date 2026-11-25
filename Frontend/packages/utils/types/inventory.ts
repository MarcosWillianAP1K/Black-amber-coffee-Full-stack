/**
 * Inventory domain types — shared between admin and client apps.
 */

/** Unit types for inventory amounts */
export const INVENTORY_UNITS = ["kg", "L", "un"] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

/** Compact display labels for each unit */
export const UNIT_LABELS: Record<InventoryUnit, string> = {
    kg: "kg",
    L: "L",
    un: "un",
};

/** Full Portuguese labels for select inputs */
export const UNIT_FULL_LABELS: Record<InventoryUnit, string> = {
    kg: "Quilograma (kg)",
    L: "Litro (L)",
    un: "Unidade (un)",
};

/** Stock status derived from amount thresholds */
export const STOCK_STATUSES = ["In Stock", "Low Stock", "Out of Stock"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

/** Localized labels for stock statuses */
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
    "In Stock": "Em Estoque",
    "Low Stock": "Estoque Baixo",
    "Out of Stock": "Sem Estoque",
};

/** Represents a single item in the inventory */
export interface InventoryItem {
    id: string;
    name: string;
    code: string;
    description?: string;
    amount: number;
    unit: InventoryUnit;
    status: StockStatus;
}

/** Payload used when creating/adding stock */
export interface InventoryAddStockData {
    name: string;
    code: string;
    description?: string;
    amount: number;
    unit: InventoryUnit;
}

/** Payload used when editing an existing inventory item */
export interface InventoryEditData {
    name: string;
    code: string;
    description?: string;
    amount: number;
    unit: InventoryUnit;
}

/**
 * Derives stock status from the current amount.
 * Business rule: 0 = Out of Stock, <= 10 = Low Stock, else In Stock.
 */
export function deriveStockStatus(amount: number): StockStatus {
    if (amount <= 0) return "Out of Stock";
    if (amount <= 10) return "Low Stock";
    return "In Stock";
}
