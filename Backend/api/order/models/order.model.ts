import type { PoolClient } from "pg";
import { pool, withTransaction } from "../../../core/database/postgres.client.js";
import { OrderStatus, type OrderStatusType } from "../../../core/enums/index.js";
import type { OrderDTO, OrderItemDTO } from "../dtos/order.dto.js";

interface OrderAggRow {
  id: number;
  public_id: string;
  code: string;
  client_id: number | null;
  updated_by: number | null;
  status: OrderStatusType;
  total_amount: string | number;
  observation: string | null;
  payment_method: string | null;
  itens: OrderItemDTO[];
  created_at: Date;
  updated_at: Date;
}

const BASE_ORDER_QUERY = `
  SELECT
    o.id,
    o.public_id,
    o.code,
    o.client_id,
    o.updated_by,
    o.status,
    o.total_amount,
    o.observation,
    o.created_at,
    o.updated_at,
    p.method::text AS payment_method,
    COALESCE(
      json_agg(
        json_build_object(
          'id', COALESCE(pr.id, oi.product_id),
          'name', COALESCE(pr.name, ''),
          'price', oi.unit_price::float8,
          'quantity', oi.quantity,
          'observation', oi.observation
        )
        ORDER BY oi.product_id
      ) FILTER (WHERE oi.product_id IS NOT NULL),
      '[]'::json
    ) AS itens
  FROM public.orders o
  LEFT JOIN public.payments p ON p.order_id = o.id
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  LEFT JOIN public.products pr ON pr.id = oi.product_id
`;

function mapOrderRow(row: OrderAggRow): OrderDTO {
  return {
    id: row.id,
    publicId: row.public_id,
    code: row.code,
    clientId: row.client_id,
    updatedBy: row.updated_by,
    status: row.status,
    totalPrice: Number(row.total_amount),
    paymentMethod: row.payment_method,
    itens: Array.isArray(row.itens) ? row.itens : [],
    observation: row.observation,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class OrderModel {
  static async findAll(status?: OrderStatusType): Promise<OrderDTO[]> {
    const values: unknown[] = [];
    let whereClause = "";

    if (status) {
      values.push(status);
      whereClause = `WHERE o.status = $1::public.order_status`;
    }

    const res = await pool.query<OrderAggRow>(
      `${BASE_ORDER_QUERY}
       ${whereClause}
       GROUP BY o.id, p.method
       ORDER BY o.created_at DESC`,
      values,
    );

    return res.rows.map(mapOrderRow);
  }

  static async findByClientId(clientId: number): Promise<OrderDTO[]> {
    const res = await pool.query<OrderAggRow>(
      `${BASE_ORDER_QUERY}
       WHERE o.client_id = $1
       GROUP BY o.id, p.method
       ORDER BY o.created_at DESC`,
      [clientId],
    );

    return res.rows.map(mapOrderRow);
  }

  static async findByPublicId(publicId: string, client?: PoolClient): Promise<OrderDTO | null> {
    const executor = client ?? pool;
    const res = await executor.query<OrderAggRow>(
      `${BASE_ORDER_QUERY}
       WHERE o.public_id = $1
       GROUP BY o.id, p.method
       LIMIT 1`,
      [publicId],
    );

    return res.rows.length > 0 ? mapOrderRow(res.rows[0]) : null;
  }

  static async create(input: {
    clientId: number | null;
    publicId: string;
    code: string;
    totalAmount: number;
    status: OrderStatusType;
    observation: string | null;
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
      observation?: string | null;
    }>;
    paymentMethod: string | null;
    actorWorkerId?: number | null;
  }): Promise<OrderDTO> {
    return withTransaction(async (client) => {
      const orderRes = await client.query<{ id: number; public_id: string }>(
        `INSERT INTO public.orders (public_id, code, client_id, total_amount, status, observation)
         VALUES ($1, $2, $3, $4, $5::public.order_status, $6)
         RETURNING id, public_id`,
        [
          input.publicId,
          input.code,
          input.clientId,
          input.totalAmount.toFixed(2),
          input.status,
          input.observation,
        ],
      );

      const orderId = orderRes.rows[0].id;
      const orderPublicId = orderRes.rows[0].public_id;

      for (const item of input.items) {
        await client.query(
          `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, observation)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.quantity, item.unitPrice.toFixed(2), item.observation ?? null],
        );
      }

      if (input.paymentMethod) {
        await client.query(
          `INSERT INTO public.payments (order_id, amount, method, status)
           VALUES ($1, $2, $3::public.payment_method, 'pendente')`,
          [orderId, input.totalAmount.toFixed(2), input.paymentMethod],
        );
      }

      await client.query(
        `INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by_worker)
         VALUES ($1, $2::public.order_status, $3::public.order_status, $4)`,
        [orderId, input.status, input.status, input.actorWorkerId ?? null],
      );

      const created = await this.findByPublicId(orderPublicId, client);
      if (!created) throw new Error("ORDER_NOT_FOUND");
      return created;
    });
  }

  static async updateStatus(
    publicId: string,
    previousStatus: OrderStatusType,
    newStatus: OrderStatusType,
    workerId: number | null,
  ): Promise<OrderDTO | null> {
    return withTransaction(async (client) => {
      const res = await client.query<{ id: number }>(
        `UPDATE public.orders
         SET status = $1::public.order_status,
             updated_by = COALESCE($2, updated_by)
         WHERE public_id = $3
         RETURNING id`,
        [newStatus, workerId, publicId],
      );

      if (res.rows.length === 0) return null;

      await client.query(
        `INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by_worker)
         VALUES ($1, $2::public.order_status, $3::public.order_status, $4)`,
        [res.rows[0].id, previousStatus, newStatus, workerId],
      );

      return this.findByPublicId(publicId, client);
    });
  }

  static async cancel(publicId: string, previousStatus: OrderStatusType): Promise<OrderDTO | null> {
    return this.updateStatus(publicId, previousStatus, OrderStatus.CANCELADO, null);
  }

  static async deleteByPublicId(publicId: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.orders WHERE public_id = $1`, [publicId]);
    return (res.rowCount ?? 0) > 0;
  }
}
