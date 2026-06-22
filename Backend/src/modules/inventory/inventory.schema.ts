import * as z from "zod";

export const CreateInventoryRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantityType: z.string().optional(),
  quantity: z.number().optional(),
  img: z.string().optional(),
});

export type CreateInventoryInput = z.infer<typeof CreateInventoryRequestSchema>;

export const UpdateInventoryRequestSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantityType: z.string().optional(),
  quantity: z.number().optional(),
  img: z.string().optional(),
});

export type UpdateInventoryInput = z.infer<typeof UpdateInventoryRequestSchema>;

export const InventoryResponseSchema = z.object({
  publicId: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  quantityType: z.string().nullable(),
  quantity: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  img: z.string().nullable(),
});

export type InventoryResponse = z.infer<typeof InventoryResponseSchema>;
