import type * as z from "zod";
import type {
  CreateInventorySchema,
  UpdateInventorySchema,
} from "../validators/inventory.validator.js";

export interface InventoryItemDTO {
  publicId: string;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  minQuantity: number;
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
