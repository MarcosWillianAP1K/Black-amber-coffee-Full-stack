import { Router } from "express";

import authController from "@/modules/auth/auth.controller";
import {
  RegisterClientSchema,
  LoginClientSchema,
  RefreshtokenSchema,
  LogoutSchema,
  SendPasswordResetSchema,
  CheckPasswordResetSchema,
  ResetPasswordSchema,
} from "@/modules/auth/auth.schema";
import authService from "@/modules/auth/auth.service";
import authRepository from "@/modules/auth/auth.repository";
import JWTservice from "@/core/jwt.service";
import { db } from "@/config/database";
import validationMiddleware from "@/shared/middlewares/validation.middleware";

const authRoutes = Router();

const clientRepository = new authRepository(db);
const jwtService = new JWTservice();
const clientService = new authService(clientRepository, jwtService);
const clientController = new authController(clientService);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo cliente
 *     description: Cria um novo cliente no banco de dados
 *     tags:
 *       - Auth
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
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Cliente registrado com sucesso
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
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 */
authRoutes.post(
  "/auth/register",
  validationMiddleware(RegisterClientSchema),
  clientController.createClient.bind(clientController),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do cliente
 *     description: Autentica cliente com email e senha e retorna tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Login realizado com sucesso
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
 *                         email:
 *                           type: string
 *                           format: email
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
 *                             createdAt:
 *                               type: string
 *       400:
 *         description: Dados inválidos ou credenciais incorretas
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno no servidor
 */

authRoutes.post(
  "/auth/login",
  validationMiddleware(LoginClientSchema),
  clientController.login.bind(clientController),
);

/**
 * @swagger
 * /api/auth/jwt/refresh-token:
 *   post:
 *     summary: Renovar tokens JWT
 *     description: Rotaciona o refresh token e retorna um novo par de access / refresh token. O refresh token antigo é revogado atomicamente dentro de uma transação no banco de dados.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "a1b2c3d4e5f6…"
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
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
 *       401:
 *         description: Refresh token inválido ou expirado
 */
authRoutes.post(
  "/auth/jwt/refresh-token",
  validationMiddleware(RefreshtokenSchema),
  clientController.refreshToken.bind(clientController),
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout / revogar refresh tokens
 *     description: Revoga o refresh token fornecido. Quando logoutAllDevices é true, todos os refresh tokens ativos do usuário são revogados em uma única transação.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "a1b2c3d4e5f6…"
 *               logoutAllDevices:
 *                 type: boolean
 *                 default: false
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     message:
 *                       type: string
 */
authRoutes.post(
  "/auth/logout",
  validationMiddleware(LogoutSchema),
  clientController.logout.bind(clientController),
);

/**
 * @swagger
 * /api/auth/forgotpassword/send:
 *   post:
 *     summary: Enviar código de reset de senha
 *     description: Envia um código para reset de senha para o email fornecido
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Código enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 userTokenId:
 *                   type: string
 *                   nullable: true
 *                 expiresAt:
 *                   type: string
 */
authRoutes.post(
  "/auth/forgotpassword/send",
  validationMiddleware(SendPasswordResetSchema),
  clientController.sendPasswordReset.bind(clientController),
);

/**
 * @swagger
 * /api/auth/forgotpassword/check:
 *   post:
 *     summary: Validar código de reset
 *     description: Valida se o código de reset é válido e não expirou
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTokenId:
 *                 type: string
 *               code:
 *                 type: string
 *             required:
 *               - userTokenId
 *               - code
 *     responses:
 *       200:
 *         description: Validação realizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resetToken:
 *                   type: string
 */
authRoutes.post(
  "/auth/forgotpassword/check",
  validationMiddleware(CheckPasswordResetSchema),
  clientController.checkPasswordReset.bind(clientController),
);

/**
 * @swagger
 * /api/auth/forgotpassword/reset:
 *   post:
 *     summary: Resetar senha
 *     description: Reseta a senha do usuário com um token de reset válido
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmNewPassword
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 */
authRoutes.post(
  "/auth/forgotpassword/reset",
  validationMiddleware(ResetPasswordSchema),
  clientController.resetPassword.bind(clientController),
);

export { authRoutes };
