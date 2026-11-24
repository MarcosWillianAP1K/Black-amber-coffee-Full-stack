import * as z from "zod";
import { PaymentMethod } from "../../../core/enums/index.js";

export const SimulatePaymentSchema = z.object({
  paymentMethod: z.enum(PaymentMethod.VALUES, {
    message: "Método de pagamento inválido.",
  }),
  observation: z.string().nullable().optional(),
});
