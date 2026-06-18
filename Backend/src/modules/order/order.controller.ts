import { Request, Response, NextFunction } from "express";
import OrderService from "./order.service";

import {
  CreateOrderResponse,
  UpdateOrderStatusRequestSchema,
} from "./order.schema";

export default class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  async createForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userPublicId = req.user?.publicId;

      if (!userPublicId) {
        throw new Error("UNAUTHORIZED");
      }

      const response: CreateOrderResponse =
        await this.orderService.createForUser(
          userPublicId,
          req.body,
        );

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createForWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerPublicId = req.user?.publicId;

      if (!workerPublicId) {
        throw new Error("UNAUTHORIZED");
      }

      const response = await this.orderService.createForWorker(
        workerPublicId,
        req.body,
      );

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const canceled = await this.orderService.cancelOrder(publicId);

      if (!canceled) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      res.status(200).json({ data: canceled });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await this.orderService.getByStatus(
        req.query as any,
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByPublicId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const order = await this.orderService.getForWorker(
        publicId,
        req.user?.publicId ?? "",
      );

      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  async getallByWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerPublicId = req.user?.publicId;
      if (!workerPublicId) {
        throw new Error("UNAUTHORIZED");
      }

      const orders = await this.orderService.getAll(workerPublicId);

      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerPublicId = req.user?.publicId;
      if (!workerPublicId) {
        throw new Error("UNAUTHORIZED");
      }

      const publicId = req.params.publicId as string;
      const data = UpdateOrderStatusRequestSchema.parse(req.body);

      const updated = await this.orderService.updateStatusByWorker(
        publicId,
        workerPublicId,
        data,
      );

      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  }
}