import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { inventoryItems } from "@/db/schema";
import InventoryModel from "./inventory.model";

export default class InventoryRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getAll(): Promise<InventoryModel[]> {
    const result = await this.db.select().from(inventoryItems).orderBy(inventoryItems.createdAt);
    return result.map(row => InventoryModel.fromDatabase(row));
  }

  async getByPublicId(publicId: string): Promise<InventoryModel | null> {
    const result = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.publicId, publicId))
      .limit(1);

    if (!result.length) return null;
    return InventoryModel.fromDatabase(result[0]);
  }

  async getByCode(code: string): Promise<InventoryModel | null> {
    const result = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.code, code))
      .limit(1);

    if (!result.length) return null;
    return InventoryModel.fromDatabase(result[0]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any): Promise<InventoryModel> {
    const [row] = await this.db.insert(inventoryItems).values(data).returning();
    return InventoryModel.fromDatabase(row);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(publicId: string, data: any): Promise<InventoryModel> {
    const [row] = await this.db
      .update(inventoryItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventoryItems.publicId, publicId))
      .returning();
      
    if (!row) throw new Error("INVENTORY_NOT_FOUND");
    return InventoryModel.fromDatabase(row);
  }

  async delete(publicId: string): Promise<void> {
    await this.db.delete(inventoryItems).where(eq(inventoryItems.publicId, publicId));
  }
}
