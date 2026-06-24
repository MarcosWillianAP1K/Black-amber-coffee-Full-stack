import { Router } from "express";
import PaymentController from "../payment.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireRole } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { SimulatePaymentSchema } from "../payment.schema";

export function createPaymentRoutes(paymentCtrl: PaymentController): Router {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(requireRole("user"));

  /**
   * @swagger
   * /api/payments/simulate:
   *   post:
   *     summary: Simula um checkout e cria um pedido
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - paymentMethod
   *             properties:
   *               paymentMethod:
   *                 type: string
   *                 enum: [pix, cartao_credito, cartao_debito, dinheiro]
   *                 example: pix
   *               observation:
   *                 type: string
   *                 example: "Sem cebola"
   *     responses:
   *       201:
   *         description: Checkout simulado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   */
  router.post(
    "/simulate",
    validationMiddleware(SimulatePaymentSchema),
    (req, res, next) => paymentCtrl.simulateCheckout(req, res, next),
  );

  return router;
}
