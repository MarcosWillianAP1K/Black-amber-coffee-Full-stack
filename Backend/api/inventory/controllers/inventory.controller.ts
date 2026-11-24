import type { NextFunction, Request, Response } from "express";
import { InventoryService } from "../services/inventory.service.js";
import type { CreateInventoryInput, UpdateInventoryInput } from "../dtos/inventory.dto.js";

export class InventoryController {
  static async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await InventoryService.listAll();
      res.status(200).json({ data: items });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.getByPublicId(String(req.params.publicId));
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.create(req.body as CreateInventoryInput);
      res.status(201).json({ data: item, message: "Item de inventário criado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async addStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.addStock(req.body as CreateInventoryInput);
      res.status(200).json({ data: item, message: "Estoque atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.update(
        String(req.params.publicId),
        req.body as UpdateInventoryInput,
      );
      res.status(200).json({ data: item, message: "Item de inventário atualizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await InventoryService.deleteByPublicId(String(req.params.publicId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
