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
  // Client Management (Admin)
  // ============================================================

  /**
   * GET /api/users
   * List all clients
   */
  async getAllClients(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clients = await this.adminService.getAllClients();
      res.status(200).json({ data: clients });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:publicId
   * Get a client by public ID
   */
  async getClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const client = await this.adminService.getClient(publicId);
      res.status(200).json({ data: client });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:publicId
   * Update a client
   */
  async updateClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const result = await this.adminService.updateClient(publicId, req.body);
      res.status(200).json({ data: result, message: "Client updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:publicId
   * Delete a client
   */
  async deleteClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      await this.adminService.deleteClient(publicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
