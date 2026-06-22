/**
 * useInventoryItems — Custom hook encapsulating inventory state and CRUD operations.
 *
 * Provides items list and handlers ready to plug into the TableInventory component.
 * Uses inventoryService internally — when API is ready, only the service changes.
 */

import { useInventoryContext } from "../context/InventoryContext";
import type { InventoryItemHandlers } from "../components/tableInventory/TableInventory";
import type { InventoryItem } from "shared-utils/types/inventory";

interface UseInventoryItemsReturn {
    items: InventoryItem[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    handlers: InventoryItemHandlers;
}

export function useInventoryItems(): UseInventoryItemsReturn {
    const { items, isLoading, error, refresh, handlers } = useInventoryContext();

    return {
        items,
        isLoading,
        error,
        refresh,
        handlers,
    };
}
