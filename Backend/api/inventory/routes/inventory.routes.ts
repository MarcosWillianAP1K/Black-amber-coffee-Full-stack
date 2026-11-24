import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin } from "../../../core/middlewares/permission.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { InventoryController } from "../controllers/inventory.controller.js";
import { CreateInventorySchema, UpdateInventorySchema } from "../validators/inventory.validator.js";

export const inventoryRoutes = Router();

inventoryRoutes.use(AuthMiddleware);

inventoryRoutes.get("/", (req, res, next) => void InventoryController.listAll(req, res, next));
inventoryRoutes.get("/:publicId", (req, res, next) =>
  void InventoryController.getById(req, res, next),
);

inventoryRoutes.post(
  "/create",
  requireAdmin(),
  validateSchemaMiddleware(CreateInventorySchema),
  (req, res, next) => void InventoryController.create(req, res, next),
);

inventoryRoutes.post(
  "/add-stock",
  requireAdmin(),
  validateSchemaMiddleware(CreateInventorySchema),
  (req, res, next) => void InventoryController.addStock(req, res, next),
);

inventoryRoutes.put(
  "/:publicId",
  requireAdmin(),
  validateSchemaMiddleware(UpdateInventorySchema),
  (req, res, next) => void InventoryController.update(req, res, next),
);

inventoryRoutes.delete("/:publicId", requireAdmin(), (req, res, next) =>
  void InventoryController.remove(req, res, next),
);
