import { InventoryModel } from "../models/inventory.model.js";
import type {
  CreateInventoryInput,
  InventoryItemDTO,
  UpdateInventoryInput,
} from "../dtos/inventory.dto.js";

function normalizeCode(code?: string): string | null {
  if (!code) return null;
  const trimmed = code.trim();
  return trimmed === "" ? null : trimmed;
}

export class InventoryService {
  static async listAll(): Promise<InventoryItemDTO[]> {
    return InventoryModel.findAll();
  }

  static async getByPublicId(publicId: string): Promise<InventoryItemDTO> {
    const item = await InventoryModel.findByPublicId(publicId);
    if (!item) throw new Error("INVENTORY_NOT_FOUND");
    return item;
  }

  static async create(data: CreateInventoryInput): Promise<InventoryItemDTO> {
    return InventoryModel.create({
      code: normalizeCode(data.code),
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      category: data.category?.trim() ?? null,
      quantity: data.quantity ?? 0,
      unit: data.unit,
      minQuantity: data.minQuantity ?? 10,
      imgUrl: data.imgUrl ?? null,
    });
  }

  static async addStock(data: CreateInventoryInput): Promise<InventoryItemDTO> {
    const cleanCode = normalizeCode(data.code);
    if (cleanCode) {
      const existing = await InventoryModel.findByCode(cleanCode);
      if (existing) {
        const updated = await InventoryModel.updateByPublicId(existing.publicId, {
          name: data.name.trim(),
          quantity: existing.quantity + (data.quantity ?? 0),
          unit: data.unit,
        });
        if (!updated) throw new Error("INVENTORY_NOT_FOUND");
        return updated;
      }
    }
    return this.create(data);
  }

  static async update(publicId: string, data: UpdateInventoryInput): Promise<InventoryItemDTO> {
    const current = await InventoryModel.findByPublicId(publicId);
    if (!current) throw new Error("INVENTORY_NOT_FOUND");

    const updated = await InventoryModel.updateByPublicId(publicId, {
      name: data.name?.trim(),
      code: data.code !== undefined ? normalizeCode(data.code) : undefined,
      description: data.description,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      minQuantity: data.minQuantity,
      imgUrl: data.imgUrl,
    });

    if (!updated) throw new Error("INVENTORY_NOT_FOUND");
    return updated;
  }

  static async deleteByPublicId(publicId: string): Promise<void> {
    const deleted = await InventoryModel.deleteByPublicId(publicId);
    if (!deleted) throw new Error("INVENTORY_NOT_FOUND");
  }
}
