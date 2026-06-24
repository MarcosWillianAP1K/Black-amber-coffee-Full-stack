import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { orderStatusHistory } from "@/db/schema";

export default class OrderHistoryRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async add(
    orderId: number,
    changedByWorkerId: number | null,
    previousStatus: string,
    newStatus: string,
  ) {
    const values: typeof orderStatusHistory.$inferInsert = {
      orderId,
      changedByWorker: changedByWorkerId,
      previousStatus: previousStatus as typeof orderStatusHistory.$inferInsert['previousStatus'],
      newStatus: newStatus as typeof orderStatusHistory.$inferInsert['newStatus'],
    };

    const [row] = await this.db
      .insert(orderStatusHistory)
      .values(values)
      .returning();

    return row;
  }

  async getByOrderId(orderId: number) {
    const rows = await this.db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(orderStatusHistory.changedAt);

    return rows;
  }
}
