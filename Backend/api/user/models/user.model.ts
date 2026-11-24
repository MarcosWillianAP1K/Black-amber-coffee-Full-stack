import { pool } from "../../../core/database/postgres.client.js";
import type { UserDTO } from "../dtos/user.dto.js";

interface ClientRow {
  id: number;
  public_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapUserRow(row: ClientRow): UserDTO {
  return {
    publicId: row.public_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const USER_SELECT_FIELDS = `
  id, public_id, email, full_name, phone, avatar_url, is_active, created_at, updated_at
`;

export class UserModel {
  static async findAll(): Promise<UserDTO[]> {
    const res = await pool.query<ClientRow>(
      `SELECT ${USER_SELECT_FIELDS} FROM public.clients ORDER BY created_at DESC`,
    );
    return res.rows.map(mapUserRow);
  }

  static async findByPublicId(publicId: string): Promise<UserDTO | null> {
    const res = await pool.query<ClientRow>(
      `SELECT ${USER_SELECT_FIELDS} FROM public.clients WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    return res.rows.length > 0 ? mapUserRow(res.rows[0]) : null;
  }

  static async findInternalIdByPublicId(publicId: string): Promise<number | null> {
    const res = await pool.query<{ id: number }>(
      `SELECT id FROM public.clients WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    return res.rows[0]?.id ?? null;
  }

  static async updateByPublicId(
    publicId: string,
    fields: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      password?: string;
      isActive?: boolean;
    },
  ): Promise<UserDTO | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown) => {
      values.push(value);
      setClauses.push(`${column} = $${values.length}`);
    };

    if (fields.fullName !== undefined) pushField("full_name", fields.fullName);
    if (fields.email !== undefined) pushField("email", fields.email);
    if (fields.phone !== undefined) pushField("phone", fields.phone);
    if (fields.avatarUrl !== undefined) pushField("avatar_url", fields.avatarUrl);
    if (fields.password !== undefined) pushField("password", fields.password);
    if (fields.isActive !== undefined) pushField("is_active", fields.isActive);

    if (setClauses.length === 0) {
      return this.findByPublicId(publicId);
    }

    values.push(publicId);
    const res = await pool.query<ClientRow>(
      `UPDATE public.clients
       SET ${setClauses.join(", ")}
       WHERE public_id = $${values.length}
       RETURNING ${USER_SELECT_FIELDS}`,
      values,
    );

    return res.rows.length > 0 ? mapUserRow(res.rows[0]) : null;
  }

  static async deleteByPublicId(publicId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.clients WHERE public_id = $1`, [publicId]);
    return (res.rowCount ?? 0) > 0;
  }
}
