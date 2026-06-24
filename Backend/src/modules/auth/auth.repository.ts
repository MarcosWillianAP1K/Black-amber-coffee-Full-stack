import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import { clients, workers, passwordResetTokens } from "@/db/schema";
import authModel from "@/modules/auth/auth.model";
import { WorkerRole } from "@/core/enuns/workerRole";

export type UserType = "user" | "worker";

export interface AuthEntity {
  type: UserType;
  user: authModel;
  role?: WorkerRole;
  isAdmin?: boolean;
}

export default class authRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async create(data: authModel): Promise<authModel> {
    const clientData: typeof clients.$inferInsert = {
      email: data.email,
      password: data.password,
      fullName: data.name,
      phone: data.phone ?? null,
      avatarUrl: null,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };

    const [inserted] = await this.db
      .insert(clients)
      .values(clientData)
      .returning();

    return new authModel(
      inserted.id,
      inserted.publicId,
      inserted.fullName,
      inserted.email,
      inserted.password,
      inserted.phone ?? undefined,
      inserted.avatarUrl,
      inserted.createdAt,
      inserted.updatedAt,
    );
  }

  async getByEmail(email: string): Promise<AuthEntity | null> {
    // Check clients first
    const clientResult = await this.db
      .select()
      .from(clients)
      .where(eq(clients.email, email))
      .limit(1);

    if (clientResult.length) {
      const client = clientResult[0];
      return {
        type: "user",
        user: new authModel(
          client.id,
          client.publicId,
          client.fullName,
          client.email,
          client.password,
          client.phone ?? undefined,
          client.avatarUrl,
          client.createdAt,
          client.updatedAt,
        ),
      };
    }

    // Check workers
    const workerResult = await this.db
      .select()
      .from(workers)
      .where(eq(workers.email, email))
      .limit(1);

    if (workerResult.length) {
      const worker = workerResult[0];
      return {
        type: "worker",
        role: worker.role,
        isAdmin: worker.isAdmin,
        user: new authModel(
          worker.id,
          worker.publicId,
          worker.fullName,
          worker.email,
          worker.password,
          worker.phone ?? undefined,
          worker.avatarUrl,
          worker.createdAt,
          worker.updatedAt,
        ),
      };
    }

    return null;
  }

  async getById(id: string): Promise<AuthEntity | null> {
    // Check clients
    const clientResult = await this.db
      .select()
      .from(clients)
      .where(eq(clients.publicId, id))
      .limit(1);

    if (clientResult.length) {
      const client = clientResult[0];
      return {
        type: "user",
        user: new authModel(
          client.id,
          client.publicId,
          client.fullName,
          client.email,
          client.password,
          client.phone ?? undefined,
          client.avatarUrl,
          client.createdAt,
          client.updatedAt,
        ),
      };
    }

    // Check workers
    const workerResult = await this.db
      .select()
      .from(workers)
      .where(eq(workers.publicId, id))
      .limit(1);

    if (workerResult.length) {
      const worker = workerResult[0];
      return {
        type: "worker",
        role: worker.role,
        isAdmin: worker.isAdmin,
        user: new authModel(
          worker.id,
          worker.publicId,
          worker.fullName,
          worker.email,
          worker.password,
          worker.phone ?? undefined,
          worker.avatarUrl,
          worker.createdAt,
          worker.updatedAt,
        ),
      };
    }

    return null;
  }

  async createPasswordReset(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<{ id: number; email: string; code: string; expiresAt: Date }> {
    // Mark any existing unused tokens for this email as used
    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(
        and(
          eq(passwordResetTokens.email, email),
          eq(passwordResetTokens.used, false),
        ),
      );

    const [inserted] = await this.db
      .insert(passwordResetTokens)
      .values({
        email,
        code,
        expiresAt,
      })
      .returning();

    return {
      id: inserted.id,
      email: inserted.email,
      code: inserted.code,
      expiresAt: inserted.expiresAt,
    };
  }

  async getPasswordResetByCode(
    code: string,
  ): Promise<{
    id: number;
    email: string;
    code: string;
    expiresAt: Date;
    used: boolean;
  } | null> {
    const [reset] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.code, code))
      .limit(1);

    if (!reset) return null;

    return {
      id: reset.id,
      email: reset.email,
      code: reset.code,
      expiresAt: reset.expiresAt,
      used: reset.used,
    };
  }

  async markPasswordResetAsUsed(code: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.code, code));
  }

  async updateUserPassword(
    userId: number,
    hashedPassword: string,
  ): Promise<void> {
    // Try updating client first
    const [updatedClient] = await this.db
      .update(clients)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(clients.id, userId))
      .returning();

    if (updatedClient) return;

    // If not a client, try worker
    await this.db
      .update(workers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(workers.id, userId));
  }
}
