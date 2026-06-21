import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireWorker } from "@/shared/middlewares/permission.middleware";
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
   *     summary: List orders (Workers get all, Users get by status)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   */
  router.get("/", (req, res, next) => {
    const role = req.user?.role;
    const isWorkerOrAdmin = role === "worker" || role === "admin" || req.user?.isAdmin;

    if (isWorkerOrAdmin) {
      if (req.query.status) {
        return orderCtrl.getByStatus(req, res, next);
      }
      return orderCtrl.getallByWorker(req, res, next);
    } else {
      // Replaces user get orders logic
      req.query = req.query || {};
      return orderCtrl.getByStatus(req, res, next);
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
   */
  router.post(
    "/",
    validationMiddleware(CreateOrderRequestSchema),
    (req, res, next) => {
      const role = req.user?.role;
      const isWorkerOrAdmin = role === "worker" || role === "admin" || req.user?.isAdmin;

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
   */
  router.post("/:publicId/cancel", (req, res, next) =>
    orderCtrl.cancelOrder(req, res, next),
  );

  return router;
}
