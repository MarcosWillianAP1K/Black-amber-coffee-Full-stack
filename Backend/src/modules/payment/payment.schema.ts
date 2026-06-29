import * as z from "zod";
import { PaymentMethod } from "../../core/enuns/payment.types";

export const SimulatePaymentSchema = z.object({
  paymentMethod: z.enum(PaymentMethod.VALUES, {
    message: "Invalid payment method",
  }),
  observation: z.string().nullable().optional(),
});

export const paymentResponseSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  amount: z.number(),
  method: z.string(),
  status: z.string(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SimulatePaymentResponseSchema = z.object({
  data: z.object({
    order: z.object({
      id: z.number(),
      publicId: z.string(),
      code: z.string(),
      status: z.string(),
      totalPrice: z.number(),
      paymentMethod: z.string().nullable(),
      itens: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          observation: z.string().nullable(),
        }),
      ),
      observation: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    payment: paymentResponseSchema,
  }),
  message: z.string().optional(),
});

export type SimulatePaymentRequest = z.infer<typeof SimulatePaymentSchema>;
export type SimulatePaymentResponse = z.infer<typeof SimulatePaymentResponseSchema>;
