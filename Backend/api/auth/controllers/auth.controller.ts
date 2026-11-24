import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
  SendPasswordResetInput,
  CheckPasswordResetInput,
  ResetPasswordInput,
} from "../dtos/auth.dto.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.register(req.body as RegisterInput);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.login(req.body as LoginInput);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.refreshToken(req.body as RefreshTokenInput);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.logout(req.body as LogoutInput);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async sendPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.sendPasswordReset(req.body as SendPasswordResetInput);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async checkPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.checkPasswordReset(req.body as CheckPasswordResetInput);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await AuthService.resetPassword(req.body as ResetPasswordInput);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
