import authService from "./auth.service";

import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  RefreshTokenInput,
  RefreshTokenResponse,
  LogoutInput,
  LogoutResponse,
  SendPasswordResetInput,
  SendPasswordResetResponse,
  CheckPasswordResetInput,
  CheckPasswordResetResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from "./auth.schema";
import { NextFunction, Request, Response } from "express";

export default class authController {
  private authService: authService;

  constructor(authService: authService) {
    this.authService = authService;
  }

  async createClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const clientResponse: RegisterResponse =
        await this.authService.create(data);
      res.status(201).json(clientResponse);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const loginResponse: LoginResponse = await this.authService.login(data);
      res.status(201).json(loginResponse);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data: RefreshTokenInput = req.body;
      const refreshResponse: RefreshTokenResponse =
        await this.authService.refreshToken(data);
      res.status(200).json(refreshResponse);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LogoutInput = req.body;
      const logoutResponse: LogoutResponse =
        await this.authService.logout(data);
      res.status(200).json(logoutResponse);
    } catch (error) {
      next(error);
    }
  }

  async sendPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data: SendPasswordResetInput = req.body;
      const response: SendPasswordResetResponse =
        await this.authService.sendPasswordReset(data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data: CheckPasswordResetInput = req.body;
      const response: CheckPasswordResetResponse =
        await this.authService.checkPasswordReset(data.userTokenId, data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data: ResetPasswordInput = req.body;
      const response: ResetPasswordResponse =
        await this.authService.resetPassword(data.resetToken, data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
