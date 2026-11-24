import { ProductModel } from "../../product/models/product.model.js";
import { UserModel } from "../../user/models/user.model.js";
import { CartModel } from "../models/cart.model.js";
import type { AddCartItemInput, CartDTO, UpdateCartItemInput } from "../dtos/cart.dto.js";

export class CartService {
  static async getCart(clientPublicId: string): Promise<CartDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");
    return CartModel.getOrCreateByClientId(clientId);
  }

  static async addItem(clientPublicId: string, data: AddCartItemInput): Promise<CartDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    const product = await ProductModel.findById(data.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (!product.isActive) throw new Error("PRODUCT_INACTIVE");

    const cart = await CartModel.getOrCreateByClientId(clientId);
    return CartModel.addItem(cart.id, data.productId, data.quantity ?? 1, data.observation);
  }

  static async updateItem(
    clientPublicId: string,
    productId: number,
    data: UpdateCartItemInput,
  ): Promise<CartDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    const cart = await CartModel.getOrCreateByClientId(clientId);
    const updated = await CartModel.updateItem(cart.id, productId, data);
    if (!updated) throw new Error("CART_ITEM_NOT_FOUND");
    return updated;
  }

  static async removeItem(clientPublicId: string, productId: number): Promise<CartDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    const cart = await CartModel.getOrCreateByClientId(clientId);
    return CartModel.removeItem(cart.id, productId);
  }

  static async clearCart(clientPublicId: string): Promise<CartDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(clientPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    const cart = await CartModel.getOrCreateByClientId(clientId);
    return CartModel.clearCart(cart.id);
  }
}
