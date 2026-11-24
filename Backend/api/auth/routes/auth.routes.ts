import { Router } from "express";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import {
  RegisterClientSchema,
  LoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
  SendPasswordResetSchema,
  CheckPasswordResetSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator.js";

export const authRoutes = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo cliente
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 */
authRoutes.post(
  "/register",
  validateSchemaMiddleware(RegisterClientSchema),
  (req, res, next) => void AuthController.register(req, res, next),
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login unificado (cliente ou funcionário)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Tokens e dados do usuário
 *       403:
 *         description: Conta desativada
 */
authRoutes.post(
  "/login",
  validateSchemaMiddleware(LoginSchema),
  (req, res, next) => void AuthController.login(req, res, next),
);

authRoutes.post(
  "/jwt/refresh-token",
  validateSchemaMiddleware(RefreshTokenSchema),
  (req, res, next) => void AuthController.refreshToken(req, res, next),
);

authRoutes.post(
  "/logout",
  validateSchemaMiddleware(LogoutSchema),
  (req, res, next) => void AuthController.logout(req, res, next),
);

authRoutes.post(
  "/forgotpassword/send",
  validateSchemaMiddleware(SendPasswordResetSchema),
  (req, res, next) => void AuthController.sendPasswordReset(req, res, next),
);

authRoutes.post(
  "/forgotpassword/check",
  validateSchemaMiddleware(CheckPasswordResetSchema),
  (req, res, next) => void AuthController.checkPasswordReset(req, res, next),
);

authRoutes.post(
  "/forgotpassword/reset",
  validateSchemaMiddleware(ResetPasswordSchema),
  (req, res, next) => void AuthController.resetPassword(req, res, next),
);
