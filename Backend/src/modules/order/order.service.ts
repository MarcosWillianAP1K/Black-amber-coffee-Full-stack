import OrderRepository from "./order.repository";
import WorkerRepository from "@/modules/worker/worker.repository";
import OrderHistoryRepository from "./history/orderHistory.repository";
import OrderModel from "./order.model";
import { OrderStatus, OrderStatusType } from "@/core/enuns/orederStatus";
import UserRepository from "@/modules/user/user.repository";
import ProductRepository from "@/modules/product/product.repository";
import { generateId } from "@/core/gereteId";
import { generateOrderCode } from "@/shared/utils/code.gerator";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  CreateOrderResponseSchema,
  GetOrdersByStatusRequest,
  GetOrdersByStatusResponse,
  GetOrdersByStatusResponseSchema,
  orderSchema,
  UpdateOrderStatusRequest,
} from "./order.schema";

export default class OrderService {
  private orderRepository: OrderRepository;
  private workerRepository: WorkerRepository;
  private orderHistoryRepository: OrderHistoryRepository;
  private userRepository: UserRepository;
  private productRepository: ProductRepository;

  constructor(
    orderRepository: OrderRepository,
    workerRepository: WorkerRepository,
    orderHistoryRepository: OrderHistoryRepository,
    userRepository: UserRepository,
    productRepository: ProductRepository,
  ) {
    this.orderRepository = orderRepository;
    this.workerRepository = workerRepository;
    this.orderHistoryRepository = orderHistoryRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
  }

  async createForUser(
    userPublicId: string,
    data: CreateOrderRequest,
  ): Promise<CreateOrderResponse> {
    const user = await this.userRepository.getByPublicId(userPublicId);
    if (!user) throw new Error("USER_NOT_FOUND");

    let total = 0;
    const itemsWithPrice: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      observation?: string | null;
    }> = [];

    for (const it of data.items) {
      const product = await this.productRepository.getById(it.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const unitPrice = String(product.price);
      total += Number(product.price) * it.quantity;
      itemsWithPrice.push({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice,
        observation: it.observation ?? null,
      });
    }

    const publicId = generateId();
    const code = generateOrderCode();

    const created = await this.orderRepository.create(
      user.id,
      publicId,
      code,
      String(total),
      OrderStatus.PENDING,
      data.observation ?? null,
      itemsWithPrice,
      data.paymentMethod ?? null,
    );

    await this.orderHistoryRepository.add(
      created.id,
      userPublicId,
      OrderStatus.PENDING,
      OrderStatus.PENDING,
    );

    return CreateOrderResponseSchema.parse({
      data: {
        id: created.id,
        publicId: created.publicId,
        code: created.code,
        status: created.status,
        totalPrice: created.totalPrice,
        paymentMethod: created.paymentMethod,
        itens: created.itens,
        observation: created.observation,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  }

  async cancelOrder(publicId: string): Promise<OrderModel | null> {
    const order = await this.orderRepository.getbyPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status === OrderStatus.CANCELLED)
      throw new Error("ORDER_ALREADY_CANCELLED");

    const updated = await this.orderRepository.cancelOrder(publicId);
    if (updated) {
      await this.orderHistoryRepository.add(
        updated.id,
        "SYSTEM",
        order.status,
        OrderStatus.CANCELLED,
      );
    }

    return updated;
  }

  async getByStatus(
    data: GetOrdersByStatusRequest,
  ): Promise<GetOrdersByStatusResponse> {
    const orders = await this.orderRepository.getbyStatus(data.status);

    return GetOrdersByStatusResponseSchema.parse({
      data: orders.map((order) => ({
        id: order.id,
        publicId: order.publicId,
        code: order.code,
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        itens: order.itens,
        observation: order.observation,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  }

  async getForWorker(
    publicId: string,
    workerPublicId: string,
  ): Promise<OrderModel> {
    const worker = await this.workerRepository.getByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    const order = await this.orderRepository.getbyPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    return order;
  }

  async updateStatusByWorker(
    publicId: string,
    workerPublicId: string,
    status: UpdateOrderStatusRequest,
  ): Promise<OrderModel | null> {
    const newStatus = status.status;
    if (!OrderStatus.isValid(newStatus)) throw new Error("INVALID_STATUS");

    const worker = await this.workerRepository.getByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    const order = await this.orderRepository.getbyPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const allowed: Record<string, string[]> = {
      PENDING: ["IN PROGRESS", "CANCELLED"],
      "IN PROGRESS": ["COMPLETED", "LATE"],
      COMPLETED: [],
      LATE: ["COMPLETED"],
      CANCELLED: [],
    };

    const from = order.status;
    if (from === newStatus) return order;

    const allowedTo = allowed[from] ?? [];
    if (!allowedTo.includes(newStatus))
      throw new Error("INVALID_STATUS_TRANSITION");

    const updated = await this.orderRepository.updateStatus(publicId, newStatus);
    if (updated) {
      await this.orderHistoryRepository.add(
        updated.id,
        workerPublicId,
        from,
        newStatus,
      );
    }

    return updated;
  }
  ///Get all by worker
  async getAll(workerPublicId: string): Promise<OrderModel[]> {
    const user = await this.workerRepository.getByPublicId(workerPublicId);
    if (!user) throw new Error("WORKER_NOT_FOUND");

    return this.orderRepository.getAll();
  }
}
