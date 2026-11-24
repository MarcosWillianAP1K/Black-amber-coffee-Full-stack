import { withTransaction } from "../../../core/database/postgres.client.js";
import { OrderStatus } from "../../../core/enums/index.js";
import { OrderModel } from "../../order/models/order.model.js";
import type { OrderDTO } from "../../order/dtos/order.dto.js";
import type { PaymentDTO } from "../dtos/payment.dto.js";

interface CartItemTxRow {
  cart_id: number;
  product_id: number;
  quantity: number;
  observation: string | null;
  price: string | number;
  is_active: boolean;
}

interface PaymentRow {
  id: number;
  order_id: number;
  amount: string | number;
  method: string;
  status: string;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class PaymentModel {
  static async checkoutFromCart(input: {
    clientId: number;
    publicId: string;
    code: string;
    paymentMethod: string;
    observation: string | null;
  }): Promise<{ order: OrderDTO; payment: PaymentDTO }> {
    return withTransaction(async (client) => {
      const cartRes = await client.query<{ id: number }>(
        `SELECT id FROM public.carts WHERE client_id = $1 LIMIT 1`,
        [input.clientId],
      );

      if (cartRes.rows.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const cartId = cartRes.rows[0].id;

      const itemsRes = await client.query<CartItemTxRow>(
        `SELECT ci.cart_id, ci.product_id, ci.quantity, ci.observation, p.price, p.is_active
         FROM public.cart_items ci
         INNER JOIN public.products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1`,
        [cartId],
      );

      if (itemsRes.rows.length === 0) {
        throw new Error("CART_EMPTY");
      }

      let total = 0;
      for (const item of itemsRes.rows) {
        if (!item.is_active) throw new Error("PRODUCT_INACTIVE");
        total += Number(item.price) * item.quantity;
      }

      const totalFormatted = total.toFixed(2);

      const orderInsert = await client.query<{ id: number }>(
        `INSERT INTO public.orders (public_id, code, client_id, total_amount, status, observation)
         VALUES ($1, $2, $3, $4, $5::public.order_status, $6)
         RETURNING id`,
        [
          input.publicId,
          input.code,
          input.clientId,
          totalFormatted,
          OrderStatus.CRIADO,
          input.observation,
        ],
      );

      const orderId = orderInsert.rows[0].id;

      for (const item of itemsRes.rows) {
        await client.query(
          `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, observation)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            Number(item.price).toFixed(2),
            item.observation,
          ],
        );
      }

      await client.query(
        `INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by_worker)
         VALUES ($1, $2::public.order_status, $3::public.order_status, NULL)`,
        [orderId, OrderStatus.CRIADO, OrderStatus.CRIADO],
      );

      const paymentInsert = await client.query<PaymentRow>(
        `INSERT INTO public.payments (order_id, amount, method, status, paid_at)
         VALUES ($1, $2, $3::public.payment_method, 'confirmado', NOW())
         RETURNING id, order_id, amount, method::text AS method, status::text AS status, paid_at, created_at, updated_at`,
        [orderId, totalFormatted, input.paymentMethod],
      );

      await client.query(`DELETE FROM public.cart_items WHERE cart_id = $1`, [cartId]);
      await client.query(`UPDATE public.carts SET updated_at = NOW() WHERE id = $1`, [cartId]);

      const order = await OrderModel.findByPublicId(input.publicId, client);
      if (!order) throw new Error("ORDER_NOT_FOUND");

      const p = paymentInsert.rows[0];
      return {
        order,
        payment: {
          id: p.id,
          orderId: p.order_id,
          amount: Number(p.amount),
          method: p.method,
          status: p.status,
          paidAt: p.paid_at ? p.paid_at.toISOString() : null,
          createdAt: p.created_at.toISOString(),
          updatedAt: p.updated_at.toISOString(),
        },
      };
    });
  }
}
