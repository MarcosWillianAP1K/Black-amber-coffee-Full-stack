import { Router } from "express";
import ProductController from "../product.controller";
import { AuthMiddleware } from "../../auth/auth.middleware";

/**
 * Creates public/authenticated product routes.
 * All routes require authentication (AuthMiddleware applied at router level).
 *
 * Endpoints:
 *   GET /products            → List all products with pagination/filter
 *   GET /products/categories → List all product categories
 */
export function createPublicProductRoutes(productCtrl: ProductController): Router {
  const router = Router();

  // All public product routes require authentication
  router.use(AuthMiddleware);

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
  router.get(
    "/products",
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
  router.get(
    "/products/categories",
    (req, res, next) => productCtrl.getCategories(req, res, next),
  );

  return router;
}
