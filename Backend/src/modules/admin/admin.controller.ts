import AdminService from "./admin.service";
import { NextFunction, Request, Response } from "express";

export default class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  // ============================================================
  // Worker Management
  // ============================================================

  /**
   * POST /admin/workers
   * Register a new worker
   */
  async registerWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.adminService.registerWorker(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/workers
   * List all workers
   */
  async getAllWorkers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workers = await this.adminService.getAllWorkers();
      res.status(200).json({ data: workers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/workers/:publicId
   * Get a worker by public ID
   */
  async getWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const result = await this.adminService.getWorker(publicId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/workers/:publicId
   * Update a worker
   */
  async updateWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const result = await this.adminService.updateWorker(publicId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/workers/:publicId
   * Delete a worker
   */
  async deleteWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      await this.adminService.deleteWorker(publicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // Order Management
  // ============================================================

  /**
   * GET /admin/orders
   * List all orders
   */
  async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orders = await this.adminService.getAllOrders();
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/orders/:publicId
   * Get an order by public ID
   */
  async getOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const order = await this.adminService.getOrderByPublicId(publicId);
      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/orders/:publicId/cancel
   * Cancel an order
   */
  async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const canceled = await this.adminService.cancelOrder(publicId);
      res.status(200).json({ data: canceled, message: "Order cancelled" });
    } catch (error) {
      next(error);
    }
  }
}
