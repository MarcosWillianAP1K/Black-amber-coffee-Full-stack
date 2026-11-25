import { useMemo } from "react";
import { useMenuStore } from "../stores/useMenuStore";
import type { Product, ProductInput } from "shared-utils/types/product";

interface UseMenuItemsReturn {
    items: Product[];
    isLoading: boolean;
    isSubmitting: boolean;
    deletingId: number | null;
    error: string | null;
    refresh: () => Promise<void>;
    handlers: {
        onCreate: (data: ProductInput) => Promise<void>;
        onEdit: (id: number, data: ProductInput) => Promise<void>;
        onDelete: (id: number) => Promise<void>;
        onToggleActive: (id: number) => Promise<void>;
    };
}

export function useMenuItems(): UseMenuItemsReturn {
    const items = useMenuStore((s) => s.items);
    const isLoading = useMenuStore((s) => s.isLoading);
    const isSubmitting = useMenuStore((s) => s.isSubmitting);
    const deletingId = useMenuStore((s) => s.deletingId);
    const error = useMenuStore((s) => s.error);
    const refresh = useMenuStore((s) => s.refresh);
    const onCreate = useMenuStore((s) => s.onCreate);
    const onEdit = useMenuStore((s) => s.onEdit);
    const onDelete = useMenuStore((s) => s.onDelete);
    const onToggleActive = useMenuStore((s) => s.onToggleActive);

    const handlers = useMemo(
        () => ({ onCreate, onEdit, onDelete, onToggleActive }),
        [onCreate, onEdit, onDelete, onToggleActive],
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

export type { ProductInput };
