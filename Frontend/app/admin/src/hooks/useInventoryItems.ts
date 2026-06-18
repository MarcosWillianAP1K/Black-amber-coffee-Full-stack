/**
 * useInventoryItems — Custom hook encapsulating inventory state and CRUD operations.
 *
 * Provides items list and handlers ready to plug into the TableInventory component.
 * Uses inventoryService internally — when API is ready, only the service changes.
 */

import { useState, useCallback, useEffect } from "react";
import type { InventoryItem, InventoryAddStockData, InventoryEditData } from "shared-utils/types/inventory";
import type { InventoryItemHandlers } from "../components/tableInventory/TableInventory";
import * as inventoryService from "../services/inventoryService";

interface UseInventoryItemsReturn {
    items: InventoryItem[];
    isLoading: boolean;
    handlers: InventoryItemHandlers;
}

export function useInventoryItems(): UseInventoryItemsReturn {
    const [items, setItems] = useState<InventoryItem[]>(() => {
        const stored = localStorage.getItem("inventoryItems");
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("inventoryItems"));

    // Initial fetch
    useEffect(() => {
        let cancelled = false;

        if (!localStorage.getItem("inventoryItems")) {
            inventoryService.fetchInventoryItems().then((data) => {
                if (!cancelled) {
                    setItems(data);
                    localStorage.setItem("inventoryItems", JSON.stringify(data));
                    setIsLoading(false);
                }
            });
        }

        return () => { cancelled = true; };
    }, []);

    const handleEdit = useCallback(async (id: string, data: InventoryEditData) => {
        const updated = await inventoryService.updateInventoryItem(id, data);
        setItems((prev) => {
            const next = prev.map((item) => (item.id === id ? updated : item));
            localStorage.setItem("inventoryItems", JSON.stringify(next));
            return next;
        });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await inventoryService.deleteInventoryItem(id);
        setItems((prev) => {
            const next = prev.filter((item) => item.id !== id);
            localStorage.setItem("inventoryItems", JSON.stringify(next));
            return next;
        });
    }, []);

    const handleAddStock = useCallback(async (data: InventoryAddStockData) => {
        const result = await inventoryService.addStock(data);
        setItems((prev) => {
            // Check if item already existed (was updated) or is new
            const exists = prev.some((item) => item.id === result.id);
            let next;
            if (exists) {
                next = prev.map((item) => (item.id === result.id ? result : item));
            } else {
                next = [...prev, result];
            }
            localStorage.setItem("inventoryItems", JSON.stringify(next));
            return next;
        });
    }, []);

    return {
        items,
        isLoading,
        handlers: {
            onEdit: handleEdit,
            onDelete: handleDelete,
            onAddStock: handleAddStock,
        },
    };
}
