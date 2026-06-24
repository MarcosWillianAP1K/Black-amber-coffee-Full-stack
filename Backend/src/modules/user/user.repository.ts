import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { clients } from "@/db/schema";
import UserModel from "./user.model";

export default class UserRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getAll(): Promise<UserModel[]> {
    const result = await this.db
      .select()
      .from(clients)
      .orderBy(clients.createdAt);

    return result.map((row) => UserModel.fromDatabase(row));
  }

  async getByPublicId(publicId: string): Promise<UserModel | null> {
    const result = await this.db
      .select()
      .from(clients)
      .where(eq(clients.publicId, publicId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return UserModel.fromDatabase(result[0]);
  }

  async update(data: UserModel, password?: string): Promise<UserModel> {
    const updateData: any = {
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      updatedAt: new Date(data.updatedAt),
    };

    if (password) {
      updateData.password = password;
    }

    const [updatedClient] = await this.db
      .update(clients)
      .set(updateData)
      .where(eq(clients.publicId, data.publicId))
      .returning();

    if (!updatedClient) {
      throw new Error("CLIENT_NOT_FOUND");
    }

    return UserModel.fromDatabase(updatedClient);
  }

  async deleteByPublicId(id: string): Promise<void> {
    await this.db.delete(clients).where(eq(clients.publicId, id));
  }
}
