import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { payments } from "@/db/schema";
import { PaymentStatus, PaymentStatusType } from "@/core/enuns/payment.types";

export interface PaymentRecord {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: PaymentStatusType;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default class PaymentRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  private mapRow(row: typeof payments.$inferSelect): PaymentRecord {
    return {
      id: row.id,
      orderId: row.orderId,
      amount: Number(row.amount),
      method: row.method,
      status: row.status,
      paidAt: row.paidAt ? row.paidAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getByOrderId(orderId: number): Promise<PaymentRecord | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return row ? this.mapRow(row) : null;
  }

  async confirmPayment(orderId: number): Promise<PaymentRecord | null> {
    const now = new Date();
    const [updated] = await this.db
      .update(payments)
      .set({
        status: PaymentStatus.CONFIRMADO,
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(payments.orderId, orderId))
      .returning();

    return updated ? this.mapRow(updated) : null;
  }
}
