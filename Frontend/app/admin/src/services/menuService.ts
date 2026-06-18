/**
 * Menu Service — Data access layer for menu items (products).
 *
 * Integrated with backend /api/products and /api/admin/products endpoints.
 */

import type { Product, ProductInput } from "shared-utils/types/product";
import { MOCK_PRODUCTS } from "shared-utils/MockBD.js";
import { authFetch } from "./httpClient.ts";
import { API } from "shared-utils/core/APIroutes";

// Mock toggle — set to false to use real API
const USE_MOCK = false;

let nextId = 4;

// In-memory store (simulates server state)
let items = [...MOCK_PRODUCTS];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

interface PaginatedProductsResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

interface SingleProductResponse {
    data: Product;
}

interface ProductWithMessageResponse {
    data: Product;
    message?: string;
}

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/** Fetch all menu items */
export async function fetchMenuItems(): Promise<Product[]> {
    if (USE_MOCK) {
        return [...items];
    }

    const response = await authFetch(API.Products.List, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.status}`);
    }

    const payload = (await response.json()) as PaginatedProductsResponse;
    return payload.products;
}

/** Create a new menu item */
export async function createMenuItem(data: ProductInput): Promise<Product> {
    if (USE_MOCK) {
        const id = nextId++;
        const now = new Date().toISOString();
        const newItem: Product = {
            id,
            publicId: `product-${id}`,
            name: data.name,
            description: data.description ?? null,
            size: data.size ?? null,
            category: data.category,
            price: data.price,
            isActive: data.isActive ?? true,
            imageUrl: data.imageUrl ?? null,
            createdAt: now,
            updatedAt: now,
        };
        items = [...items, newItem];
        return newItem;
    }


    const response = await authFetch(API.AdminProducts.Create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            description: data.description ?? null,
            imageUrl: null, // image is uploaded separately via uploadProductImage()
            size: data.size ?? null,
            price: data.price,
            category: data.category,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create menu item: ${response.status}`);
    }

    const payload = (await response.json()) as SingleProductResponse;
    return payload.data;
}

/** Update an existing menu item */
export async function updateMenuItem(publicId: string, data: ProductInput): Promise<Product> {
    if (USE_MOCK) {
        const now = new Date().toISOString();
        const existing = items.find((item) => item.publicId === publicId);
        if (!existing) throw new Error(`Product ${publicId} not found`);
        const updated: Product = {
            id: existing.id,
            publicId,
            name: data.name,
            description: data.description ?? null,
            size: data.size ?? null,
            category: data.category,
            price: data.price,
            isActive: data.isActive ?? true,
            imageUrl: data.imageUrl ?? null,
            createdAt: existing.createdAt,
            updatedAt: now,
        };
        items = items.map((item) => (item.publicId === publicId ? updated : item));
        return updated;
    }

    const response = await authFetch(API.AdminProducts.UpdateById(publicId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            description: data.description ?? null,
            size: data.size ?? null,
            price: data.price,
            category: data.category,
            isActive: data.isActive,
            // imageUrl is intentionally omitted — image is uploaded via uploadProductImage()
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update menu item: ${response.status}`);
    }

    const payload = (await response.json()) as ProductWithMessageResponse;
    return payload.data;
}

/** Delete a menu item by publicId */
export async function deleteMenuItem(publicId: string): Promise<void> {
    if (USE_MOCK) {
        items = items.filter((item) => item.publicId !== publicId);
        return;
    }

    const response = await authFetch(API.AdminProducts.DeleteById(publicId), {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete menu item: ${response.status}`);
    }
}

/** Upload a product image */
export async function uploadProductImage(publicId: string, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await authFetch(API.AdminProducts.UploadImageById(publicId), {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status}`);
    }

    const payload = (await response.json()) as ProductWithMessageResponse;
    return payload.data;
}

/** Activate a product */
export async function activateProduct(publicId: string): Promise<Product> {
    const response = await authFetch(API.AdminProducts.ActiveProductsByID(publicId), {
        method: "PATCH",
    });

    if (!response.ok) {
        throw new Error(`Failed to activate product: ${response.status}`);
    }

    const payload = (await response.json()) as ProductWithMessageResponse;
    return payload.data;
}

/** Deactivate a product */
export async function deactivateProduct(publicId: string): Promise<Product> {
    const response = await authFetch(API.AdminProducts.DesactiveProductsByID(publicId), {
        method: "PATCH",
    });

    if (!response.ok) {
        throw new Error(`Failed to deactivate product: ${response.status}`);
    }

    const payload = (await response.json()) as ProductWithMessageResponse;
    return payload.data;
}

interface ProductStock {
    productId: number;
    quantity: number;
    minQuantity: number;
    createdAt: string;
    updatedAt: string;
}

interface StockResponse {
    data: ProductStock;
}

interface StockUpdatePayload {
    quantity: number;
    minQuantity: number;
}

/** Get product stock */
export async function getProductStock(publicId: string): Promise<ProductStock> {
    const response = await authFetch(API.AdminProducts.GetProductsById(publicId), {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to get stock: ${response.status}`);
    }

    const payload = (await response.json()) as StockResponse;
    return payload.data;
}

/** Update product stock */
export async function updateProductStock(publicId: string, data: StockUpdatePayload): Promise<ProductStock> {
    const response = await authFetch(API.AdminProducts.UpdateProductsById(publicId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.status}`);
    }

    const payload = (await response.json()) as { data: ProductStock; message?: string };
    return payload.data;
}
