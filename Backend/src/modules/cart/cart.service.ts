import CartRepository from "./cart.repository";
import UserRepository from "@/modules/user/user.repository";
import ProductRepository from "@/modules/product/product.repository";
import CartModel from "./cart.model";
import {
  AddCartItemRequest,
  GetCartResponse,
  GetCartResponseSchema,
  UpdateCartItemRequest,
} from "./cart.schema";

export default class CartService {
  private cartRepository: CartRepository;
  private userRepository: UserRepository;
  private productRepository: ProductRepository;

  constructor(
    cartRepository: CartRepository,
    userRepository: UserRepository,
    productRepository: ProductRepository,
  ) {
    this.cartRepository = cartRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
  }

  private serializeCart(cart: CartModel) {
    return {
      id: cart.id,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      items: cart.items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getCart(clientPublicId: string): Promise<GetCartResponse> {
    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const cart = await this.cartRepository.getOrCreateCart(user.id);

    return GetCartResponseSchema.parse({
      data: this.serializeCart(cart),
    });
  }

  async addItem(
    clientPublicId: string,
    data: AddCartItemRequest,
  ): Promise<GetCartResponse> {
    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const product = await this.productRepository.getById(data.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (!product.isActive) throw new Error("PRODUCT_INACTIVE");

    const cart = await this.cartRepository.getOrCreateCart(user.id);
    const updated = await this.cartRepository.addItem(
      cart.id,
      data.productId,
      data.quantity ?? 1,
      data.observation,
    );

    return GetCartResponseSchema.parse({
      data: this.serializeCart(updated),
    });
  }

  async updateItem(
    clientPublicId: string,
    productId: number,
    data: UpdateCartItemRequest,
  ): Promise<GetCartResponse> {
    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const cart = await this.cartRepository.getOrCreateCart(user.id);
    const updated = await this.cartRepository.updateItem(cart.id, productId, data);

    if (!updated) throw new Error("CART_ITEM_NOT_FOUND");

    return GetCartResponseSchema.parse({
      data: this.serializeCart(updated),
    });
  }

  async removeItem(
    clientPublicId: string,
    productId: number,
  ): Promise<GetCartResponse> {
    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const cart = await this.cartRepository.getOrCreateCart(user.id);
    const updated = await this.cartRepository.removeItem(cart.id, productId);

    return GetCartResponseSchema.parse({
      data: this.serializeCart(updated),
    });
  }

  async clearCart(clientPublicId: string): Promise<GetCartResponse> {
    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const cart = await this.cartRepository.getOrCreateCart(user.id);
    const updated = await this.cartRepository.clearCart(cart.id);

    return GetCartResponseSchema.parse({
      data: this.serializeCart(updated),
    });
  }
}
