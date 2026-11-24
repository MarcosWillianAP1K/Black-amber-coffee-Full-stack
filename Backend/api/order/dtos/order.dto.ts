import type * as z from "zod";
import type { OrderStatusType, PaymentMethodType } from "../../../core/enums/index.js";
import type { CreateOrderSchema, UpdateOrderStatusSchema } from "../validators/order.validator.js";

export interface OrderItemDTO {
  id: number;
  name: string;
  price: number;
  quantity: number;
  observation: string | null;
}

export interface OrderDTO {
  id: number;
  publicId: string;
  code: string;
  clientId: number | null;
  updatedBy: number | null;
  status: OrderStatusType;
  totalPrice: number;
  paymentMethod: PaymentMethodType | string | null;
  itens: OrderItemDTO[];
  observation: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
