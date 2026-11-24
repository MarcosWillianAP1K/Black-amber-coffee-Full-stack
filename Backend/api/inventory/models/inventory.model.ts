import { pool } from "../../../core/database/postgres.client.js";
import type { InventoryItemDTO } from "../dtos/inventory.dto.js";

interface InventoryRow {
  id: number;
  public_id: string;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  quantity: string | number;
  unit: string;
  min_quantity: string | number;
  img_url: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapInventoryRow(row: InventoryRow): InventoryItemDTO {
  return {
    publicId: row.public_id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    minQuantity: Number(row.min_quantity),
    imgUrl: row.img_url,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const INVENTORY_FIELDS = `
  id, public_id, code, name, description, category, quantity, unit, min_quantity, img_url, created_at, updated_at
`;

export class InventoryModel {
  static async findAll(): Promise<InventoryItemDTO[]> {
    const res = await pool.query<InventoryRow>(
      `SELECT ${INVENTORY_FIELDS} FROM public.inventory_items ORDER BY created_at DESC`,
    );
    return res.rows.map(mapInventoryRow);
  }

  static async findByPublicId(publicId: string): Promise<InventoryItemDTO | null> {
    const res = await pool.query<InventoryRow>(
      `SELECT ${INVENTORY_FIELDS} FROM public.inventory_items WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    return res.rows.length > 0 ? mapInventoryRow(res.rows[0]) : null;
  }

  static async findByCode(code: string): Promise<InventoryItemDTO | null> {
    const res = await pool.query<InventoryRow>(
      `SELECT ${INVENTORY_FIELDS} FROM public.inventory_items WHERE code = $1 LIMIT 1`,
      [code],
    );
    return res.rows.length > 0 ? mapInventoryRow(res.rows[0]) : null;
  }

  static async create(input: {
    code: string | null;
    name: string;
    description: string | null;
    category: string | null;
    quantity: number;
    unit: string;
    minQuantity: number;
    imgUrl: string | null;
  }): Promise<InventoryItemDTO> {
    const res = await pool.query<InventoryRow>(
      `INSERT INTO public.inventory_items (code, name, description, category, quantity, unit, min_quantity, img_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${INVENTORY_FIELDS}`,
      [
        input.code,
        input.name,
        input.description,
        input.category,
        input.quantity,
        input.unit,
        input.minQuantity,
        input.imgUrl,
      ],
    );
    return mapInventoryRow(res.rows[0]);
  }

  static async updateByPublicId(
    publicId: string,
    fields: {
      name?: string;
      code?: string | null;
      description?: string | null;
      category?: string | null;
      quantity?: number;
      unit?: string;
      minQuantity?: number;
      imgUrl?: string | null;
    },
  ): Promise<InventoryItemDTO | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown) => {
      values.push(value);
      setClauses.push(`${column} = $${values.length}`);
    };

    if (fields.name !== undefined) pushField("name", fields.name);
    if (fields.code !== undefined) pushField("code", fields.code);
    if (fields.description !== undefined) pushField("description", fields.description);
    if (fields.category !== undefined) pushField("category", fields.category);
    if (fields.quantity !== undefined) pushField("quantity", fields.quantity);
    if (fields.unit !== undefined) pushField("unit", fields.unit);
    if (fields.minQuantity !== undefined) pushField("min_quantity", fields.minQuantity);
    if (fields.imgUrl !== undefined) pushField("img_url", fields.imgUrl);

    if (setClauses.length === 0) {
      return this.findByPublicId(publicId);
    }

    values.push(publicId);
    const res = await pool.query<InventoryRow>(
      `UPDATE public.inventory_items
       SET ${setClauses.join(", ")}
       WHERE public_id = $${values.length}
       RETURNING ${INVENTORY_FIELDS}`,
      values,
    );

    return res.rows.length > 0 ? mapInventoryRow(res.rows[0]) : null;
  }

  static async deleteByPublicId(publicId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.inventory_items WHERE public_id = $1`, [
      publicId,
    ]);
    return (res.rowCount ?? 0) > 0;
  }
}
