import * as z from "zod";

// --- Product Schemas ---

export const productSchema = z.object({
  id: z.number(),
  publicId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  size: z.string().nullable(),
  price: z.number(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Request Schemas ---

export const CreateProductRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  size: z.string().nullable(),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
});

export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  category: z.string().min(1, "Category is required").optional(),
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const filterProductsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
});

// --- Response Schemas ---

export const paginatedProductsSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const productDetailSchema = z.object({
  id: z.number(),
  publicId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  size: z.string().nullable(),
  price: z.number(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productListItemSchema = z.object({
  id: z.number(),
  publicId: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productCategoriesSchema = z.array(z.string());

export const productStockSchema = z.object({
    productId: z.number(),
    quantity: z.number(),
    minQuantity: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const stockUpdateRequestSchema = z.object({
    quantity: z.number().int().positive(),
    minQuantity: z.number().int().positive(),
});

export const stockResponseSchema = z.object({
    productId: z.number(),
    quantity: z.number(),
    minQuantity: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});


//  --- types ---

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type FilterProductsRequest = z.infer<typeof filterProductsSchema>;
export type PaginationRequest = z.infer<typeof paginationSchema>;

export type Product = z.infer<typeof productSchema>;
export type ProductDetailResponse = z.infer<typeof productDetailSchema>;
export type ProductListItemResponse = z.infer<typeof productListItemSchema>;
export type PaginatedProductsResponse = z.infer<typeof paginatedProductsSchema>;
export type ProductCategoriesResponse = z.infer<typeof productCategoriesSchema>;
export type ProductStockResponse = z.infer<typeof productStockSchema>;
export type StockUpdateRequest = z.infer<typeof stockUpdateRequestSchema>;
