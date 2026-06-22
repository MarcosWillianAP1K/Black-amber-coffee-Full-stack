import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { InventoryItem, InventoryAddStockData, InventoryEditData } from "shared-utils/types/inventory";
import type { InventoryItemHandlers } from "../components/tableInventory/TableInventory";
import * as inventoryService from "../services/inventoryService";

interface InventoryContextValue {
    items: InventoryItem[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    handlers: InventoryItemHandlers;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const data = await inventoryService.fetchInventoryItems();
            setItems(data);
        } catch (err: unknown) {
            console.error("Failed to fetch inventory:", err);
            if (err instanceof Error) {
                setError(err.message || "Failed to load inventory");
            } else {
                setError("Failed to load inventory");
            }
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setIsLoading(true);
                const data = await inventoryService.fetchInventoryItems();
                if (mounted) setItems(data);
            } catch (err: unknown) {
                if (mounted) {
                    if (err instanceof Error) {
                        setError(err.message || "Failed to load inventory");
                    } else {
                        setError("Failed to load inventory");
                    }
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void load();

        return () => {
            mounted = false;
        };
    }, []);

    const handleEdit = useCallback(async (id: string, data: InventoryEditData) => {
        try {
            const updated = await inventoryService.updateInventoryItem(id, data);
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
            void refresh();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message || "Failed to update item");
            throw err;
        }
    }, [refresh]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await inventoryService.deleteInventoryItem(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
            void refresh();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message || "Failed to delete item");
            throw err;
        }
    }, [refresh]);

    const handleAddStock = useCallback(async (data: InventoryAddStockData) => {
        try {
            const result = await inventoryService.addStock(data);
            setItems((prev) => {
                const exists = prev.some((item) => item.id === result.id);
                if (exists) {
                    return prev.map((item) => (item.id === result.id ? result : item));
                } else {
                    return [...prev, result];
                }
            });
            void refresh();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message || "Failed to add stock");
            throw err;
        }
    }, [refresh]);

    const handlers: InventoryItemHandlers = {
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAddStock: handleAddStock,
    };

    return (
        <InventoryContext.Provider
            value={{
                items,
                isLoading,
                error,
                refresh,
                handlers,
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventoryContext(): InventoryContextValue {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventoryContext must be used within an InventoryProvider");
    }
    return context;
}
