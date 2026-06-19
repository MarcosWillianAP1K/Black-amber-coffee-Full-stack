import { Router } from "express";
import ProductController from "../product.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireWorker, requireAdmin } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  stockUpdateRequestSchema,
} from "../product.schema";

/**
 * Creates unified product routes.
 * - List/Get products: accessible by all authenticated (worker/admin)
 * - Create/Update/Delete: admin only
 *
 * Endpoints:
 *   GET    /products                  → List products (all authenticated)
 *   GET    /products/categories       → List categories (all authenticated)
 *   GET    /products/:publicId        → Get product by ID (all authenticated)
 *   POST   /products                  → Create product (admin only)
 *   PUT    /products/:publicId        → Update product (admin only)
 *   DELETE /products/:publicId        → Delete product (admin only)
 *   POST   /products/:publicId/image  → Upload image (admin only)
 *   PATCH  /products/:publicId/activate   → Activate (admin only)
 *   PATCH  /products/:publicId/deactivate → Deactivate (admin only)
 *   GET    /products/:publicId/stock      → Get stock (worker/admin)
 *   PATCH  /products/:publicId/stock      → Update stock (admin only)
 */
export function createProductRoutes(productCtrl: ProductController): Router {
  const router = Router();

  // All product routes require authentication
  router.use(AuthMiddleware);

  // ============================================================
  // Public (authenticated) routes - Workers and Admins
  // ============================================================

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: List all products (authenticated)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: List of products
   */
  router.get("/", (req, res, next) => productCtrl.getAll(req, res, next));

  /**
   * @swagger
   * /api/products/categories:
   *   get:
   *     summary: List all product categories
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of categories
   */
  router.get("/categories", (req, res, next) =>
    productCtrl.getCategories(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
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
   *         description: Product found
   */
  router.get("/:publicId", (req, res, next) =>
    productCtrl.getByPublicId(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}/stock:
   *   get:
   *     summary: Get product stock (Worker/Admin)
   *     tags: [Products]
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
   *         description: Stock info
   */
  router.get("/:publicId/stock", (req, res, next) =>
    productCtrl.getStock(req, res, next),
  );

  // ============================================================
  // Admin-only routes - Middleware applied per route
  // ============================================================

  /**
   * @swagger
   * /api/products:
   *   post:
   *     summary: Create a new product (admin only)
   *     tags: [Products - Admin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - category
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               category:
   *                 type: string
   *               size:
   *                 type: string
   *     responses:
   *       201:
   *         description: Product created
   */
  router.post(
    "/",
    requireAdmin(),
    validationMiddleware(CreateProductRequestSchema),
    (req, res, next) => productCtrl.create(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}:
   *   put:
   *     summary: Update a product (admin only)
   *     tags: [Products - Admin]
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
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               category:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Product updated
   */
  router.put(
    "/:publicId",
    requireAdmin(),
    validationMiddleware(UpdateProductRequestSchema),
    (req, res, next) => productCtrl.update(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}:
   *   delete:
   *     summary: Delete a product (admin only)
   *     tags: [Products - Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Product deleted
   */
  router.delete(
    "/:publicId",
    requireAdmin(),
    (req, res, next) => productCtrl.delete(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}/image:
   *   post:
   *     summary: Upload product image (admin only)
   *     tags: [Products - Admin]
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
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               avatar:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Image uploaded successfully
   */
  router.post(
    "/:publicId/image",
    requireAdmin(),
    avatarUploadMiddleware,
    (req, res, next) => productCtrl.uploadImage(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}/activate:
   *   patch:
   *     summary: Activate a product (admin only)
   *     tags: [Products - Admin]
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
   *         description: Product activated
   */
  router.patch(
    "/:publicId/activate",
    requireAdmin(),
    (req, res, next) => productCtrl.activate(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}/deactivate:
   *   patch:
   *     summary: Deactivate a product (admin only)
   *     tags: [Products - Admin]
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
   *         description: Product deactivated
   */
  router.patch(
    "/:publicId/deactivate",
    requireAdmin(),
    (req, res, next) => productCtrl.deactivate(req, res, next),
  );

  /**
   * @swagger
   * /api/products/{publicId}/stock:
   *   patch:
   *     summary: Update product stock (admin only)
   *     tags: [Products - Admin]
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
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *               minQuantity:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Stock updated
   */
  router.patch(
    "/:publicId/stock",
    requireAdmin(),
    validationMiddleware(stockUpdateRequestSchema),
    (req, res, next) => productCtrl.updateStock(req, res, next),
  );

  return router;
}
