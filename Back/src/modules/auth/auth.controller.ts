import authService from "@/modules/auth/auth.service";

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
} from "@/modules/auth/auth.schema";
import { Request, Response } from "express";
import helpers from "@/shared/helpers";

function handleError(res: Response, err: unknown) {
  const code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  const mapped = helpers[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  return res.status(mapped.status).json({
    error: {
      code: mapped.status === 500 ? "INTERNAL_ERROR" : code,
      message: mapped.message,
    },
  });
}

export default class authController {
  private authService: authService;

  constructor(authService: authService) {
    this.authService = authService;
  }

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const clientResponse: RegisterResponse =
        await this.authService.create(data);
      res.status(201).json(clientResponse);
    } catch (error) {
      handleError(res, error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const loginResponse: LoginResponse = await this.authService.login(data);
      res.status(201).json(loginResponse);
    } catch (error) {
      handleError(res, error);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const data: RefreshTokenInput = req.body;
      const refreshResponse: RefreshTokenResponse =
        await this.authService.refreshToken(data);
      res.status(200).json(refreshResponse);
    } catch (error) {
      handleError(res, error);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const data: LogoutInput = req.body;
      const logoutResponse: LogoutResponse =
        await this.authService.logout(data);
      res.status(200).json(logoutResponse);
    } catch (error) {
      handleError(res, error);
    }
  }

  async sendPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const data: SendPasswordResetInput = req.body;
      const response: SendPasswordResetResponse =
        await this.authService.sendPasswordReset(data);
      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  async checkPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const data: CheckPasswordResetInput = req.body;
      const response: CheckPasswordResetResponse =
        await this.authService.checkPasswordReset(data.userTokenId, data);
      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const data: ResetPasswordInput = req.body;
      const response: ResetPasswordResponse =
        await this.authService.resetPassword(data.resetToken, data);
      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }
}
