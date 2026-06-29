import { Router } from "express";
import InventoryController from "./inventory.controller";
import InventoryService from "./inventory.service";
import InventoryRepository from "./inventory.repository";
import { db } from "../../config/database";
import { AuthMiddleware } from "../auth/auth.middleware";
import { requireAdmin } from "../../shared/middlewares/permission.middleware";
import validationMiddleware from "../../shared/middlewares/validation.middleware";
import { CreateInventoryRequestSchema, UpdateInventoryRequestSchema } from "./inventory.schema";

export function createInventoryRoutes(): Router {
  const router = Router();
  const repository = new InventoryRepository(db);
  const service = new InventoryService(repository);
  const controller = new InventoryController(service);

  // Require Auth + Admin/Worker? The frontend has it in admin UI, so we'll use requireAdmin for writes, or perhaps AuthMiddleware only. Let's use AuthMiddleware for all, and requireAdmin for writes, or just AuthMiddleware. Based on similar routes, we'll apply AuthMiddleware to all.
  router.use(AuthMiddleware);

  /**
   * @swagger
   * /api/inventory:
   *   get:
   *     summary: List all inventory items
   *     tags: [Inventory]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of inventory items
   */
  router.get("/", (req, res, next) => controller.getAll(req, res, next));

  /**
   * @swagger
   * /api/inventory/{publicId}:
   *   get:
   *     summary: Get an inventory item by ID
   *     tags: [Inventory]
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
   *         description: Inventory item
   */
  router.get("/:publicId", (req, res, next) => controller.getById(req, res, next));

  /**
   * @swagger
   * /api/inventory/create:
   *   post:
   *     summary: Create an inventory item
   *     tags: [Inventory]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *               code:
   *                 type: string
   *               description:
   *                 type: string
   *               quantity:
   *                 type: number
   *               quantityType:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created inventory item
   */
  router.post(
    "/create",
    requireAdmin(),
    validationMiddleware(CreateInventoryRequestSchema),
    (req, res, next) => controller.create(req, res, next)
  );

  /**
   * @swagger
   * /api/inventory/add-stock:
   *   post:
   *     summary: Add stock to an inventory item
   *     tags: [Inventory]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Updated or created inventory item
   */
  router.post(
    "/add-stock",
    requireAdmin(),
    validationMiddleware(CreateInventoryRequestSchema),
    (req, res, next) => controller.addStock(req, res, next)
  );

  /**
   * @swagger
   * /api/inventory/{publicId}:
   *   put:
   *     summary: Update an inventory item
   *     tags: [Inventory]
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
   *         description: Updated inventory item
   */
  router.put(
    "/:publicId",
    requireAdmin(),
    validationMiddleware(UpdateInventoryRequestSchema),
    (req, res, next) => controller.update(req, res, next)
  );

  /**
   * @swagger
   * /api/inventory/{publicId}:
   *   delete:
   *     summary: Delete an inventory item
   *     tags: [Inventory]
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
   *         description: Deleted inventory item
   */
  router.delete("/:publicId", requireAdmin(), (req, res, next) => controller.delete(req, res, next));

  return router;
}
