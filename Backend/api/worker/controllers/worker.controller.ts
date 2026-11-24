import type { NextFunction, Request, Response } from "express";
import { WorkerService } from "../services/worker.service.js";
import type {
  RegisterWorkerInput,
  ToggleWorkerStatusInput,
  UpdateWorkerAdminInput,
  UpdateWorkerSelfInput,
} from "../dtos/worker.dto.js";

export class WorkerController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const worker = await WorkerService.getByPublicId(publicId);
      res.status(200).json({ data: worker });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");
      const worker = await WorkerService.updateSelf(
        publicId,
        req.body as UpdateWorkerSelfInput,
        req.file?.buffer,
      );
      res.status(200).json({ data: worker, message: "Perfil atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workers = await WorkerService.listAll();
      res.status(200).json({ data: workers });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await WorkerService.create(req.body as RegisterWorkerInput);
      res.status(201).json({ data: worker, message: "Funcionário cadastrado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await WorkerService.getByPublicId(String(req.params.publicId));
      res.status(200).json({ data: worker });
    } catch (error) {
      next(error);
    }
  }

  static async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await WorkerService.updateAdmin(
        String(req.params.publicId),
        req.body as UpdateWorkerAdminInput,
      );
      res.status(200).json({ data: worker, message: "Funcionário atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req.body ?? {}) as ToggleWorkerStatusInput;
      const worker = await WorkerService.toggleStatus(
        String(req.params.publicId),
        body.isActive,
      );
      res.status(200).json({ data: worker, message: "Status do funcionário atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await WorkerService.deleteByPublicId(String(req.params.publicId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
