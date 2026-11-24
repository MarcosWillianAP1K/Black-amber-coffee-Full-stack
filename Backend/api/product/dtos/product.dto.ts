import type * as z from "zod";
import type { ProductCategoryType } from "../../../core/enums/index.js";
import type {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateProductStockSchema,
} from "../validators/product.validator.js";

export interface ProductDTO {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  imgUrl: string | null;
  price: number;
  category: ProductCategoryType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockDTO {
  productId: number;
  quantity: number;
  minQuantity: number;
  updatedAt: string;
}

export interface PaginatedProductsDTO {
  products: ProductDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterProductsInput {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateProductStockInput = z.infer<typeof UpdateProductStockSchema>;
