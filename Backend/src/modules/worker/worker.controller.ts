import WorkerService from "./worker.service";
import {
  GetWorkerResponseSchema,
  UpdateWorkerResponseSchema,
} from "./worker.schema";
import { NextFunction, Request, Response } from "express";

export default class WorkerController {
  private workerService: WorkerService;

  constructor(workerService: WorkerService) {
    this.workerService = workerService;
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const worker = await this.workerService.getByPublicId(publicId);

      const response = GetWorkerResponseSchema.parse({
        data: worker,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const data = {
        ...req.body,
        fullName: req.body.fullName ?? req.body.name,
      };

      const updatedWorker = await this.workerService.update(publicId, data);

      const response = UpdateWorkerResponseSchema.parse({
        data: updatedWorker,
        message: "Worker updated successfully",
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await this.workerService.delete(publicId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
