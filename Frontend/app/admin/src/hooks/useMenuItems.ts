/**
 * useMenuItems — Consumes the shared MenuContext.
 */

import { useMenuContext } from "../context/MenuContext";
import type { ProductInput } from "shared-utils/types/product";

interface UseMenuItemsReturn {
    items: ReturnType<typeof useMenuContext>["items"];
    isLoading: ReturnType<typeof useMenuContext>["isLoading"];
    error: ReturnType<typeof useMenuContext>["error"];
    refresh: ReturnType<typeof useMenuContext>["refresh"];
    handlers: ReturnType<typeof useMenuContext>["handlers"];
}

export function useMenuItems(): UseMenuItemsReturn {
    const { items, isLoading, error, refresh, handlers } = useMenuContext();

    return {
        items,
        isLoading,
        error,
        refresh,
        handlers,
    };
}

export type { ProductInput };

