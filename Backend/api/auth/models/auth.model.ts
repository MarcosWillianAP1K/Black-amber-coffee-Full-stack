import { pool, withTransaction } from "../../../core/database/postgres.client.js";
import type { WorkerRole } from "../../../core/enums/index.js";

export interface AuthUserRecord {
  id: number;
  publicId: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthEntity {
  type: "user" | "worker";
  user: AuthUserRecord;
  role?: WorkerRole;
  isAdmin?: boolean;
}

export interface PasswordResetTokenRecord {
  id: number;
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

interface ClientRow {
  id: number;
  public_id: string;
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface WorkerRow extends ClientRow {
  role: WorkerRole;
  is_admin: boolean;
}

function mapClientRow(row: ClientRow): AuthUserRecord {
  return {
    id: row.id,
    publicId: row.public_id,
    name: row.full_name,
    email: row.email,
    password: row.password,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class AuthModel {
  static async createClient(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthUserRecord> {
    const result = await pool.query<ClientRow>(
      `INSERT INTO public.clients (email, password, full_name, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, public_id, full_name, email, password, phone, avatar_url, is_active, created_at, updated_at`,
      [input.email, input.password, input.name, input.phone ?? null],
    );
    return mapClientRow(result.rows[0]);
  }

  static async findByEmail(email: string): Promise<AuthEntity | null> {
    const clientRes = await pool.query<ClientRow>(
      `SELECT id, public_id, full_name, email, password, phone, avatar_url, is_active, created_at, updated_at
       FROM public.clients WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (clientRes.rows.length > 0) {
      return { type: "user", user: mapClientRow(clientRes.rows[0]) };
    }

    const workerRes = await pool.query<WorkerRow>(
      `SELECT id, public_id, full_name, email, password, phone, avatar_url, is_active, role, is_admin, created_at, updated_at
       FROM public.workers WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (workerRes.rows.length > 0) {
      const w = workerRes.rows[0];
      return {
        type: "worker",
        role: w.role,
        isAdmin: w.is_admin,
        user: mapClientRow(w),
      };
    }

    return null;
  }

  static async findByPublicId(publicId: string): Promise<AuthEntity | null> {
    const clientRes = await pool.query<ClientRow>(
      `SELECT id, public_id, full_name, email, password, phone, avatar_url, is_active, created_at, updated_at
       FROM public.clients WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );

    if (clientRes.rows.length > 0) {
      return { type: "user", user: mapClientRow(clientRes.rows[0]) };
    }

    const workerRes = await pool.query<WorkerRow>(
      `SELECT id, public_id, full_name, email, password, phone, avatar_url, is_active, role, is_admin, created_at, updated_at
       FROM public.workers WHERE public_id = $1 LIMIT 1`,
      [publicId],
    );

    if (workerRes.rows.length > 0) {
      const w = workerRes.rows[0];
      return {
        type: "worker",
        role: w.role,
        isAdmin: w.is_admin,
        user: mapClientRow(w),
      };
    }

    return null;
  }

  static async createPasswordReset(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<{ id: number; email: string; code: string; expiresAt: Date }> {
    return withTransaction(async (client) => {
      await client.query(
        `UPDATE public.password_reset_tokens SET used = TRUE WHERE email = $1 AND used = FALSE`,
        [email],
      );

      const inserted = await client.query<{
        id: number;
        email: string;
        code: string;
        expires_at: Date;
      }>(
        `INSERT INTO public.password_reset_tokens (email, code, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id, email, code, expires_at`,
        [email, code, expiresAt],
      );

      const row = inserted.rows[0];
      return {
        id: row.id,
        email: row.email,
        code: row.code,
        expiresAt: row.expires_at,
      };
    });
  }

  static async getPasswordResetByCode(code: string): Promise<PasswordResetTokenRecord | null> {
    const res = await pool.query<{
      id: number;
      email: string;
      code: string;
      expires_at: Date;
      used: boolean;
    }>(
      `SELECT id, email, code, expires_at, used FROM public.password_reset_tokens WHERE code = $1 LIMIT 1`,
      [code],
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      code: row.code,
      expiresAt: row.expires_at,
      used: row.used,
    };
  }

  static async markPasswordResetAsUsed(code: string): Promise<void> {
    await pool.query(`UPDATE public.password_reset_tokens SET used = TRUE WHERE code = $1`, [code]);
  }

  static async updatePasswordByPublicId(
    publicId: string,
    entityType: "user" | "worker",
    hashedPassword: string,
  ): Promise<void> {
    const table = entityType === "worker" ? "public.workers" : "public.clients";
    await pool.query(`UPDATE ${table} SET password = $1 WHERE public_id = $2`, [
      hashedPassword,
      publicId,
    ]);
  }
}
