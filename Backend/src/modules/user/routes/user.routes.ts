import { Router } from "express";
import UserController from "../user.controller";
import UserService from "../user.service";
import UserRepository from "../user.repository";
import authRepository from "@/modules/auth/auth.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { requireAdmin } from "@/shared/middlewares/permission.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import { UserUpdateRequestSchema } from "../user.schema";
import { db } from "@/config/database";
import AdminController from "@/modules/admin/admin.controller";
import AdminService from "@/modules/admin/admin.service";
import WorkerRepository from "@/modules/worker/worker.repository";
import OrderRepository from "@/modules/order/order.repository";
import OrderHistoryRepository from "@/modules/order/history/orderHistory.repository";
import ProductRepository from "@/modules/product/product.repository";

// ============================================================
// Initialize dependencies
// ============================================================
const authRepo = new authRepository(db);
const userRepo = new UserRepository(db);
const userSvc = new UserService(authRepo, userRepo);
const userCtrl = new UserController(userSvc);

// Admin service for client management
const workerRepo = new WorkerRepository(db);
const orderRepo = new OrderRepository(db);
const orderHistoryRepo = new OrderHistoryRepository(db);
const productRepo = new ProductRepository(db);
const adminSvc = new AdminService(workerRepo, orderRepo, orderHistoryRepo, productRepo, authRepo, userRepo);
const adminCtrl = new AdminController(adminSvc);

/**
 * Creates unified user (client) routes.
 * - Own profile (me): authenticated client only
 * - Management: admin only
 *
 * Endpoints:
 *   GET    /users/me          → Get own profile (authenticated)
 *   PUT    /users/me          → Update own profile (authenticated)
 *   DELETE /users/me          → Delete own account (authenticated)
 *   GET    /users             → List all clients (admin only)
 *   GET    /users/:publicId   → Get client by ID (admin only)
 *   PUT    /users/:publicId   → Update client (admin only)
 *   DELETE /users/:publicId   → Delete client (admin only)
 */
export function createUserRoutes(): Router {
  const router = Router();

  // ============================================================
  // Own profile routes
  // ============================================================

  /**
   * @swagger
   * /api/users/me:
   *   get:
   *     summary: Get authenticated user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile
   */
  router.get("/me", AuthMiddleware, (req, res, next) =>
    userCtrl.getById(req, res, next),
  );

  /**
   * @swagger
   * /api/users/me:
   *   put:
   *     summary: Update authenticated user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
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
   *               avatar:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Profile updated
   */
  router.put(
    "/me",
    AuthMiddleware,
    avatarUploadMiddleware,
    validationMiddleware(UserUpdateRequestSchema),
    (req, res, next) => userCtrl.update(req, res, next),
  );

  /**
   * @swagger
   * /api/users/me:
   *   delete:
   *     summary: Delete authenticated user account
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       204:
   *         description: User deleted
   */
  router.delete("/me", AuthMiddleware, (req, res, next) =>
    userCtrl.delete(req, res, next),
  );

  // ============================================================
  // Admin-only client management
  // ============================================================

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: List all clients (admin only)
   *     tags: [Users - Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of clients
   */
  router.get(
    "/",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.getAllClients(req, res, next),
  );

  /**
   * @swagger
   * /api/users/{publicId}:
   *   get:
   *     summary: Get client by ID (admin only)
   *     tags: [Users - Admin]
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
   *         description: Client found
   */
  router.get(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.getClient(req, res, next),
  );

  /**
   * @swagger
   * /api/users/{publicId}:
   *   put:
   *     summary: Update a client (admin only)
   *     tags: [Users - Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: publicId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fullName:
   *                 type: string
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: Client updated
   */
  router.put(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.updateClient(req, res, next),
  );

  /**
   * @swagger
   * /api/users/{publicId}:
   *   delete:
   *     summary: Delete a client (admin only)
   *     tags: [Users - Admin]
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
   *         description: Client deleted
   */
  router.delete(
    "/:publicId",
    AuthMiddleware,
    requireAdmin(),
    (req, res, next) => adminCtrl.deleteClient(req, res, next),
  );

  return router;
}
