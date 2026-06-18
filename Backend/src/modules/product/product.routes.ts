import { Router } from "express";
import ProductController from "./product.controller";
import ProductService from "./product.service";
import ProductRepository from "./product.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { AdminMiddleware } from "@/shared/middlewares/admin.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  stockUpdateRequestSchema,
} from "./product.schema";
import { db } from "@/config/database";

const productRoutes = Router();

const productRepo = new ProductRepository(db);
const productSvc = new ProductService(productRepo);
const productCtrl = new ProductController(productSvc);

// ============================================================
// Public / User Routes (any authenticated user)
// ============================================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products with pagination or filter
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       publicId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                       size:
 *                         type: string
 *                         nullable: true
 *                       price:
 *                         type: number
 *                       category:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
productRoutes.get(
  "/products",
  AuthMiddleware,
  (req, res, next) => productCtrl.getAll(req, res, next),
);

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
 *       401:
 *         description: Unauthorized
 */
productRoutes.get(
  "/products/categories",
  AuthMiddleware,
  (req, res, next) => productCtrl.getCategories(req, res, next),
);


// ============================================================
// Admin Product Routes (admin only)
// ============================================================

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
 *                 example: "COFFEE"
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
productRoutes.post(
  "/admin/products",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.put(
  "/admin/products/:publicId",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.delete(
  "/admin/products/:publicId",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.post(
  "/admin/products/:publicId/image",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.patch(
  "/admin/products/:publicId/activate",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.patch(
  "/admin/products/:publicId/deactivate",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.get(
  "/admin/products/:publicId/stock",
  AuthMiddleware,
  AdminMiddleware,
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
productRoutes.patch(
  "/admin/products/:publicId/stock",
  AuthMiddleware,
  AdminMiddleware,
  validationMiddleware(stockUpdateRequestSchema),
  (req, res, next) => productCtrl.updateStock(req, res, next),
);

export { productRoutes };
