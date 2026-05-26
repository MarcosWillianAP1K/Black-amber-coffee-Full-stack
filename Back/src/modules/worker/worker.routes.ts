import { Router } from "express";
import WorkerController from "@/modules/worker/worker.controller";
import WorkerService from "@/modules/worker/worker.service";
import WorkerRepository from "@/modules/worker/worker.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { db } from "@/config/database";

const workerRoutes = Router();

// Initialize dependencies
const workerRepo = new WorkerRepository(db);
const workerSvc = new WorkerService(workerRepo);
const workerCtrl = new WorkerController(workerSvc);

/**
 * @swagger
 * /api/worker/get/me:
 *   get:
 *     summary: Get authenticated worker details
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
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
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
workerRoutes.get("/worker/get/me", AuthMiddleware, (req, res) =>
  workerCtrl.getById(req, res),
);

/**
 * @swagger
 * /api/worker/update/me:
 *   patch:
 *     summary: Update authenticated worker information
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
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
 *         description: Worker updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
workerRoutes.patch("/worker/update/me", AuthMiddleware, (req, res) =>
  workerCtrl.update(req, res),
);

/**
 * @swagger
 * /api/worker/delete/me:
 *   delete:
 *     summary: Delete authenticated worker
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
workerRoutes.delete("/worker/delete/me", AuthMiddleware, (req, res) =>
  workerCtrl.delete(req, res),
);

export { workerRoutes };
