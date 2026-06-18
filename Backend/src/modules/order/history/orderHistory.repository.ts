import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { orderHistory } from "@/db/schema";

export default class OrderHistoryRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async add(
    orderId: number,
    changedBy: string,
    previousStatus: string,
    newStatus: string,
  ) {
    const values: typeof orderHistory.$inferInsert = {
      orderId,
      changedBy,
      previousStatus: previousStatus as typeof orderHistory.$inferInsert['previousStatus'],
      newStatus: newStatus as typeof orderHistory.$inferInsert['newStatus'],
    };

    const [row] = await this.db
      .insert(orderHistory)
      .values(values)
      .returning();

    return row;
  }

  async getByOrderId(orderId: number) {
    const rows = await this.db
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.orderId, orderId))
      .orderBy(orderHistory.createdAt);

    return rows;
  }
}

