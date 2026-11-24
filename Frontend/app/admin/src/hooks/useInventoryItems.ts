import { useMemo } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { InventoryItemHandlers } from "../components/tableInventory/TableInventory";
import type { InventoryItem } from "shared-utils/types/inventory";

interface UseInventoryItemsReturn {
    items: InventoryItem[];
    isLoading: boolean;
    isSubmitting: boolean;
    deletingId: string | null;
    error: string | null;
    refresh: () => Promise<void>;
    handlers: InventoryItemHandlers;
}

export function useInventoryItems(): UseInventoryItemsReturn {
    const items = useInventoryStore((s) => s.items);
    const isLoading = useInventoryStore((s) => s.isLoading);
    const isSubmitting = useInventoryStore((s) => s.isSubmitting);
    const deletingId = useInventoryStore((s) => s.deletingId);
    const error = useInventoryStore((s) => s.error);
    const refresh = useInventoryStore((s) => s.refresh);
    const onEdit = useInventoryStore((s) => s.onEdit);
    const onDelete = useInventoryStore((s) => s.onDelete);
    const onAddStock = useInventoryStore((s) => s.onAddStock);

    const handlers = useMemo<InventoryItemHandlers>(
        () => ({ onEdit, onDelete, onAddStock }),
        [onEdit, onDelete, onAddStock],
    );

    return {
        items,
        isLoading,
        isSubmitting,
        deletingId,
        error,
        refresh,
        handlers,
    };
}
