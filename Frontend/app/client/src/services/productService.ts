import type { Product } from "shared-utils/types/product";
import { API } from "shared-utils/core/APIroutes";
import { authFetch } from "./httpClient.ts";

interface PaginatedProductsResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

interface FilteredProductsResponse {
    products: Product[];
}

export async function fetchProducts(category?: string): Promise<Product[]> {
    const url = category
        ? `${API.Products.List}?category=${encodeURIComponent(category)}`
        : API.Products.List;

    const response = await authFetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);

    const payload = (await response.json()) as PaginatedProductsResponse | FilteredProductsResponse;
    return payload.products.filter((p) => p.isActive);
}

export async function fetchCategories(): Promise<string[]> {
    const response = await authFetch(API.Products.ListCategories, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);

    const payload = (await response.json()) as { data: string[] };
    return payload.data;
}
