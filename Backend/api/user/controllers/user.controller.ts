import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type {
  ToggleUserStatusInput,
  UpdateUserAdminInput,
  UpdateUserSelfInput,
} from "../dtos/user.dto.js";

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const user = await UserService.getByPublicId(publicId);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const updated = await UserService.updateSelf(
        publicId,
        req.body as UpdateUserSelfInput,
        req.file?.buffer,
      );
      res.status(200).json({ data: updated, message: "Usuário atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      await UserService.deleteByPublicId(publicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await UserService.listAll();
      res.status(200).json({ data: clients });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await UserService.getByPublicId(String(req.params.publicId));
      res.status(200).json({ data: client });
    } catch (error) {
      next(error);
    }
  }

  static async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await UserService.updateAdmin(
        String(req.params.publicId),
        req.body as UpdateUserAdminInput,
      );
      res.status(200).json({ data: updated, message: "Cliente atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req.body ?? {}) as ToggleUserStatusInput;
      const updated = await UserService.toggleStatus(
        String(req.params.publicId),
        body.isActive,
      );
      res.status(200).json({ data: updated, message: "Status do cliente atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await UserService.deleteByPublicId(String(req.params.publicId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
