import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { UpdateOrderStatusRequestSchema } from "../order.schema";

/**
 * Creates worker-facing order routes.
 * All routes require authentication (AuthMiddleware applied at router level).
 *
 * Endpoints:
 *   GET   /worker/orders/:publicId        → Get order by ID
 *   GET   /worker/orders                  → List all orders
 *   PATCH /worker/orders/:publicId/status → Update order status
 */
export function createWorkerOrderRoutes(orderCtrl: OrderController): Router {
  const router = Router();

  // All worker order routes require authentication
  router.use(AuthMiddleware);

  /**
   * @swagger
   * /api/worker/orders/{publicId}:
   *   get:
   *     summary: Buscar pedido por ID (worker)
   *     tags:
   *       - Orders (Worker)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Pedido encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     publicId:
   *                       type: string
   *                     code:
   *                       type: string
   *                     status:
   *                       type: string
   *                     totalPrice:
   *                       type: number
   *                     paymentMethod:
   *                       type: string
   *                       nullable: true
   *                     observation:
   *                       type: string
   *                       nullable: true
   *                     itens:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: number
   *                           name:
   *                             type: string
   *                           price:
   *                             type: number
   *                           quantity:
   *                             type: number
   *                           observation:
   *                             type: string
   *                             nullable: true
   *                     createdAt:
   *                       type: string
   *                     updatedAt:
   *                       type: string
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Pedido não encontrado
   */
  router.get("/worker/orders/:publicId", (req, res, next) =>
    orderCtrl.getByPublicId(req, res, next),
  );

  /**
   * @swagger
   * /api/worker/orders:
   *   get:
   *     summary: Listar todos os pedidos (worker)
   *     tags:
   *       - Orders (Worker)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pedidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       publicId:
   *                         type: string
   *                       code:
   *                         type: string
   *                       status:
   *                         type: string
   *                       totalPrice:
   *                         type: number
   *                       paymentMethod:
   *                         type: string
   *                         nullable: true
   *                       observation:
   *                         type: string
   *                         nullable: true
   *                       itens:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: number
   *                             name:
   *                               type: string
   *                             price:
   *                               type: number
   *                             quantity:
   *                               type: number
   *                             observation:
   *                               type: string
   *                               nullable: true
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Pedido não encontrado
   */
  router.get("/worker/orders", (req, res, next) =>
    orderCtrl.getallByWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/worker/orders/{publicId}/status:
   *   patch:
   *     summary: Atualizar status do pedido (worker)
   *     tags:
   *       - Orders (Worker)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum:
   *                   - PENDING
   *                   - IN PROGRESS
   *                   - COMPLETED
   *                   - LATE
   *                   - CANCELLED
   *     responses:
   *       200:
   *         description: Status atualizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     publicId:
   *                       type: string
   *                     code:
   *                       type: string
   *                     status:
   *                       type: string
   *                     totalPrice:
   *                       type: number
   *                     paymentMethod:
   *                       type: string
   *                       nullable: true
   *                     observation:
   *                       type: string
   *                       nullable: true
   *                     itens:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: number
   *                           name:
   *                             type: string
   *                           price:
   *                             type: number
   *                           quantity:
   *                             type: number
   *                           observation:
   *                             type: string
   *                             nullable: true
   *                     createdAt:
   *                       type: string
   *                     updatedAt:
   *                       type: string
   *       400:
   *         description: Transição de status inválida
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Pedido não encontrado
   */
  router.patch(
    "/worker/orders/:publicId/status",
    validationMiddleware(UpdateOrderStatusRequestSchema),
    (req, res, next) => orderCtrl.updateStatus(req, res, next),
  );

  return router;
}
