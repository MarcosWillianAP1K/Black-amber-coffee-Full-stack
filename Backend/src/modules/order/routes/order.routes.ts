import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireWorker, requireAdmin } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  CreateOrderRequestSchema,
  GetOrdersByStatusRequestSchema,
  UpdateOrderStatusRequestSchema,
} from "../order.schema";

/**
 * Creates unified order routes accessible by all authenticated users.
 * Permission and logic checks happen dynamically.
 */
export function createOrderRoutes(orderCtrl: OrderController): Router {
  const router = Router();

  // All order routes require authentication
  router.use(AuthMiddleware);

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: List orders (Workers get all, Users get their own)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [criado, em_preparo, pronto, finalizado, cancelado]
   *         description: Filter by status (worker/admin only)
   */
  router.get("/", (req, res, next) => {
    const isWorkerOrAdmin = req.user?.role !== undefined || req.user?.isAdmin;

    if (isWorkerOrAdmin) {
      if (req.query.status) {
        return orderCtrl.getByStatus(req, res, next);
      }
      return orderCtrl.getallByWorker(req, res, next);
    } else {
      // Client: list only their own orders
      return orderCtrl.getForUser(req, res, next);
    }
  });

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create a new order (handles both User and Worker logic)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - items
   *             properties:
   *               clientPublicId:
   *                 type: string
   *                 description: Optional client ID (worker creating on behalf of client)
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - productId
   *                     - quantity
   *                   properties:
   *                     productId:
   *                       type: integer
   *                     quantity:
   *                       type: integer
   *                     observation:
   *                       type: string
   *               paymentMethod:
   *                 type: string
   *                 enum: [pix, cartao_credito, cartao_debito, dinheiro]
   *               observation:
   *                 type: string
   */
  router.post(
    "/",
    validationMiddleware(CreateOrderRequestSchema),
    (req, res, next) => {
      const isWorkerOrAdmin = req.user?.role !== undefined || req.user?.isAdmin;

      if (isWorkerOrAdmin) {
        return orderCtrl.createForWorker(req, res, next);
      } else {
        return orderCtrl.createForUser(req, res, next);
      }
    }
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
   */
  router.get("/:publicId", requireWorker(), (req, res, next) =>
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
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [criado, em_preparo, pronto, finalizado, cancelado]
   */
  router.patch(
    "/:publicId/status",
    requireWorker(),
    validationMiddleware(UpdateOrderStatusRequestSchema),
    (req, res, next) => orderCtrl.updateStatus(req, res, next),
  );

  /**
   * @swagger
   * /api/orders/{publicId}/cancel:
   *   post:
   *     summary: Cancel an order
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   */
  router.post("/:publicId/cancel", (req, res, next) =>
    orderCtrl.cancelOrder(req, res, next),
  );

  /**
   * @swagger
   * /api/orders/{publicId}:
   *   delete:
   *     summary: Delete an order permanently (Admin only)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   */
  router.delete(
    "/:publicId",
    requireAdmin(),
    (req, res, next) => orderCtrl.deleteOrder(req, res, next),
  );

  return router;
}
