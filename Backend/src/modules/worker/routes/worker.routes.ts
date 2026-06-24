import { Router } from "express";
import WorkerController from "../worker.controller";
import WorkerService from "../worker.service";
import WorkerRepository from "../worker.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireAdmin, requireWorker } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { WorkerUpdateRequestSchema } from "../worker.schema";
import { registerWorkerSchema, updateWorkerSchema } from "@/modules/admin/admin.shemas";
import { db } from "@/config/database";
import authRepository from "@/modules/auth/auth.repository";
import AdminController from "@/modules/admin/admin.controller";
import AdminService from "@/modules/admin/admin.service";
import OrderRepository from "@/modules/order/order.repository";
import OrderHistoryRepository from "@/modules/order/history/orderHistory.repository";
import ProductRepository from "@/modules/product/product.repository";

// ============================================================
// Initialize shared dependencies
// ============================================================
const authRepo = new authRepository(db);
const workerRepo = new WorkerRepository(db);

// Worker self-service
const workerSvc = new WorkerService(workerRepo);
const workerCtrl = new WorkerController(workerSvc);

// Admin worker management
const orderRepo = new OrderRepository(db);
const orderHistoryRepo = new OrderHistoryRepository(db);
const productRepo = new ProductRepository(db);
const adminSvc = new AdminService(workerRepo, orderRepo, orderHistoryRepo, productRepo, authRepo);
const adminCtrl = new AdminController(adminSvc);

/**
 * Creates unified worker routes.
 * - Own profile (me): authenticated worker
 * - Management (CRUD): admin only
 */
export function createWorkerRoutes(): Router {
  const router = Router();

  // ============================================================
  // Own profile routes - Requires authentication (worker/admin)
  // ============================================================

  /**
   * @swagger
   * /api/workers/me:
   *   get:
   *     summary: Get own worker profile
   *     tags: [Workers]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Worker profile
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get(
    "/me",
    AuthMiddleware,
    requireWorker(),
    (req, res, next) => workerCtrl.getById(req, res, next),
  );

  /**
   * @swagger
   * /api/workers/me:
   *   patch:
   *     summary: Update own worker profile
   *     tags: [Workers]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Profile updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.patch(
    "/me",
    AuthMiddleware,
    requireWorker(),
    validationMiddleware(WorkerUpdateRequestSchema),
    (req, res, next) => workerCtrl.update(req, res, next),
  );

  // ============================================================
  // Admin-only worker management
  // ============================================================

  /**
   * @swagger
   * /api/workers:
   *   get:
   *     summary: List all workers (admin only)
   *     tags: [Workers - Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of workers
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get(
    "/",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.getAllWorkers(req, res, next),
  );

  /**
   * @swagger
   * /api/workers:
   *   post:
   *     summary: Register a new worker (admin only)
   *     tags: [Workers - Admin]
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
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               phone:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [gerente, barista, caixa, atendente]
   *               salary:
   *                 type: number
   *     responses:
   *       201:
   *         description: Worker registered
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.post(
    "/",
    AuthMiddleware,
    requireAdmin(),
    validationMiddleware(registerWorkerSchema),
    (req, res, next) => adminCtrl.registerWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/workers/{publicId}:
   *   get:
   *     summary: Get worker by ID (admin only)
   *     tags: [Workers - Admin]
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
   *         description: Worker found
   *       404:
   *         description: Worker not found
   */
  router.get(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.getWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/workers/{publicId}:
   *   put:
   *     summary: Update a worker (admin only)
   *     tags: [Workers - Admin]
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
   *               fullName:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               salary:
   *                 type: number
   *               role:
   *                 type: string
   *                 enum: [gerente, barista, caixa, atendente]
   *     responses:
   *       200:
   *         description: Worker updated
   *       404:
   *         description: Worker not found
   */
  router.put(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    validationMiddleware(updateWorkerSchema),
    (req, res, next) => adminCtrl.updateWorker(req, res, next),
  );

  /**
   * @swagger
   * /api/workers/{publicId}:
   *   delete:
   *     summary: Delete a worker (admin only)
   *     tags: [Workers - Admin]
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
   *         description: Worker deleted
   *       404:
   *         description: Worker not found
   */
  router.delete(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.deleteWorker(req, res, next),
  );

  return router;
}
