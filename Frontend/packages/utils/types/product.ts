/**
 * Product domain types aligned with backend product schema.
 */

/** Represents a single product from the menu catalog */
export interface Product {
    id: number;
    publicId: string;
    name: string;
    description: string | null;
    imgUrl: string | null;
    price: number;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Payload used when creating or editing a product */
export interface ProductInput {
    name: string;
    description?: string | null;
    imgUrl?: string | null;
    price: number;
    category: string;
    isActive?: boolean;
    imageFile?: File | null;
}

/** Available product categories (backend enum) */
export const PRODUCT_CATEGORIES = [
    "cafe",
    "cha",
    "suco",
    "smoothie",
    "lanche",
    "sobremesa",
    "outro",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Display labels for product categories */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
    cafe: "Café",
    cha: "Chá",
    suco: "Suco",
    smoothie: "Smoothie",
    lanche: "Lanche",
    sobremesa: "Sobremesa",
    outro: "Outro",
};
