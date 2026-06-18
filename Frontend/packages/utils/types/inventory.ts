/**
 * Inventory domain types — shared between admin and client apps.
 */

/** Unit types for inventory amounts */
export const INVENTORY_UNITS = ["kg", "L", "un"] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

/** Display labels for each unit */
export const UNIT_LABELS: Record<InventoryUnit, string> = {
    kg: "Kilogram",
    L: "Liter",
    un: "Unit",
};

/** Stock status derived from amount thresholds */
export const STOCK_STATUSES = ["In Stock", "Low Stock", "Out of Stock"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

/** Represents a single item in the inventory */
export interface InventoryItem {
    id: string;
    name: string;
    code: string;
    amount: number;
    unit: InventoryUnit;
    status: StockStatus;
}

/** Payload used when creating/adding stock */
export interface InventoryAddStockData {
    name: string;
    code: string;
    amount: number;
    unit: InventoryUnit;
}

/** Payload used when editing an existing inventory item */
export interface InventoryEditData {
    name: string;
    code: string;
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
