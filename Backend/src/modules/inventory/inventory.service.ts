import InventoryRepository from "./inventory.repository";
import { generateId } from "@/core/gereteId";
import {
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryResponse,
  InventoryResponseSchema,
} from "./inventory.schema";

export default class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor(inventoryRepository: InventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async getAll(): Promise<InventoryResponse[]> {
    const items = await this.inventoryRepository.getAll();
    return items.map((item) => InventoryResponseSchema.parse(item));
  }

  async getByPublicId(publicId: string): Promise<InventoryResponse> {
    const item = await this.inventoryRepository.getByPublicId(publicId);
    if (!item) throw new Error("INVENTORY_NOT_FOUND");
    return InventoryResponseSchema.parse(item);
  }

  async create(data: CreateInventoryInput): Promise<InventoryResponse> {
    const dbData = {
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      quantity: data.quantity != null ? String(data.quantity) : "0",
      unit: data.unit,
      minQuantity: data.minQuantity != null ? String(data.minQuantity) : "0",
      imgUrl: data.imgUrl,
    };

    const newItem = await this.inventoryRepository.create(dbData);
    return InventoryResponseSchema.parse(newItem);
  }

  async addStock(data: CreateInventoryInput): Promise<InventoryResponse> {
    if (data.code) {
      const existing = await this.inventoryRepository.getByCode(data.code);
      if (existing) {
        const currentQty = existing.quantity ?? 0;
        const addQty = data.quantity ?? 0;
        
        return this.update(existing.publicId, {
          name: data.name,
          quantity: currentQty + addQty,
          unit: data.unit,
        });
      }
    }
    
    return this.create(data);
  }

  async update(publicId: string, data: UpdateInventoryInput): Promise<InventoryResponse> {
    const existing = await this.inventoryRepository.getByPublicId(publicId);
    if (!existing) throw new Error("INVENTORY_NOT_FOUND");

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.quantity !== undefined) updateData.quantity = String(data.quantity);
    if (data.minQuantity !== undefined) updateData.minQuantity = String(data.minQuantity);
    if (data.imgUrl !== undefined) updateData.imgUrl = data.imgUrl;

    const updatedItem = await this.inventoryRepository.update(publicId, updateData);
    return InventoryResponseSchema.parse(updatedItem);
  }

  async delete(publicId: string): Promise<void> {
    const existing = await this.inventoryRepository.getByPublicId(publicId);
    if (!existing) throw new Error("INVENTORY_NOT_FOUND");
    await this.inventoryRepository.delete(publicId);
  }
}
