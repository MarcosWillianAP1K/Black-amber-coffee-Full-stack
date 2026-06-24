import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { workers } from "@/db/schema";
import WorkerModel from "./worker.model";

export default class WorkerRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getByPublicId(publicId: string): Promise<WorkerModel | null> {
    const result = await this.db
      .select()
      .from(workers)
      .where(eq(workers.publicId, publicId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return WorkerModel.fromDatabase(result[0]);
  }

  async getById(id: number): Promise<WorkerModel | null> {
    const result = await this.db
      .select()
      .from(workers)
      .where(eq(workers.id, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return WorkerModel.fromDatabase(result[0]);
  }

  async getAll(): Promise<WorkerModel[]> {
    const result = await this.db
      .select()
      .from(workers);

    return result.map((row) => WorkerModel.fromDatabase(row));
  }

  async update(worker: WorkerModel, password?: string): Promise<WorkerModel> {
    const updateData: any = {
      fullName: worker.fullName,
      email: worker.email,
      phone: worker.phone,
      avatarUrl: worker.avatarUrl,
      updatedAt: new Date(worker.updatedAt),
    };

    if (password) {
      updateData.password = password;
    }

    const [updated] = await this.db
      .update(workers)
      .set(updateData)
      .where(eq(workers.id, worker.id))
      .returning();

    if (!updated) {
      throw new Error("WORKER_NOT_FOUND");
    }

    return WorkerModel.fromDatabase(updated);
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await this.db.delete(workers).where(eq(workers.publicId, publicId));
  }
}
