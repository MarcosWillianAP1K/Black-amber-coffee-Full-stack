import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { Product } from "shared-utils/types/product";
import * as productService from "../services/productService.ts";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "shared-utils/types/product";

interface MenuContextValue {
    products: Product[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    getCategoryLabel: (category: string) => string;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const [productList, categoryList] = await Promise.all([
                productService.fetchProducts(),
                productService.fetchCategories(),
            ]);
            setProducts(productList);
            setCategories(categoryList.length > 0 ? categoryList : ["cafe", "cha", "lanche"]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar cardápio");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    function getCategoryLabel(category: string) {
        return PRODUCT_CATEGORY_LABELS[category as ProductCategory] ?? category;
    }

    return (
        <MenuContext.Provider
            value={{ products, categories, isLoading, error, refresh, getCategoryLabel }}
        >
            {children}
        </MenuContext.Provider>
    );
}

export function useMenuContext(): MenuContextValue {
    const ctx = useContext(MenuContext);
    if (!ctx) throw new Error("useMenuContext must be used within MenuProvider");
    return ctx;
}
