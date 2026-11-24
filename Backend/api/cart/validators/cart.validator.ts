import * as z from "zod";

export const AddCartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1),
  observation: z.string().nullable().optional(),
});

export const UpdateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().positive().optional(),
    observation: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.quantity !== undefined || data.observation !== undefined,
    "Informe ao menos um campo para atualização.",
  );
