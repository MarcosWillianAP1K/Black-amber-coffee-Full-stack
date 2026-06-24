import * as z from "zod";

export const CreateInventoryRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().min(1, "Unit is required"),
  minQuantity: z.number().optional(),
  imgUrl: z.string().optional(),
});

export type CreateInventoryInput = z.infer<typeof CreateInventoryRequestSchema>;

export const UpdateInventoryRequestSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  minQuantity: z.number().optional(),
  imgUrl: z.string().optional(),
});

export type UpdateInventoryInput = z.infer<typeof UpdateInventoryRequestSchema>;

export const InventoryResponseSchema = z.object({
  publicId: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  quantity: z.number(),
  unit: z.string(),
  minQuantity: z.number(),
  imgUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InventoryResponse = z.infer<typeof InventoryResponseSchema>;
