import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq } from "drizzle-orm";
import { cartItems, carts, products } from "@/db/schema";
import CartModel, { CartItemModel } from "./cart.model";

export default class CartRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getOrCreateCart(clientId: number): Promise<CartModel> {
    const [existing] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.clientId, clientId))
      .limit(1);

    if (existing) {
      return this.loadCartWithItems(existing);
    }

    const [created] = await this.db
      .insert(carts)
      .values({ clientId })
      .returning();

    return new CartModel(
      created.id,
      created.clientId,
      [],
      created.createdAt.toISOString(),
      created.updatedAt.toISOString(),
    );
  }

  private async loadCartWithItems(
    cartRow: typeof carts.$inferSelect,
  ): Promise<CartModel> {
    const rows = await this.db
      .select({
        productId: cartItems.productId,
        productPublicId: products.publicId,
        name: products.name,
        description: products.description,
        imgUrl: products.imgUrl,
        price: products.price,
        category: products.category,
        quantity: cartItems.quantity,
        observation: cartItems.observation,
        addedAt: cartItems.addedAt,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartRow.id));

    const items: CartItemModel[] = rows.map((row) => ({
      productId: row.productId,
      productPublicId: row.productPublicId,
      name: row.name,
      description: row.description,
      imgUrl: row.imgUrl,
      price: Number(row.price),
      category: row.category,
      quantity: row.quantity,
      observation: row.observation,
      addedAt: row.addedAt.toISOString(),
    }));

    return new CartModel(
      cartRow.id,
      cartRow.clientId,
      items,
      cartRow.createdAt.toISOString(),
      cartRow.updatedAt.toISOString(),
    );
  }

  async getByClientId(clientId: number): Promise<CartModel | null> {
    const [cartRow] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.clientId, clientId))
      .limit(1);

    if (!cartRow) return null;

    return this.loadCartWithItems(cartRow);
  }

  async addItem(
    cartId: number,
    productId: number,
    quantity: number,
    observation?: string | null,
  ): Promise<CartModel> {
    const [existing] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .update(cartItems)
        .set({
          quantity: existing.quantity + quantity,
          observation: observation ?? existing.observation,
        })
        .where(
          and(
            eq(cartItems.cartId, cartId),
            eq(cartItems.productId, productId),
          ),
        );
    } else {
      await this.db.insert(cartItems).values({
        cartId,
        productId,
        quantity,
        observation: observation ?? null,
      });
    }

    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    const [cartRow] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    return this.loadCartWithItems(cartRow);
  }

  async updateItem(
    cartId: number,
    productId: number,
    data: { quantity?: number; observation?: string | null },
  ): Promise<CartModel | null> {
    const [existing] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
        ),
      )
      .limit(1);

    if (!existing) return null;

    const setData: Partial<typeof cartItems.$inferInsert> = {};
    if (data.quantity !== undefined) setData.quantity = data.quantity;
    if (data.observation !== undefined) setData.observation = data.observation;

    await this.db
      .update(cartItems)
      .set(setData)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
        ),
      );

    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    const [cartRow] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    return this.loadCartWithItems(cartRow);
  }

  async removeItem(cartId: number, productId: number): Promise<CartModel> {
    await this.db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
        ),
      );

    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    const [cartRow] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    return this.loadCartWithItems(cartRow);
  }

  async clearCart(cartId: number): Promise<CartModel> {
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    const [cartRow] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    return this.loadCartWithItems(cartRow);
  }
}
