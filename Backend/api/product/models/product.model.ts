import { pool, withTransaction } from "../../../core/database/postgres.client.js";
import { ProductCategory, type ProductCategoryType } from "../../../core/enums/index.js";
import type { FilterProductsInput, ProductDTO, ProductStockDTO } from "../dtos/product.dto.js";

interface ProductRow {
  id: number;
  public_id: string;
  name: string;
  description: string | null;
  category: ProductCategoryType;
  price: string | number;
  img_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface StockRow {
  product_id: number;
  quantity: number;
  min_quantity: number;
  updated_at: Date;
}

function mapProductRow(row: ProductRow): ProductDTO {
  return {
    id: row.id,
    publicId: row.public_id,
    name: row.name,
    description: row.description,
    imgUrl: row.img_url,
    price: Number(row.price),
    category: row.category,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const PRODUCT_FIELDS = `
  id, public_id, name, description, category, price, img_url, is_active, created_at, updated_at
`;

export class ProductModel {
  static async findAll(): Promise<ProductDTO[]> {
    const res = await pool.query<ProductRow>(
      `SELECT ${PRODUCT_FIELDS} FROM public.products ORDER BY id ASC`,
    );
    return res.rows.map(mapProductRow);
  }

  static async findPaginated(
    page: number,
    limit: number,
  ): Promise<{ products: ProductDTO[]; total: number }> {
    const offset = (page - 1) * limit;
    const [rowsRes, countRes] = await Promise.all([
      pool.query<ProductRow>(
        `SELECT ${PRODUCT_FIELDS} FROM public.products ORDER BY id ASC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.products`),
    ]);

    return {
      products: rowsRes.rows.map(mapProductRow),
      total: Number(countRes.rows[0]?.total ?? 0),
    };
  }

  static async filter(params: FilterProductsInput): Promise<ProductDTO[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.category && ProductCategory.isValid(params.category)) {
      values.push(params.category);
      conditions.push(`category = $${values.length}::public.product_category`);
    }
    if (params.minPrice !== undefined) {
      values.push(params.minPrice);
      conditions.push(`price >= $${values.length}`);
    }
    if (params.maxPrice !== undefined) {
      values.push(params.maxPrice);
      conditions.push(`price <= $${values.length}`);
    }
    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const res = await pool.query<ProductRow>(
      `SELECT ${PRODUCT_FIELDS} FROM public.products ${whereClause} ORDER BY id ASC`,
      values,
    );
    return res.rows.map(mapProductRow);
  }

  static async findById(id: number): Promise<ProductDTO | null> {
    const res = await pool.query<ProductRow>(
      `SELECT ${PRODUCT_FIELDS} FROM public.products WHERE id = $1 LIMIT 1`,
      [id],
    );
    return res.rows.length > 0 ? mapProductRow(res.rows[0]) : null;
  }

  static async findByPublicId(publicId: string): Promise<ProductDTO | null> {
    const res = await pool.query<ProductRow>(
      `SELECT ${PRODUCT_FIELDS} FROM public.products WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    return res.rows.length > 0 ? mapProductRow(res.rows[0]) : null;
  }

  static async findCategories(): Promise<ProductCategoryType[]> {
    const res = await pool.query<{ category: string }>(
      `SELECT DISTINCT category::text AS category FROM public.products ORDER BY category ASC`,
    );
    return res.rows
      .map((r) => r.category)
      .filter((c): c is ProductCategoryType => ProductCategory.isValid(c));
  }

  static async create(input: {
    name: string;
    description: string | null;
    imgUrl: string | null;
    price: number;
    category: ProductCategoryType;
  }): Promise<ProductDTO> {
    return withTransaction(async (client) => {
      const inserted = await client.query<ProductRow>(
        `INSERT INTO public.products (name, description, img_url, price, category, is_active)
         VALUES ($1, $2, $3, $4, $5::public.product_category, TRUE)
         RETURNING ${PRODUCT_FIELDS}`,
        [input.name, input.description, input.imgUrl, input.price, input.category],
      );

      const product = mapProductRow(inserted.rows[0]);
      await client.query(
        `INSERT INTO public.stocks (product_id, quantity, min_quantity) VALUES ($1, 0, 5)`,
        [product.id],
      );

      return product;
    });
  }

  static async updateByPublicId(
    publicId: string,
    fields: {
      name?: string;
      description?: string | null;
      imgUrl?: string | null;
      price?: number;
      category?: ProductCategoryType;
      isActive?: boolean;
    },
  ): Promise<ProductDTO | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown, cast?: string) => {
      values.push(value);
      setClauses.push(`${column} = $${values.length}${cast ?? ""}`);
    };

    if (fields.name !== undefined) pushField("name", fields.name);
    if (fields.description !== undefined) pushField("description", fields.description);
    if (fields.imgUrl !== undefined) pushField("img_url", fields.imgUrl);
    if (fields.price !== undefined) pushField("price", fields.price);
    if (fields.category !== undefined) pushField("category", fields.category, "::public.product_category");
    if (fields.isActive !== undefined) pushField("is_active", fields.isActive);

    if (setClauses.length === 0) {
      return this.findByPublicId(publicId);
    }

    values.push(publicId);
    const res = await pool.query<ProductRow>(
      `UPDATE public.products
       SET ${setClauses.join(", ")}
       WHERE public_id = $${values.length}
       RETURNING ${PRODUCT_FIELDS}`,
      values,
    );

    return res.rows.length > 0 ? mapProductRow(res.rows[0]) : null;
  }

  static async hasOrderReferences(productId: number): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM public.order_items WHERE product_id = $1) AS exists`,
      [productId],
    );
    return res.rows[0]?.exists === true;
  }

  static async deleteByPublicId(publicId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.products WHERE public_id = $1`, [publicId]);
    return (res.rowCount ?? 0) > 0;
  }

  static async getStock(productId: number): Promise<ProductStockDTO | null> {
    const res = await pool.query<StockRow>(
      `SELECT product_id, quantity, min_quantity, updated_at FROM public.stocks WHERE product_id = $1 LIMIT 1`,
      [productId],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      productId: row.product_id,
      quantity: row.quantity,
      minQuantity: row.min_quantity,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  static async upsertStock(
    productId: number,
    quantity: number,
    minQuantity?: number,
  ): Promise<ProductStockDTO> {
    const res = await pool.query<StockRow>(
      `INSERT INTO public.stocks (product_id, quantity, min_quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id) DO UPDATE
       SET quantity = EXCLUDED.quantity,
           min_quantity = COALESCE($4, public.stocks.min_quantity)
       RETURNING product_id, quantity, min_quantity, updated_at`,
      [productId, quantity, minQuantity ?? 0, minQuantity ?? null],
    );
    const row = res.rows[0];
    return {
      productId: row.product_id,
      quantity: row.quantity,
      minQuantity: row.min_quantity,
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
