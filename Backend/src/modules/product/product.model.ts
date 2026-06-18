import { ProductCategoryType } from "@/core/enuns/proudcCategory";

export default class ProductModel {
    id: number;
    publicId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    size: string | null;
    price: number;
    category: ProductCategoryType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    constructor(
        id: number,
        publicId: string,
        name: string,
        description: string | null,
        imageUrl: string | null,
        size: string | null,
        price: number,
        category: ProductCategoryType,
        isActive: boolean,
        createdAt: string,
        updatedAt: string
    ) {
        this.id = id;
        this.publicId = publicId;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.size = size;
        this.price = price;
        this.category = category;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromDatabase(product: any): ProductModel {
        return new ProductModel(
            product.id,
            product.publicId,
            product.name,
            product.description ?? null,
            product.img ?? null,
            product.size ?? null,
            Number(product.price),
            product.category,
            Boolean(product.isActive),
            toISO(product.createdAt),
            toISO(product.updatedAt)
        );
    }
}

function toISO(value: unknown): string {
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    return new Date().toISOString();
}