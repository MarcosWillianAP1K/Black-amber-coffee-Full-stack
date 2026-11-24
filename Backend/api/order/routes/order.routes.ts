import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin, requireWorker } from "../../../core/middlewares/permission.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { OrderController } from "../controllers/order.controller.js";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../validators/order.validator.js";

export const orderRoutes = Router();

orderRoutes.use(AuthMiddleware);

orderRoutes.get("/", (req, res, next) => void OrderController.list(req, res, next));

orderRoutes.post(
  "/",
  validateSchemaMiddleware(CreateOrderSchema),
  (req, res, next) => void OrderController.create(req, res, next),
);

orderRoutes.get("/:publicId", requireWorker(), (req, res, next) =>
  void OrderController.getByPublicId(req, res, next),
);

orderRoutes.patch(
  "/:publicId/status",
  requireWorker(),
  validateSchemaMiddleware(UpdateOrderStatusSchema),
  (req, res, next) => void OrderController.updateStatus(req, res, next),
);

orderRoutes.post("/:publicId/cancel", (req, res, next) =>
  void OrderController.cancel(req, res, next),
);

orderRoutes.delete("/:publicId", requireAdmin(), (req, res, next) =>
  void OrderController.remove(req, res, next),
);
