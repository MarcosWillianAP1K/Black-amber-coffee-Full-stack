import * as z from "zod";

export const CreateInventorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().min(0).optional(),
  unit: z.string().min(1, "Unidade é obrigatória."),
  minQuantity: z.coerce.number().min(0).optional(),
  imgUrl: z.string().optional(),
});

export const UpdateInventorySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().min(0).optional(),
  unit: z.string().min(1).optional(),
  minQuantity: z.coerce.number().min(0).optional(),
  imgUrl: z.string().optional(),
});
