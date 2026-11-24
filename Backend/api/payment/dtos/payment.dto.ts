import type * as z from "zod";
import type { OrderDTO } from "../../order/dtos/order.dto.js";
import type { SimulatePaymentSchema } from "../validators/payment.validator.js";

export interface PaymentDTO {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatePaymentResponseDTO {
  data: {
    order: OrderDTO;
    payment: PaymentDTO;
  };
  message: string;
}

export type SimulatePaymentInput = z.infer<typeof SimulatePaymentSchema>;
