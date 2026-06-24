import { Router } from "express";
import ProductController from "../product.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { AdminMiddleware } from "@/shared/middlewares/admin.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  stockUpdateRequestSchema,
} from "../product.schema";

/**
 * Creates admin-only product routes.
 * All routes require Auth + Admin middleware (applied at router level).
 *
 * Endpoints:
 *   POST   /admin/products                       → Create product
 *   PUT    /admin/products/:publicId              → Update product
 *   DELETE /admin/products/:publicId              → Delete product
 *   POST   /admin/products/:publicId/image        → Upload product image
 *   PATCH  /admin/products/:publicId/activate     → Activate product
 *   PATCH  /admin/products/:publicId/deactivate   → Deactivate product
 *   GET    /admin/products/:publicId/stock        → Get product stock
 *   PATCH  /admin/products/:publicId/stock        → Update product stock
 */
export function createAdminProductRoutes(productCtrl: ProductController): Router {
  const router = Router();

  // All admin product routes require Auth + Admin middleware
  router.use(AuthMiddleware, AdminMiddleware);

  /**
   * @swagger
   * /api/admin/products:
   *   post:
   *     summary: Create a new product (admin only)
   *     tags: [Admin - Products]
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
   *                 example: "Café Expresso"
   *               description:
   *                 type: string
   *                 nullable: true
   *                 example: "Café puro e encorpado"
   *               imageUrl:
   *                 type: string
   *                 nullable: true
   *               size:
   *                 type: string
   *                 nullable: true
   *                 example: "150ml"
   *               price:
   *                 type: number
   *                 example: 5.00
   *               category:
   *                 type: string
   *                 example: "cafe"
   *     responses:
   *       201:
   *         description: Product created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     publicId:
   *                       type: string
   *                     name:
   *                       type: string
   *                     description:
   *                       type: string
   *                       nullable: true
   *                     imageUrl:
   *                       type: string
   *                       nullable: true
   *                     size:
   *                       type: string
   *                       nullable: true
   *                     price:
   *                       type: number
   *                     category:
   *                       type: string
   *                     isActive:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   */
  router.post(
    "/admin/products",
    validationMiddleware(CreateProductRequestSchema),
    (req, res, next) => productCtrl.create(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}:
   *   put:
   *     summary: Update a product (admin only)
   *     tags: [Admin - Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *         example: "abc123def"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Café Expresso Premium"
   *               description:
   *                 type: string
   *                 nullable: true
   *               imageUrl:
   *                 type: string
   *                 nullable: true
   *               size:
   *                 type: string
   *                 nullable: true
   *               price:
   *                 type: number
   *                 example: 7.00
   *               category:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Product updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     publicId:
   *                       type: string
   *                     name:
   *                       type: string
   *                     description:
   *                       type: string
   *                       nullable: true
   *                     imageUrl:
   *                       type: string
   *                       nullable: true
   *                     size:
   *                       type: string
   *                       nullable: true
   *                     price:
   *                       type: number
   *                     category:
   *                       type: string
   *                     isActive:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *                   example: "Product updated successfully"
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.put(
    "/admin/products/:publicId",
    validationMiddleware(UpdateProductRequestSchema),
    (req, res, next) => productCtrl.update(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}:
   *   delete:
   *     summary: Delete a product (admin only)
   *     tags: [Admin - Products]
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
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.delete(
    "/admin/products/:publicId",
    (req, res, next) => productCtrl.delete(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}/image:
   *   post:
   *     summary: Upload product image (admin only)
   *     tags: [Admin - Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *         example: "abc123def"
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
   *                 description: Imagem do produto (jpg, png, webp) até 5MB
   *     responses:
   *       200:
   *         description: Image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     publicId:
   *                       type: string
   *                     name:
   *                       type: string
   *                     imageUrl:
   *                       type: string
   *                       nullable: true
   *                     price:
   *                       type: number
   *                     category:
   *                       type: string
   *                     isActive:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *                   example: "Image uploaded successfully"
   *       400:
   *         description: Invalid file
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.post(
    "/admin/products/:publicId/image",
    avatarUploadMiddleware,
    (req, res, next) => productCtrl.uploadImage(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}/activate:
   *   patch:
   *     summary: Activate a product (admin only)
   *     tags: [Admin - Products]
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
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.patch(
    "/admin/products/:publicId/activate",
    (req, res, next) => productCtrl.activate(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}/deactivate:
   *   patch:
   *     summary: Deactivate a product (admin only)
   *     tags: [Admin - Products]
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
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.patch(
    "/admin/products/:publicId/deactivate",
    (req, res, next) => productCtrl.deactivate(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}/stock:
   *   get:
   *     summary: Get product stock (admin only)
   *     tags: [Admin - Products]
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
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.get(
    "/admin/products/:publicId/stock",
    (req, res, next) => productCtrl.getStock(req, res, next),
  );

  /**
   * @swagger
   * /api/admin/products/{publicId}/stock:
   *   patch:
   *     summary: Update product stock (admin only)
   *     tags: [Admin - Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *         example: "abc123def"
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
   *                 example: 50
   *               minQuantity:
   *                 type: integer
   *                 example: 10
   *     responses:
   *       200:
   *         description: Stock updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     productId:
   *                       type: integer
   *                     quantity:
   *                       type: integer
   *                     minQuantity:
   *                       type: integer
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *                   example: "Stock updated"
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not admin)
   *       404:
   *         description: Product not found
   */
  router.patch(
    "/admin/products/:publicId/stock",
    validationMiddleware(stockUpdateRequestSchema),
    (req, res, next) => productCtrl.updateStock(req, res, next),
  );

  return router;
}
