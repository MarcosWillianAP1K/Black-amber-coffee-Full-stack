import { Router } from "express";
import userController from "@/modules/user/user.controller";
import userService from "@/modules/user/user.service";
import userRepository from "@/modules/user/user.repository";
import authRepository from "@/modules/auth/auth.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { UserUpdateRequestSchema } from "@/modules/user/user.schema";
import { db } from "@/config/database";

const userRoutes = Router();

// Initialize dependencies
const authRepo = new authRepository(db);
const userRepo = new userRepository(db);
const userSvc = new userService(authRepo, userRepo);
const userCtrl = new userController(userSvc);

/**
 * @swagger
 * /api/user/get/me:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
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
 *         description: Token ausente, inválido ou expirado.
 
 *       404:
 *         description: Usuário não encontrado.
 */
userRoutes.get("/user/me", AuthMiddleware, (req, res, next) =>
  userCtrl.getById(req, res, next),
);

/**
 * @swagger
 * /api/users/update/me:
 *   put:
 *     summary: Atualizar perfil do usuário autenticado
 *     description: Atualiza o nome completo, email, telefone, senha e/ou foto de perfil do usuário autenticado.
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
 *                 description: Nome completo do usuário.
 *                 example: Hermeson Alves de Oliveira
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário.
 *                 example: hermesonalves256@gmail.com
 *               phone:
 *                 type: string
 *                 description: Telefone do usuário.
 *                 example: 11999999999
 *               password:
 *                 type: string
 *                 description: Nova senha do usuário.
 *                 example: Senha@123
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de avatar em jpg, png ou webp.
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso.
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
 *                     email:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Token de autenticação ausente, inválido ou expirado.
 *       404:
 *         description: Usuário não encontrado.
 */
userRoutes.put(
  "/user/me",
  AuthMiddleware,
  avatarUploadMiddleware,
  validationMiddleware(UserUpdateRequestSchema),
  (req, res, next) => userCtrl.update(req, res, next),
);

/**
 * @swagger
 * /api/user/delete/me:
 *   delete:
 *     summary: Delete authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
userRoutes.delete("/user/me", AuthMiddleware, (req, res, next) =>
  userCtrl.delete(req, res, next),
);

export { userRoutes };
