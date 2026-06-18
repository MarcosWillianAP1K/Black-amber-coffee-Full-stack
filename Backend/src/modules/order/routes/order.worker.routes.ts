import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { CreateOrderRequestSchema, UpdateOrderStatusRequestSchema } from "../order.schema";

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

  router.post(
    "/worker/orders",
    validationMiddleware(CreateOrderRequestSchema),
    (req, res, next) => orderCtrl.createForWorker(req, res, next),
  );

  router.get("/worker/orders/:publicId", (req, res, next) =>
    orderCtrl.getByPublicId(req, res, next),
  );

  router.get("/worker/orders", (req, res, next) =>
    orderCtrl.getallByWorker(req, res, next),
  );

  router.patch(
    "/worker/orders/:publicId/status",
    validationMiddleware(UpdateOrderStatusRequestSchema),
    (req, res, next) => orderCtrl.updateStatus(req, res, next),
  );

  router.post("/worker/orders/:publicId/cancel", (req, res, next) =>
    orderCtrl.cancelOrder(req, res, next),
  );

  return router;
}
