import { pool } from "../../../core/database/postgres.client.js";
import type { WorkerRole } from "../../../core/enums/index.js";
import type { WorkerDTO } from "../dtos/worker.dto.js";

interface WorkerRow {
  id: number;
  public_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: WorkerRole;
  salary: string | number;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapWorkerRow(row: WorkerRow): WorkerDTO {
  return {
    publicId: row.public_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    role: row.role,
    salary: Number(row.salary),
    isAdmin: row.is_admin,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const WORKER_SELECT_FIELDS = `
  id, public_id, email, full_name, phone, avatar_url, role, salary, is_admin, is_active, created_at, updated_at
`;

export class WorkerModel {
  static async findAll(): Promise<WorkerDTO[]> {
    const res = await pool.query<WorkerRow>(
      `SELECT ${WORKER_SELECT_FIELDS} FROM public.workers ORDER BY created_at DESC`,
    );
    return res.rows.map(mapWorkerRow);
  }

  static async findByPublicId(publicId: string): Promise<WorkerDTO | null> {
    const res = await pool.query<WorkerRow>(
      `SELECT ${WORKER_SELECT_FIELDS} FROM public.workers WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    return res.rows.length > 0 ? mapWorkerRow(res.rows[0]) : null;
  }

  static async findIdByPublicId(publicId: string): Promise<{ id: number; isActive: boolean } | null> {
    const res = await pool.query<{ id: number; is_active: boolean }>(
      `SELECT id, is_active FROM public.workers WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );
    if (res.rows.length === 0) return null;
    return { id: res.rows[0].id, isActive: res.rows[0].is_active };
  }

  static async create(input: {
    email: string;
    password: string;
    fullName: string;
    phone: string | null;
    role: WorkerRole;
    salary: number;
    isAdmin: boolean;
  }): Promise<WorkerDTO> {
    const res = await pool.query<WorkerRow>(
      `INSERT INTO public.workers (email, password, full_name, phone, role, salary, is_admin, is_active)
       VALUES ($1, $2, $3, $4, $5::public.worker_roles, $6, $7, TRUE)
       RETURNING ${WORKER_SELECT_FIELDS}`,
      [
        input.email,
        input.password,
        input.fullName,
        input.phone,
        input.role,
        input.salary,
        input.isAdmin,
      ],
    );
    return mapWorkerRow(res.rows[0]);
  }

  static async updateByPublicId(
    publicId: string,
    fields: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      password?: string;
      role?: WorkerRole;
      isAdmin?: boolean;
      salary?: number;
      isActive?: boolean;
    },
  ): Promise<WorkerDTO | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown, cast?: string) => {
      values.push(value);
      setClauses.push(`${column} = $${values.length}${cast ?? ""}`);
    };

    if (fields.fullName !== undefined) pushField("full_name", fields.fullName);
    if (fields.email !== undefined) pushField("email", fields.email);
    if (fields.phone !== undefined) pushField("phone", fields.phone);
    if (fields.avatarUrl !== undefined) pushField("avatar_url", fields.avatarUrl);
    if (fields.password !== undefined) pushField("password", fields.password);
    if (fields.role !== undefined) pushField("role", fields.role, "::public.worker_roles");
    if (fields.isAdmin !== undefined) pushField("is_admin", fields.isAdmin);
    if (fields.salary !== undefined) pushField("salary", fields.salary);
    if (fields.isActive !== undefined) pushField("is_active", fields.isActive);

    if (setClauses.length === 0) {
      return this.findByPublicId(publicId);
    }

    values.push(publicId);
    const res = await pool.query<WorkerRow>(
      `UPDATE public.workers
       SET ${setClauses.join(", ")}
       WHERE public_id = $${values.length}
       RETURNING ${WORKER_SELECT_FIELDS}`,
      values,
    );

    return res.rows.length > 0 ? mapWorkerRow(res.rows[0]) : null;
  }

  static async deleteByPublicId(publicId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.workers WHERE public_id = $1`, [publicId]);
    return (res.rowCount ?? 0) > 0;
  }
}
