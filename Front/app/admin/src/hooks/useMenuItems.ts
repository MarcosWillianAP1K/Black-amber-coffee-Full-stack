/**
 * useMenuItems — Custom hook encapsulating menu item state and CRUD operations.
 *
 * Provides the items list and handlers ready to plug into the TableMenu component.
 * Uses menuService internally — when the backend is ready, only the service changes.
 */

import { useState, useCallback, useEffect } from "react";
import type { Product, ProductInput } from "shared-utils/types/product";
import type { MenuItemHandlers } from "../components/tableMenu/TableMenu";
import * as menuService from "../services/menuService";

interface UseMenuItemsReturn {
    items: Product[];
    isLoading: boolean;
    handlers: MenuItemHandlers;
}

export function useMenuItems(): UseMenuItemsReturn {
    const [items, setItems] = useState<Product[]>(() => {
        const stored = localStorage.getItem("menuItems");
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("menuItems"));

    // Initial fetch
    useEffect(() => {
        let cancelled = false;

        if (!localStorage.getItem("menuItems")) {
            menuService.fetchMenuItems().then((data) => {
                if (!cancelled) {
                    setItems(data);
                    localStorage.setItem("menuItems", JSON.stringify(data));
                    setIsLoading(false);
                }
            });
        }

        return () => { cancelled = true; };
    }, []);

    const handleEdit = useCallback(async (id: number, data: ProductInput) => {
        const updated = await menuService.updateMenuItem(id, data);
        setItems((prev) => {
            const next = prev.map((item) => (item.id === id ? updated : item));
            localStorage.setItem("menuItems", JSON.stringify(next));
            return next;
        });
    }, []);

    const handleDelete = useCallback(async (id: number) => {
        await menuService.deleteMenuItem(id);
        setItems((prev) => {
            const next = prev.filter((item) => item.id !== id);
            localStorage.setItem("menuItems", JSON.stringify(next));
            return next;
        });
    }, []);

    const handleCreate = useCallback(async (data: ProductInput) => {
        const newItem = await menuService.createMenuItem(data);
        setItems((prev) => {
            const next = [...prev, newItem];
            localStorage.setItem("menuItems", JSON.stringify(next));
            return next;
        });
    }, []);

    return {
        items,
        isLoading,
        handlers: {
            onEdit: handleEdit,
            onDelete: handleDelete,
            onCreate: handleCreate,
        },
    };
}
