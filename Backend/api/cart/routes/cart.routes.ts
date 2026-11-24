import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../../core/middlewares/permission.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { CartController } from "../controllers/cart.controller.js";
import { AddCartItemSchema, UpdateCartItemSchema } from "../validators/cart.validator.js";

export const cartRoutes = Router();

cartRoutes.use(AuthMiddleware);
cartRoutes.use(requireRole("user"));

cartRoutes.get("/", (req, res, next) => void CartController.getCart(req, res, next));

cartRoutes.post(
  "/items",
  validateSchemaMiddleware(AddCartItemSchema),
  (req, res, next) => void CartController.addItem(req, res, next),
);

cartRoutes.patch(
  "/items/:productId",
  validateSchemaMiddleware(UpdateCartItemSchema),
  (req, res, next) => void CartController.updateItem(req, res, next),
);

cartRoutes.delete("/items/:productId", (req, res, next) =>
  void CartController.removeItem(req, res, next),
);

cartRoutes.delete("/", (req, res, next) => void CartController.clearCart(req, res, next));
