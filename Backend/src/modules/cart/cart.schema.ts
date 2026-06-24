import * as z from "zod";

export const AddCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  observation: z.string().nullable().optional(),
});

export const UpdateCartItemSchema = z
  .object({
    quantity: z.number().int().positive().optional(),
    observation: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.quantity !== undefined || data.observation !== undefined,
    "At least one field must be provided",
  );

export const cartItemResponseSchema = z.object({
  productId: z.number(),
  productPublicId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imgUrl: z.string().nullable(),
  price: z.number(),
  category: z.string(),
  quantity: z.number(),
  observation: z.string().nullable(),
  addedAt: z.string(),
});

export const cartResponseSchema = z.object({
  id: z.number(),
  itemCount: z.number(),
  subtotal: z.number(),
  items: z.array(cartItemResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetCartResponseSchema = z.object({
  data: cartResponseSchema,
});

export type AddCartItemRequest = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemSchema>;
export type GetCartResponse = z.infer<typeof GetCartResponseSchema>;
