import { Router } from "express";
import WorkerController from "@/modules/worker/worker.controller";
import WorkerService from "@/modules/worker/worker.service";
import WorkerRepository from "@/modules/worker/worker.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  WorkerLoginSchema,
  WorkerUpdateRequestSchema,
} from "@/modules/worker/worker.schema";
import { db } from "@/config/database";
import authRepository from "@/modules/auth/auth.repository";
import JWTservice from "@/core/jwt.service";
import WorkerAuthService from "@/modules/worker/auth/worker.auth.service";
import WorkerAuthController from "@/modules/worker/auth/worker.auth.controller";

const workerRoutes = Router();

// Initialize dependencies
const authRepo = new authRepository(db);
const jwtService = new JWTservice();
const workerRepo = new WorkerRepository(db);
const workerSvc = new WorkerService(workerRepo);
const workerCtrl = new WorkerController(workerSvc);
const workerAuthSvc = new WorkerAuthService(authRepo, jwtService);
const workerAuthCtrl = new WorkerAuthController(workerAuthSvc);

/**
 * @swagger
 * /api/worker/login:
 *   post:
 *     summary: Worker login
 *     tags: [Workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Login successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         publicId:
 *                           type: string
 *                         role:
 *                           type: string
 *                         profile:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                             phone:
 *                               type: string
 *                               nullable: true
 *                             avatarImage:
 *                               type: string
 *                               nullable: true
 *                             email:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                             updatedAt:
 *                               type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */

workerRoutes.post(
  "/worker/login",
  validationMiddleware(WorkerLoginSchema),
  workerAuthCtrl.login.bind(workerAuthCtrl),
);

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
workerRoutes.get("/worker/get/me", AuthMiddleware, (req, res, next) =>
  workerCtrl.getById(req, res, next),
);

/**
 * @swagger
 * /api/worker/update/me:
 *   patch:
 *     summary: Atualizar perfil do worker autenticado
 *     description: Atualiza o nome completo, email, telefone, senha e/ou foto de perfil do worker autenticado.
 *     tags: [Workers]
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
 *                 description: Nome completo do worker.
 *                 example: Hermeson Alves de Oliveira
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do worker.
 *                 example: hermesonalves256@gmail.com
 *               phone:
 *                 type: string
 *                 description: Telefone do worker.
 *                 example: 11999999999
 *               password:
 *                 type: string
 *                 description: Nova senha do worker.
 *                 example: Senha@123
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de avatar em jpg, png ou webp.
 *     responses:
 *       200:
 *         description: Perfil do worker atualizado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Token de autenticação ausente, inválido ou expirado.
 *       404:
 *         description: Worker não encontrado.
 */
workerRoutes.patch(
  "/worker/update/me",
  AuthMiddleware,
  validationMiddleware(WorkerUpdateRequestSchema),
  (req, res, next) => workerCtrl.update(req, res, next),
);

export { workerRoutes };
