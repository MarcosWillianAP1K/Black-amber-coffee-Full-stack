import { Router } from "express";
import AdminController from "./admin.controller";
import AdminService from "./admin.service";
import WorkerRepository from "../worker/worker.repository";
import OrderRepository from "../order/order.repository";
import OrderHistoryRepository from "../order/history/orderHistory.repository";
import ProductRepository from "../product/product.repository";
import authRepository from "../auth/auth.repository";
import { AuthMiddleware } from "../auth/auth.middleware";
import { AdminMiddleware } from "../../shared/middlewares/admin.middleware";
import validationMiddleware from "../../shared/middlewares/validation.middleware";
import { registerWorkerSchema, updateWorkerSchema } from "./admin.shemas";
import { db } from "../../config/database";

const adminRoutes = Router();

// Initialize dependencies
const workerRepo = new WorkerRepository(db);
const orderRepo = new OrderRepository(db);
const orderHistoryRepo = new OrderHistoryRepository(db);
const productRepo = new ProductRepository(db);
const authRepo = new authRepository(db);

const adminSvc = new AdminService(
  workerRepo,
  orderRepo,
  orderHistoryRepo,
  productRepo,
  authRepo,
);
const adminCtrl = new AdminController(adminSvc);

// ============================================================
// All admin routes require Auth + Admin middleware
// ============================================================

// Apply auth + admin middleware to all routes in this router
adminRoutes.use(AuthMiddleware, AdminMiddleware);

// ============================================================
// Worker Management
// ============================================================

/**
 * @swagger
 * /api/admin/workers:
 *   post:
 *     summary: Register a new worker (admin only)
 *     tags: [Admin - Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *               - salary
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@blackamber.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "11988888888"
 *               role:
 *                 type: string
 *                 enum: [gerente, barista, caixa, atendente]
 *                 example: "BARISTA"
 *               salary:
 *                 type: number
 *                 example: 2500.00
 *     responses:
 *       201:
 *         description: Worker registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                       example: "abc123def"
 *                     email:
 *                       type: string
 *                       example: "joao@blackamber.com"
 *                     role:
 *                       type: string
 *                       example: "BARISTA"
 *                     salary:
 *                       type: number
 *                       example: 2500.00
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: "João Silva"
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                           example: "11988888888"
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           example: "joao@blackamber.com"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
adminRoutes.post(
  "/admin/workers",
  validationMiddleware(registerWorkerSchema),
  (req, res, next) => adminCtrl.registerWorker(req, res, next),
);

/**
 * @swagger
 * /api/admin/workers:
 *   get:
 *     summary: List all workers (admin only)
 *     tags: [Admin - Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                       role:
 *                         type: string
 *                         example: "BARISTA"
 *                       salary:
 *                         type: number
 *                       isActive:
 *                         type: boolean
 *                       profile:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           avatarImage:
 *                             type: string
 *                             nullable: true
 *                           email:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
adminRoutes.get("/admin/workers", (req, res, next) =>
  adminCtrl.getAllWorkers(req, res, next),
);

/**
 * @swagger
 * /api/admin/workers/{publicId}:
 *   get:
 *     summary: Get a worker by public ID (admin only)
 *     tags: [Admin - Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         example: "abc123def"
 *     responses:
 *       200:
 *         description: Worker found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     role:
 *                       type: string
 *                     salary:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Worker not found
 */
adminRoutes.get("/admin/workers/:publicId", (req, res, next) =>
  adminCtrl.getWorker(req, res, next),
);

/**
 * @swagger
 * /api/admin/workers/{publicId}:
 *   put:
 *     summary: Update a worker (admin only)
 *     tags: [Admin - Workers]
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
 *               fullName:
 *                 type: string
 *                 example: "João Silva Atualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.novo@blackamber.com"
 *               phone:
 *                 type: string
 *                 example: "11977777777"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "novaSenha123"
 *               salary:
 *                 type: number
 *                 example: 3000.00
 *               role:
 *                 type: string
 *                 enum: [gerente, barista, caixa, atendente]
 *                 example: "caixa"
 *     responses:
 *       200:
 *         description: Worker updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     role:
 *                       type: string
 *                     salary:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Worker updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Worker not found
 */
adminRoutes.put(
  "/admin/workers/:publicId",
  validationMiddleware(updateWorkerSchema),
  (req, res, next) => adminCtrl.updateWorker(req, res, next),
);

/**
 * @swagger
 * /api/admin/workers/{publicId}:
 *   delete:
 *     summary: Delete a worker (admin only)
 *     tags: [Admin - Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         example: "abc123def"
 *     responses:
 *       204:
 *         description: Worker deleted (no content)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Worker not found
 */
adminRoutes.delete("/admin/workers/:publicId", (req, res, next) =>
  adminCtrl.deleteWorker(req, res, next),
);

export { adminRoutes };
