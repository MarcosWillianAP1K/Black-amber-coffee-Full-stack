import { NextFunction, Request, Response } from "express";
import InventoryService from "./inventory.service";

export default class InventoryController {
  private inventoryService: InventoryService;

  constructor(inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await this.inventoryService.getAll();
      res.status(200).json({ data: items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const item = await this.inventoryService.getByPublicId(publicId);
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.inventoryService.create(req.body);
      res.status(201).json({ data: result, message: "Inventory item created successfully" });
    } catch (error) {
      next(error);
    }
  }

  async addStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.inventoryService.addStock(req.body);
      res.status(200).json({ data: result, message: "Stock updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      const result = await this.inventoryService.update(publicId, req.body);
      res.status(200).json({ data: result, message: "Inventory item updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.params.publicId as string;
      await this.inventoryService.delete(publicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
