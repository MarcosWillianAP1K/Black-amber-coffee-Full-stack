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
    const publicId = generateId();
    
    const dbData = {
      publicId,
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      quantityType: data.quantityType,
      quantity: data.quantity ?? null,
      img: data.img,
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
          quantityType: data.quantityType,
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
    if (data.quantityType !== undefined) updateData.quantityType = data.quantityType;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.img !== undefined) updateData.img = data.img;

    const updatedItem = await this.inventoryRepository.update(publicId, updateData);
    return InventoryResponseSchema.parse(updatedItem);
  }

  async delete(publicId: string): Promise<void> {
    const existing = await this.inventoryRepository.getByPublicId(publicId);
    if (!existing) throw new Error("INVENTORY_NOT_FOUND");
    await this.inventoryRepository.delete(publicId);
  }
}
