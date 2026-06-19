import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireWorker } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  CreateOrderRequestSchema,
  UpdateOrderStatusRequestSchema,
} from "../order.schema";

/**
 * Creates unified order routes accessible by workers and admins.
 * Permission checks happen at the action level.
 *
 * Endpoints:
 *   GET    /orders              → List all orders (worker/admin)
 *   POST   /orders              → Create order (worker/admin)
 *   GET    /orders/:publicId    → Get order by ID (worker/admin)
 *   PATCH  /orders/:publicId/status → Update order status (worker/admin)
 *   POST   /orders/:publicId/cancel  → Cancel order (worker/admin)
 */
export function createOrderRoutes(orderCtrl: OrderController): Router {
  const router = Router();

  // All order routes require authentication + worker/admin role
  router.use(AuthMiddleware, requireWorker());

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: List all orders (Worker/Admin)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of orders
   *       401:
   *         description: Não autorizado
   */
  router.get("/", (req, res, next) =>
    orderCtrl.getallByWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create a new order (Worker/Admin)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               clientPublicId:
   *                 type: string
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     productId:
   *                       type: integer
   *                     quantity:
   *                       type: integer
   *               paymentMethod:
   *                 type: string
   *               observation:
   *                 type: string
   *     responses:
   *       201:
   *         description: Pedido criado com sucesso
   */
  router.post(
    "/",
    validationMiddleware(CreateOrderRequestSchema),
    (req, res, next) => orderCtrl.createForWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/orders/{publicId}:
   *   get:
   *     summary: Get order by ID (Worker/Admin)
   *     tags: [Orders]
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
   *         description: Order found
   *       404:
   *         description: Order not found
   */
  router.get("/:publicId", (req, res, next) =>
    orderCtrl.getByPublicId(req, res, next),
  );

  /**
   * @swagger
   * /api/orders/{publicId}/status:
   *   patch:
   *     summary: Update order status (Worker/Admin)
   *     tags: [Orders]
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
   *                 enum: [PENDING, IN PROGRESS, COMPLETED, LATE, CANCELLED]
   *     responses:
   *       200:
   *         description: Status updated
   */
  router.patch(
    "/:publicId/status",
    validationMiddleware(UpdateOrderStatusRequestSchema),
    (req, res, next) => orderCtrl.updateStatus(req, res, next),
  );

  /**
   * @swagger
   * /api/orders/{publicId}/cancel:
   *   post:
   *     summary: Cancel an order (Worker/Admin)
   *     tags: [Orders]
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
   *         description: Order cancelled
   */
  router.post("/:publicId/cancel", (req, res, next) =>
    orderCtrl.cancelOrder(req, res, next),
  );

  return router;
}
