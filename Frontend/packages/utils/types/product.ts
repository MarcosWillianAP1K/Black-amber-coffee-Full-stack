/**
 * Product domain types aligned with backend product schema.
 */

/** Represents a single product from the menu catalog */
export interface Product {
    id: number;
    publicId: string;
    name: string;
    description: string | null;
    size: string | null;
    price: number;
    category: string;
    isActive: boolean;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Payload used when creating or editing a product */
export interface ProductInput {
    name: string;
    description?: string | null;
    size?: string | null;
    price: number;
    category: string;
    isActive?: boolean;
    imageUrl?: string;
    imageFile?: File | null;
}

/** Available product categories (UI only) */
export const PRODUCT_CATEGORIES = [
    "COFFEE",
    "DRINKS",
    "FOOD",
    "OTHER"
] as const;

export type ProductCategory = string;
