import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../../core/middlewares/permission.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { PaymentController } from "../controllers/payment.controller.js";
import { SimulatePaymentSchema } from "../validators/payment.validator.js";

export const paymentRoutes = Router();

paymentRoutes.use(AuthMiddleware);
paymentRoutes.use(requireRole("user"));

paymentRoutes.post(
  "/simulate",
  validateSchemaMiddleware(SimulatePaymentSchema),
  (req, res, next) => void PaymentController.simulateCheckout(req, res, next),
);
