import { drizzle } from "drizzle-orm/postgres-js";
import { eq, gt, like, and, gte, lte, count } from "drizzle-orm";
import { products, stocks } from "../../db/schema";
import ProductModel from "./product.model";
import {
  ProductCategoryType,
  ProductCategory,
} from "../../core/enuns/proudcCategory";
import { generateId } from "../../core/gereteId";

export default class ProductRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }
  private async loadStockForProduct(productId: number) {
    const [stock] = await this.db
      .select({
        quantity: stocks.quantity,
        minQuantity: stocks.minQuantity,
      })
      .from(stocks)
      .where(eq(stocks.productId, productId))
      .limit(1);

    return stock ?? null;
  }

  private async loadCategories(): Promise<ProductCategoryType[]> {
    const rows = await this.db
      .select({ category: products.category })
      .from(products)
      .groupBy(products.category);

    return rows
      .map((row) => row.category)
      .filter((category): category is ProductCategoryType =>
        ProductCategory.isValid(category),
      );
  }

  async getById(id: number): Promise<ProductModel | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!rows.length) return null;
    return ProductModel.fromDatabase(rows[0]);
  }

  async getByPublicId(publicId: string): Promise<ProductModel | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.publicId, publicId))
      .limit(1);

    if (!rows.length) return null;
    return ProductModel.fromDatabase(rows[0]);
  }

  async getAll(): Promise<ProductModel[]> {
    const rows = await this.db.select().from(products);
    return rows.map((row) => ProductModel.fromDatabase(row));
  }

  async paginateCursor(
    limit: number,
    lastId?: number,
  ): Promise<ProductModel[]> {
    let rows;
    if (lastId) {
      rows = await this.db
        .select()
        .from(products)
        .where(gt(products.id, lastId))
        .orderBy(products.id)
        .limit(limit);
    } else {
      rows = await this.db
        .select()
        .from(products)
        .orderBy(products.id)
        .limit(limit);
    }

    return rows.map((row) => ProductModel.fromDatabase(row));
  }

  async countAll(): Promise<number> {
    const [result] = await this.db.select({ value: count() }).from(products);
    return Number(result?.value ?? 0);
  }

  async create(
    data: Omit<ProductModel, "id" | "publicId" | "createdAt" | "updatedAt">,
  ): Promise<ProductModel> {
    const now = new Date();
    const [inserted] = await this.db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        imgUrl: data.imgUrl,
        price: String(data.price),
        category: data.category,
        isActive: data.isActive,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return ProductModel.fromDatabase(inserted);
  }

  async update(
    publicId: string,
    data: Partial<
      Omit<ProductModel, "id" | "publicId" | "createdAt" | "updatedAt">
    >,
  ): Promise<ProductModel | null> {
    const now = new Date();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imgUrl !== undefined) updateData.imgUrl = data.imgUrl;
    if (data.price !== undefined) updateData.price = String(data.price);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.publicId, publicId))
      .returning();

    if (!updated) return null;
    return ProductModel.fromDatabase(updated);
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await this.db.delete(products).where(eq(products.publicId, publicId));
  }

  async getCategories(): Promise<ProductCategoryType[]> {
    return this.loadCategories();
  }

  async getByCategory(category: ProductCategoryType): Promise<ProductModel[]> {
    if (!ProductCategory.isValid(category)) return [];

    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.category, category));

    return rows.map((row) => ProductModel.fromDatabase(row));
  }

  async filter(params: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ProductModel[]> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (params.category) {
      conditions.push(eq(products.category, params.category as any));
    }
    if (params.minPrice !== undefined) {
      conditions.push(gte(products.price, String(params.minPrice)));
    }
    if (params.maxPrice !== undefined) {
      conditions.push(lte(products.price, String(params.maxPrice)));
    }
    if (params.search) {
      conditions.push(like(products.name, `%${params.search}%`));
    }

    const rows =
      conditions.length > 0
        ? await this.db
            .select()
            .from(products)
            .where(and(...conditions))
        : await this.db.select().from(products);

    return rows.map((row) => ProductModel.fromDatabase(row));
  }

  async getStock(productId: number) {
    return this.loadStockForProduct(productId);
  }

  async paginateCursorWithStock(limit: number, lastId?: number) {
    const rows = await this.db
      .select({
        id: products.id,
        publicId: products.publicId,
        name: products.name,
        description: products.description,
        imgUrl: products.imgUrl,
        price: products.price,
        category: products.category,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        stockQuantity: stocks.quantity,
        stockMinQuantity: stocks.minQuantity,
      })
      .from(products)
      .leftJoin(stocks, eq(stocks.productId, products.id))
      .where(lastId ? gt(products.id, lastId) : undefined)
      .orderBy(products.id)
      .limit(limit);

    return rows.map((row) => ({
      ...ProductModel.fromDatabase(row),
      stock: {
        quantity: row.stockQuantity ?? 0,
        minQuantity: row.stockMinQuantity ?? 0,
      },
    }));
  }

  async updateStock(productId: number, quantity: number, minQuantity?: number) {
    const now = new Date();

    const existing = await this.loadStockForProduct(productId);

    if (existing) {
      const updateData: Record<string, unknown> = { updatedAt: now };
      updateData.quantity = quantity;
      if (minQuantity !== undefined) updateData.minQuantity = minQuantity;

      const [updated] = await this.db
        .update(stocks)
        .set(updateData)
        .where(eq(stocks.productId, productId))
        .returning();

      return updated ?? null;
    }

    const [inserted] = await this.db
      .insert(stocks)
      .values({
        productId,
        quantity,
        minQuantity: minQuantity ?? 0,
        updatedAt: now,
      })
      .returning();

    return inserted ?? null;
  }

  async activate(publicId: string): Promise<ProductModel | null> {
    const [updated] = await this.db
      .update(products)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(products.publicId, publicId))
      .returning();

    if (!updated) return null;
    return ProductModel.fromDatabase(updated);
  }

  async deactivate(publicId: string): Promise<ProductModel | null> {
    const [updated] = await this.db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.publicId, publicId))
      .returning();

    if (!updated) return null;
    return ProductModel.fromDatabase(updated);
  }
}
