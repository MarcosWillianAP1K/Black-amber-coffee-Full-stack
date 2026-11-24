import { create } from "zustand";
import { PRODUCT_CATEGORY_LABELS, type Product, type ProductCategory } from "shared-utils/types/product";
import * as productService from "../services/productService";

export interface ClientMenuStoreState {
    products: Product[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    getCategoryLabel: (category: string) => string;
    reset: () => void;
}

export const useMenuStore = create<ClientMenuStoreState>((set) => ({
    products: [],
    categories: [],
    isLoading: true,
    error: null,

    refresh: async () => {
        set({ error: null });
        try {
            const [productList, categoryList] = await Promise.all([
                productService.fetchProducts(),
                productService.fetchCategories(),
            ]);
            set({
                products: productList,
                categories: categoryList.length > 0 ? categoryList : ["cafe", "cha", "lanche"],
                isLoading: false,
            });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Falha ao carregar cardápio",
                isLoading: false,
            });
        }
    },

    getCategoryLabel: (category) => {
        return PRODUCT_CATEGORY_LABELS[category as ProductCategory] ?? category;
    },

    reset: () =>
        set({
            products: [],
            categories: [],
            isLoading: true,
            error: null,
        }),
}));
