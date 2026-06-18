import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { workers, workerProfiles } from "@/db/schema";
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
      .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId))
      .where(eq(workers.publicId, publicId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { workers: workerRow, worker_profiles: profileRow } = result[0];
    return WorkerModel.fromDatabase(workerRow, profileRow);
  }

  async getById(id: number): Promise<WorkerModel | null> {
    const result = await this.db
      .select()
      .from(workers)
      .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId))
      .where(eq(workers.id, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { workers: workerRow, worker_profiles: profileRow } = result[0];
    return WorkerModel.fromDatabase(workerRow, profileRow);
  }

  async getAll(): Promise<WorkerModel[]> {
    const result = await this.db
      .select()
      .from(workers)
      .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId));

    return result.map(({ workers: workerRow, worker_profiles: profileRow }) =>
      WorkerModel.fromDatabase(workerRow, profileRow),
    );
  }

  async updateProfile(worker: WorkerModel): Promise<WorkerModel> {
    const [updatedProfile] = await this.db
      .update(workerProfiles)
      .set({
        fullName: worker.profile.fullName,
        email: worker.profile.email,
        phone: worker.profile.phone,
        avatarImage: worker.profile.avatarImage,
        password: worker.profile.password,
        updatedAt: new Date(worker.profile.updatedAt),
      })
      .where(eq(workerProfiles.workerId, worker.id))
      .returning();

    return WorkerModel.fromDatabase(
      {
        id: worker.id,
        publicId: worker.publicId,
        role: worker.role,
        salary: worker.salary,
        isActive: worker.isActive,
        createdAt: new Date(worker.createdAt),
        updatedAt: new Date(worker.updatedAt),
      },
      updatedProfile,
    );
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [worker] = await tx
        .select()
        .from(workers)
        .where(eq(workers.publicId, publicId))
        .limit(1);

      if (!worker) {
        return;
      }

      await tx.delete(workerProfiles).where(eq(workerProfiles.workerId, worker.id));
      await tx.delete(workers).where(eq(workers.id, worker.id));
    });
  }
}
