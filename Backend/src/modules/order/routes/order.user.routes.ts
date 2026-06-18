import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  CreateOrderRequestSchema,
  GetOrdersByStatusRequestSchema,
} from "../order.schema";

/**
 * Creates user-facing order routes.
 * All routes require authentication (AuthMiddleware applied at router level).
 *
 * Endpoints:
 *   POST /user/orders                  → Create a new order
 *   POST /user/orders/:publicId/cancel → Cancel an order
 *   GET  /user/orders                  → List orders by status
 */
export function createUserOrderRoutes(orderCtrl: OrderController): Router {
  const router = Router();

  // All user order routes require authentication
  router.use(AuthMiddleware);

  router.post(
    "/user/orders",
    validationMiddleware(CreateOrderRequestSchema),
    (req, res, next) => orderCtrl.createForUser(req, res, next),
  );

  router.post(
    "/user/orders/:publicId/cancel",
    (req, res, next) => orderCtrl.cancelOrder(req, res, next),
  );

  router.get(
    "/user/orders",
    validationMiddleware(GetOrdersByStatusRequestSchema, "query"),
    (req, res, next) => orderCtrl.getByStatus(req, res, next),
  );

  return router;
}
