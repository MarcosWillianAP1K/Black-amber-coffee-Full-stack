import { pool, withTransaction } from "../../../core/database/postgres.client.js";
import type { CartDTO, CartItemDTO } from "../dtos/cart.dto.js";

interface CartRow {
  id: number;
  client_id: number;
  created_at: Date;
  updated_at: Date;
}

interface CartItemQueryRow {
  product_id: number;
  product_public_id: string;
  name: string;
  description: string | null;
  img_url: string | null;
  price: string | number;
  category: string;
  quantity: number;
  observation: string | null;
  added_at: Date;
}

function buildCartDTO(cartRow: CartRow, items: CartItemDTO[]): CartDTO {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  return {
    id: cartRow.id,
    itemCount,
    subtotal,
    items,
    createdAt: cartRow.created_at.toISOString(),
    updatedAt: cartRow.updated_at.toISOString(),
  };
}

export class CartModel {
  private static async loadCartWithItems(cartRow: CartRow): Promise<CartDTO> {
    const res = await pool.query<CartItemQueryRow>(
      `SELECT
         ci.product_id,
         p.public_id AS product_public_id,
         p.name,
         p.description,
         p.img_url,
         p.price,
         p.category::text AS category,
         ci.quantity,
         ci.observation,
         ci.added_at
       FROM public.cart_items ci
       INNER JOIN public.products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.added_at ASC`,
      [cartRow.id],
    );

    const items: CartItemDTO[] = res.rows.map((r) => ({
      productId: r.product_id,
      productPublicId: r.product_public_id,
      name: r.name,
      description: r.description,
      imgUrl: r.img_url,
      price: Number(r.price),
      category: r.category,
      quantity: r.quantity,
      observation: r.observation,
      addedAt: r.added_at.toISOString(),
    }));

    return buildCartDTO(cartRow, items);
  }

  static async getOrCreateByClientId(clientId: number): Promise<CartDTO> {
    const existing = await pool.query<CartRow>(
      `SELECT id, client_id, created_at, updated_at FROM public.carts WHERE client_id = $1 LIMIT 1`,
      [clientId],
    );

    if (existing.rows.length > 0) {
      return this.loadCartWithItems(existing.rows[0]);
    }

    const created = await pool.query<CartRow>(
      `INSERT INTO public.carts (client_id) VALUES ($1) RETURNING id, client_id, created_at, updated_at`,
      [clientId],
    );
    return buildCartDTO(created.rows[0], []);
  }

  static async addItem(
    cartId: number,
    productId: number,
    quantity: number,
    observation?: string | null,
  ): Promise<CartDTO> {
    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO public.cart_items (cart_id, product_id, quantity, observation)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cart_id, product_id) DO UPDATE
         SET quantity = public.cart_items.quantity + EXCLUDED.quantity,
             observation = COALESCE(EXCLUDED.observation, public.cart_items.observation)`,
        [cartId, productId, quantity, observation ?? null],
      );

      await client.query(`UPDATE public.carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
    });

    const cartRes = await pool.query<CartRow>(
      `SELECT id, client_id, created_at, updated_at FROM public.carts WHERE id = $1 LIMIT 1`,
      [cartId],
    );
    return this.loadCartWithItems(cartRes.rows[0]);
  }

  static async updateItem(
    cartId: number,
    productId: number,
    data: { quantity?: number; observation?: string | null },
  ): Promise<CartDTO | null> {
    const existing = await pool.query<{ quantity: number }>(
      `SELECT quantity FROM public.cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1`,
      [cartId, productId],
    );

    if (existing.rows.length === 0) return null;

    await withTransaction(async (client) => {
      const updates: string[] = [];
      const values: unknown[] = [];

      if (data.quantity !== undefined) {
        values.push(data.quantity);
        updates.push(`quantity = $${values.length}`);
      }
      if (data.observation !== undefined) {
        values.push(data.observation);
        updates.push(`observation = $${values.length}`);
      }

      if (updates.length > 0) {
        values.push(cartId, productId);
        await client.query(
          `UPDATE public.cart_items
           SET ${updates.join(", ")}
           WHERE cart_id = $${values.length - 1} AND product_id = $${values.length}`,
          values,
        );
      }

      await client.query(`UPDATE public.carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
    });

    const cartRes = await pool.query<CartRow>(
      `SELECT id, client_id, created_at, updated_at FROM public.carts WHERE id = $1 LIMIT 1`,
      [cartId],
    );
    return this.loadCartWithItems(cartRes.rows[0]);
  }

  static async removeItem(cartId: number, productId: number): Promise<CartDTO> {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM public.cart_items WHERE cart_id = $1 AND product_id = $2`, [
        cartId,
        productId,
      ]);
      await client.query(`UPDATE public.carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
    });

    const cartRes = await pool.query<CartRow>(
      `SELECT id, client_id, created_at, updated_at FROM public.carts WHERE id = $1 LIMIT 1`,
      [cartId],
    );
    return this.loadCartWithItems(cartRes.rows[0]);
  }

  static async clearCart(cartId: number): Promise<CartDTO> {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM public.cart_items WHERE cart_id = $1`, [cartId]);
      await client.query(`UPDATE public.carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
    });

    const cartRes = await pool.query<CartRow>(
      `SELECT id, client_id, created_at, updated_at FROM public.carts WHERE id = $1 LIMIT 1`,
      [cartId],
    );
    return this.loadCartWithItems(cartRes.rows[0]);
  }
}
