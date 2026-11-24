import * as z from "zod";
import { OrderStatus, PaymentMethod } from "../../../core/enums/index.js";

export const CreateOrderSchema = z.object({
  clientPublicId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        observation: z.string().nullable().optional(),
      }),
    )
    .min(1, "Informe ao menos um item para o pedido."),
  paymentMethod: z.enum(PaymentMethod.VALUES, { message: "Método de pagamento inválido." }).optional(),
  observation: z.string().nullable().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus.VALUES, { message: "Status do pedido inválido." }),
});
