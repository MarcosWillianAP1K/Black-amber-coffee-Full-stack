import CartRepository from "../cart/cart.repository";
import UserRepository from "../user/user.repository";
import ProductRepository from "../product/product.repository";
import OrderRepository from "../order/order.repository";
import OrderHistoryRepository from "../order/history/orderHistory.repository";
import PaymentRepository from "./payment.repository";
import { OrderStatus } from "../../core/enuns/orederStatus";
import { PaymentMethod } from "../../core/enuns/payment.types";
import { generateId } from "../../core/gereteId";
import { generateOrderCode } from "../../shared/utils/code.gerator";
import {
  SimulatePaymentRequest,
  SimulatePaymentResponse,
  SimulatePaymentResponseSchema,
} from "./payment.schema";

export default class PaymentService {
  private cartRepository: CartRepository;
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private orderRepository: OrderRepository;
  private orderHistoryRepository: OrderHistoryRepository;
  private paymentRepository: PaymentRepository;

  constructor(
    cartRepository: CartRepository,
    userRepository: UserRepository,
    productRepository: ProductRepository,
    orderRepository: OrderRepository,
    orderHistoryRepository: OrderHistoryRepository,
    paymentRepository: PaymentRepository,
  ) {
    this.cartRepository = cartRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.orderHistoryRepository = orderHistoryRepository;
    this.paymentRepository = paymentRepository;
  }

  /**
   * Simulates a successful checkout: creates order from cart items,
   * confirms payment immediately, and clears the cart.
   */
  async simulateCheckout(
    clientPublicId: string,
    data: SimulatePaymentRequest,
  ): Promise<SimulatePaymentResponse> {
    if (!PaymentMethod.isValid(data.paymentMethod)) {
      throw new Error("INVALID_PAYMENT_METHOD");
    }

    const user = await this.userRepository.getByPublicId(clientPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const cart = await this.cartRepository.getByClientId(user.id);
    if (!cart || cart.items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    for (const item of cart.items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (!product.isActive) throw new Error("PRODUCT_INACTIVE");
    }

    const itemsWithPrice = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: String(item.price),
      observation: item.observation,
    }));

    const total = cart.subtotal;
    const publicId = generateId();
    const code = generateOrderCode();

    const createdOrder = await this.orderRepository.create(
      user.id,
      publicId,
      code,
      String(total),
      OrderStatus.CRIADO,
      data.observation ?? null,
      itemsWithPrice,
      data.paymentMethod,
    );

    await this.orderHistoryRepository.add(
      createdOrder.id,
      null,
      OrderStatus.CRIADO,
      OrderStatus.CRIADO,
    );

    const payment = await this.paymentRepository.confirmPayment(createdOrder.id);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    await this.cartRepository.clearCart(cart.id);

    return SimulatePaymentResponseSchema.parse({
      data: {
        order: {
          id: createdOrder.id,
          publicId: createdOrder.publicId,
          code: createdOrder.code,
          status: createdOrder.status,
          totalPrice: createdOrder.totalPrice,
          paymentMethod: createdOrder.paymentMethod,
          itens: createdOrder.itens,
          observation: createdOrder.observation,
          createdAt: createdOrder.createdAt,
          updatedAt: createdOrder.updatedAt,
        },
        payment,
      },
      message: "Pagamento simulado com sucesso.",
    });
  }
}
