import type * as z from "zod";
import type { AddCartItemSchema, UpdateCartItemSchema } from "../validators/cart.validator.js";

export interface CartItemDTO {
  productId: number;
  productPublicId: string;
  name: string;
  description: string | null;
  imgUrl: string | null;
  price: number;
  category: string;
  quantity: number;
  observation: string | null;
  addedAt: string;
}

export interface CartDTO {
  id: number;
  itemCount: number;
  subtotal: number;
  items: CartItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
