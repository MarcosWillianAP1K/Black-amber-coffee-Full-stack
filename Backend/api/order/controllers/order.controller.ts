import type { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import type { CreateOrderInput, UpdateOrderStatusInput } from "../dtos/order.dto.js";

export class OrderController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");

      const isWorkerOrAdmin = req.user?.role !== undefined || req.user?.isAdmin === true;
      if (isWorkerOrAdmin) {
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const orders = await OrderService.listForWorker(publicId, status);
        res.status(200).json({ data: orders });
        return;
      }

      const orders = await OrderService.listForUser(publicId);
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");

      const isWorkerOrAdmin = req.user?.role !== undefined || req.user?.isAdmin === true;
      const body = req.body as CreateOrderInput;

      const order = isWorkerOrAdmin
        ? await OrderService.createForWorker(publicId, body)
        : await OrderService.createForUser(publicId, body);

      res.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getByPublicId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");

      const order = await OrderService.getForWorker(String(req.params.publicId), publicId);
      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerPublicId = req.user?.publicId;
      if (!workerPublicId) throw new Error("UNAUTHORIZED");

      const { status } = req.body as UpdateOrderStatusInput;
      const updated = await OrderService.updateStatusByWorker(
        String(req.params.publicId),
        workerPublicId,
        status,
      );
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) throw new Error("UNAUTHORIZED");

      const isWorkerOrAdmin = req.user?.role !== undefined || req.user?.isAdmin === true;
      const updated = await OrderService.cancel(String(req.params.publicId), {
        publicId,
        isWorkerOrAdmin,
      });
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await OrderService.deleteByPublicId(String(req.params.publicId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
