import { OrderStatus, type OrderStatusType } from "../../../core/enums/index.js";
import { SecurityUtils } from "../../../core/security/security.utils.js";
import { ProductModel } from "../../product/models/product.model.js";
import { UserModel } from "../../user/models/user.model.js";
import { WorkerModel } from "../../worker/models/worker.model.js";
import { OrderModel } from "../models/order.model.js";
import type { CreateOrderInput, OrderDTO } from "../dtos/order.dto.js";

const ALLOWED_TRANSITIONS: Record<OrderStatusType, readonly OrderStatusType[]> = {
  [OrderStatus.CRIADO]: [OrderStatus.EM_PREPARO, OrderStatus.CANCELADO],
  [OrderStatus.EM_PREPARO]: [OrderStatus.CRIADO, OrderStatus.PRONTO, OrderStatus.CANCELADO],
  [OrderStatus.PRONTO]: [OrderStatus.FINALIZADO, OrderStatus.CANCELADO],
  [OrderStatus.FINALIZADO]: [],
  [OrderStatus.CANCELADO]: [],
};

export class OrderService {
  static async listForWorker(workerPublicId: string, statusFilter?: string): Promise<OrderDTO[]> {
    const worker = await WorkerModel.findIdByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    if (statusFilter) {
      if (!OrderStatus.isValid(statusFilter)) throw new Error("INVALID_STATUS");
      return OrderModel.findAll(statusFilter);
    }

    return OrderModel.findAll();
  }

  static async listForUser(userPublicId: string): Promise<OrderDTO[]> {
    const clientId = await UserModel.findInternalIdByPublicId(userPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");
    return OrderModel.findByClientId(clientId);
  }

  static async getForWorker(publicId: string, workerPublicId: string): Promise<OrderDTO> {
    const worker = await WorkerModel.findIdByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    const order = await OrderModel.findByPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    return order;
  }

  static async createForUser(userPublicId: string, data: CreateOrderInput): Promise<OrderDTO> {
    const clientId = await UserModel.findInternalIdByPublicId(userPublicId);
    if (!clientId) throw new Error("USER_NOT_FOUND");

    let total = 0;
    const preparedItems: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
      observation?: string | null;
    }> = [];

    for (const item of data.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (!product.isActive) throw new Error("PRODUCT_INACTIVE");

      total += product.price * item.quantity;
      preparedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        observation: item.observation ?? null,
      });
    }

    return OrderModel.create({
      clientId,
      publicId: SecurityUtils.generatePublicId(),
      code: SecurityUtils.generateOrderCode(),
      totalAmount: total,
      status: OrderStatus.CRIADO,
      observation: data.observation ?? null,
      items: preparedItems,
      paymentMethod: data.paymentMethod ?? null,
    });
  }

  static async createForWorker(workerPublicId: string, data: CreateOrderInput): Promise<OrderDTO> {
    const worker = await WorkerModel.findIdByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    let clientId: number | null = null;
    if (data.clientPublicId) {
      clientId = await UserModel.findInternalIdByPublicId(data.clientPublicId);
      if (!clientId) throw new Error("CLIENT_NOT_FOUND");
    }

    let total = 0;
    const preparedItems: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
      observation?: string | null;
    }> = [];

    for (const item of data.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (!product.isActive) throw new Error("PRODUCT_INACTIVE");

      total += product.price * item.quantity;
      preparedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        observation: item.observation ?? null,
      });
    }

    return OrderModel.create({
      clientId,
      publicId: SecurityUtils.generatePublicId(),
      code: SecurityUtils.generateOrderCode(),
      totalAmount: total,
      status: OrderStatus.CRIADO,
      observation: data.observation ?? null,
      items: preparedItems,
      paymentMethod: data.paymentMethod ?? null,
      actorWorkerId: worker.id,
    });
  }

  static async updateStatusByWorker(
    publicId: string,
    workerPublicId: string,
    newStatus: OrderStatusType,
  ): Promise<OrderDTO> {
    if (!OrderStatus.isValid(newStatus)) throw new Error("INVALID_STATUS");

    const worker = await WorkerModel.findIdByPublicId(workerPublicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    if (!worker.isActive) throw new Error("WORKER_INACTIVE");

    const order = await OrderModel.findByPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status === newStatus) return order;

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const updated = await OrderModel.updateStatus(publicId, order.status, newStatus, worker.id);
    if (!updated) throw new Error("ORDER_NOT_FOUND");
    return updated;
  }

  static async cancel(
    publicId: string,
    actor: { publicId: string; isWorkerOrAdmin: boolean },
  ): Promise<OrderDTO> {
    const order = await OrderModel.findByPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (!actor.isWorkerOrAdmin) {
      const clientId = await UserModel.findInternalIdByPublicId(actor.publicId);
      if (!clientId || order.clientId !== clientId) {
        throw new Error("FORBIDDEN");
      }
    }

    if (order.status === OrderStatus.CANCELADO) {
      throw new Error("ORDER_ALREADY_CANCELLED");
    }

    const updated = await OrderModel.cancel(publicId, order.status);
    if (!updated) throw new Error("ORDER_NOT_FOUND");
    return updated;
  }

  static async deleteByPublicId(publicId: string): Promise<void> {
    const deleted = await OrderModel.deleteByPublicId(publicId);
    if (!deleted) throw new Error("ORDER_NOT_FOUND");
  }
}
