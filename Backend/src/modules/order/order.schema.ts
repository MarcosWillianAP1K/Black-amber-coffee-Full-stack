import * as z from "zod";
import { OrderStatus } from "../../core/enuns/orederStatus";
import { PaymentMethod } from "../../core/enuns/payment.types";

// --- Item Schemas ---

export const orderItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  observation: z.string().nullable(),
});

// --- Request Schemas ---

export const CreateOrderRequestSchema = z.object({
  clientPublicId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        observation: z.string().nullable().optional(),
      }),
    )
    .min(1, "At least one item is required"),
  paymentMethod: z
    .enum(PaymentMethod.VALUES, {
      message: "Invalid payment method",
    })
    .optional(),
  observation: z.string().nullable().optional(),
});

export const GetOrdersByStatusRequestSchema = z.object({
  status: z.enum(OrderStatus.VALUES, {
    message: "Invalid order status",
  }),
});

export const UpdateOrderStatusRequestSchema = z.object({
  status: z.enum(OrderStatus.VALUES, {
    message: "Invalid order status",
  }),
});

// --- Response Schemas ---

export const orderSchema = z.object({
  id: z.number(),
  publicId: z.string(),
  code: z.string(),
  clientId: z.number().nullable(),
  updatedBy: z.number().nullable(),
  status: z.enum(OrderStatus.VALUES, { message: "Invalid order status" }),
  totalPrice: z.number(),
  paymentMethod: z
    .enum(PaymentMethod.VALUES, {
      message: "Invalid payment method",
    })
    .nullable(),
  itens: z.array(orderItemSchema),
  observation: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateOrderResponseSchema = z.object({
  data: orderSchema,
});

export const GetOrdersByStatusResponseSchema = z.object({
  data: z.array(orderSchema),
});

// --- Types ---

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;
export type GetOrdersByStatusRequest = z.infer<
  typeof GetOrdersByStatusRequestSchema
>;
export type GetOrdersByStatusResponse = z.infer<
  typeof GetOrdersByStatusResponseSchema
>;
export type UpdateOrderStatusRequest = z.infer<
  typeof UpdateOrderStatusRequestSchema
>;