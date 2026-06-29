import { drizzle } from "drizzle-orm/postgres-js";
import { eq, gt } from "drizzle-orm";
import { orders, orderItems, products, payments } from "../../db/schema";
import { OrderStatus, OrderStatusType } from "../../core/enuns/orederStatus";
import OrderModel from "./order.model";

export default class OrderRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  private async loadItemsForOrder(orderId: number) {
    const itemsRows = await this.db
      .select({
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        observation: orderItems.observation,
        productId: products.id,
        productName: products.name,
        productPrice: products.price,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return itemsRows.map((item) => ({
      id: item.productId ?? 0,
      name: item.productName ?? "",
      price: Number(item.unitPrice ?? item.productPrice ?? 0),
      quantity: item.quantity,
      observation: item.observation ?? null,
    }));
  }

  private async loadPaymentForOrder(orderId: number): Promise<string | null> {
    const [payment] = await this.db
      .select({ method: payments.method })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return payment?.method ?? null;
  }

  private async enrichOrder(row: typeof orders.$inferSelect) {
    const [itens, paymentMethod] = await Promise.all([
      this.loadItemsForOrder(row.id),
      this.loadPaymentForOrder(row.id),
    ]);
    return OrderModel.fromDatabase({ ...row, paymentMethod }, itens);
  }

  async getbyPublicId(publicId: string): Promise<OrderModel | null> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.publicId, publicId))
      .limit(1);

    if (!rows.length) return null;

    return this.enrichOrder(rows[0]);
  }

  async getById(id: number): Promise<OrderModel | null> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!rows.length) return null;

    return this.enrichOrder(rows[0]);
  }

  async getAll(): Promise<OrderModel[]> {
    const rows = await this.db.select().from(orders);
    return Promise.all(rows.map((row) => this.enrichOrder(row)));
  }

  async getByClientId(clientId: number): Promise<OrderModel[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.clientId, clientId))
      .orderBy(orders.createdAt);

    return Promise.all(rows.map((row) => this.enrichOrder(row)));
  }

  async paginate(page: number, pageSize: number): Promise<OrderModel[]> {
    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select()
      .from(orders)
      .orderBy(orders.id)
      .limit(pageSize)
      .offset(offset);

    return Promise.all(rows.map((row) => this.enrichOrder(row)));
  }

  async paginateCursor(limit: number, lastId?: number): Promise<OrderModel[]> {
    let rows;
    if (lastId) {
      rows = await this.db
        .select()
        .from(orders)
        .where(gt(orders.id, lastId))
        .orderBy(orders.id)
        .limit(limit);
    } else {
      rows = await this.db
        .select()
        .from(orders)
        .orderBy(orders.id)
        .limit(limit);
    }

    return Promise.all(rows.map((row) => this.enrichOrder(row)));
  }

  async getbyStatus(status: OrderStatusType): Promise<OrderModel[]> {
    if (!OrderStatus.isValid(status)) return [];

    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.status, status));

    return Promise.all(rows.map((row) => this.enrichOrder(row)));
  }

  async updateStatus(
    publicId: string,
    status: OrderStatusType,
    updatedByWorkerId?: number | null,
  ): Promise<OrderModel | null> {
    if (!OrderStatus.isValid(status)) return null;

    const setData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (updatedByWorkerId !== undefined && updatedByWorkerId !== null) {
      setData.updatedBy = updatedByWorkerId;
    }

    const [updatedRow] = await this.db
      .update(orders)
      .set(setData)
      .where(eq(orders.publicId, publicId))
      .returning();

    if (!updatedRow) return null;

    return this.enrichOrder(updatedRow);
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await this.db.delete(orders).where(eq(orders.publicId, publicId));
  }

  async create(
    clientId: number | null,
    publicId: string,
    code: string,
    totalAmount: string,
    status: OrderStatusType,
    observation: string | null,
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      observation?: string | null;
    }>,
    paymentMethod: string | null,
  ): Promise<OrderModel> {
    return await this.db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          publicId,
          code,
          clientId,
          totalAmount,
          status,
          observation: observation ?? null,
        })
        .returning();

      const orderItemsToInsert: (typeof orderItems.$inferInsert)[] = items.map(
        (item) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          observation: item.observation ?? null,
        }),
      );

      if (orderItemsToInsert.length > 0) {
        await tx.insert(orderItems).values(orderItemsToInsert);
      }

      // Store payment method if provided
      if (paymentMethod) {
        await tx.insert(payments).values({
          orderId: createdOrder.id,
          amount: totalAmount,
          method: paymentMethod as any,
        });
      }

      // Fetch items with unitPrice (price at time of order)
      const itemsRows = await tx
        .select({
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          observation: orderItems.observation,
          productId: products.id,
          productName: products.name,
          productPrice: products.price,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, createdOrder.id));

      const itens = itemsRows.map((item) => ({
        id: item.productId ?? 0,
        name: item.productName ?? "",
        price: Number(item.unitPrice ?? item.productPrice ?? 0),
        quantity: item.quantity,
        observation: item.observation ?? null,
      }));

      return OrderModel.fromDatabase(
        { ...createdOrder, paymentMethod },
        itens,
      );
    });
  }

  async cancelOrder(publicId: string): Promise<OrderModel | null> {
    const [updatedRow] = await this.db
      .update(orders)
      .set({ status: OrderStatus.CANCELADO, updatedAt: new Date() })
      .where(eq(orders.publicId, publicId))
      .returning();

    if (!updatedRow) return null;

    return this.enrichOrder(updatedRow);
  }
}
