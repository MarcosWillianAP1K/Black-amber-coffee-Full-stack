import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { clients, profiles } from "@/db/schema";
import UserModel from "./user.model";

export default class UserRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getByPublicId(publicId: string): Promise<UserModel | null> {
    const result = await this.db
      .select()
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.publicId, publicId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients: clientRow, profiles: profileRow } = result[0];
    return UserModel.fromDatabase(clientRow, profileRow);
  }

  async update(data: UserModel, password?: string): Promise<UserModel> {
    const result = await this.db.transaction(async (tx) => {
      const updateData: any = {
        email: data.email,
        updatedAt: new Date(data.updatedAt),
      };

      if (password) {
        updateData.password = password;
      }

      const [updatedClient] = await tx
        .update(clients)
        .set(updateData)
        .where(eq(clients.publicId, data.publicId))
        .returning();

      if (!updatedClient) {
        throw new Error("CLIENT_NOT_FOUND");
      }

      const [existingProfile] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.clientId, updatedClient.id))
        .limit(1);

      if (existingProfile) {
        await tx
          .update(profiles)
          .set({
            fullName: data.profile.fullName,
            phone: data.profile.phone,
            avatarImage: data.profile.avatarImage,
            updatedAt: new Date(data.profile.updatedAt),
          })
          .where(eq(profiles.clientId, updatedClient.id));
      } else {
        await tx.insert(profiles).values({
          clientId: updatedClient.id,
          fullName: data.profile.fullName,
          phone: data.profile.phone,
          avatarImage: data.profile.avatarImage,
          createdAt: new Date(data.profile.createdAt),
          updatedAt: new Date(data.profile.updatedAt),
        });
      }

      return UserModel.fromDatabase(updatedClient, {
        ...data.profile,
        clientId: updatedClient.id,
      });
    });

    return result;
  }

  async deleteByPublicId(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [client] = await tx
        .select()
        .from(clients)
        .where(eq(clients.publicId, id))
        .limit(1);

      if (!client) {
        return;
      }

      await tx.delete(profiles).where(eq(profiles.clientId, client.id));
      await tx.delete(clients).where(eq(clients.id, client.id));
    });
  }
}
