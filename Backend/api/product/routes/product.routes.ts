import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin } from "../../../core/middlewares/permission.middleware.js";
import { avatarUploadMiddleware } from "../../../core/middlewares/upload.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { ProductController } from "../controllers/product.controller.js";
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateProductStockSchema,
} from "../validators/product.validator.js";

export const productRoutes = Router();

productRoutes.use(AuthMiddleware);

productRoutes.get("/", (req, res, next) => void ProductController.list(req, res, next));
productRoutes.get("/categories", (req, res, next) =>
  void ProductController.listCategories(req, res, next),
);
productRoutes.get("/:publicId", (req, res, next) =>
  void ProductController.getByPublicId(req, res, next),
);
productRoutes.get("/:publicId/stock", (req, res, next) =>
  void ProductController.getStock(req, res, next),
);

productRoutes.post(
  "/",
  requireAdmin(),
  validateSchemaMiddleware(CreateProductSchema),
  (req, res, next) => void ProductController.create(req, res, next),
);

productRoutes.put(
  "/:publicId",
  requireAdmin(),
  validateSchemaMiddleware(UpdateProductSchema),
  (req, res, next) => void ProductController.update(req, res, next),
);

productRoutes.delete("/:publicId", requireAdmin(), (req, res, next) =>
  void ProductController.remove(req, res, next),
);

productRoutes.post(
  "/:publicId/image",
  requireAdmin(),
  avatarUploadMiddleware,
  (req, res, next) => void ProductController.uploadImage(req, res, next),
);

productRoutes.patch("/:publicId/activate", requireAdmin(), (req, res, next) =>
  void ProductController.activate(req, res, next),
);

productRoutes.patch("/:publicId/deactivate", requireAdmin(), (req, res, next) =>
  void ProductController.deactivate(req, res, next),
);

productRoutes.patch(
  "/:publicId/stock",
  requireAdmin(),
  validateSchemaMiddleware(UpdateProductStockSchema),
  (req, res, next) => void ProductController.updateStock(req, res, next),
);
