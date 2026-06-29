import { OrderStatusType } from "../../core/enuns/orederStatus";
import { PaymentMethodType } from "../../core/enuns/payment.types";

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  observation: string | null;
}

export default class OrderModel {
  id: number;
  publicId: string;
  code: string;
  clientId: number | null;
  updatedBy: number | null;
  status: OrderStatusType;
  totalPrice: number;
  paymentMethod: PaymentMethodType | null;
  observation: string | null;
  itens: Item[];
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    publicId: string,
    code: string,
    clientId: number | null,
    updatedBy: number | null,
    status: OrderStatusType,
    totalPrice: number,
    paymentMethod: PaymentMethodType | null,
    observation: string | null,
    itens: Item[],
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.code = code;
    this.clientId = clientId;
    this.updatedBy = updatedBy;
    this.status = status;
    this.totalPrice = totalPrice;
    this.paymentMethod = paymentMethod;
    this.observation = observation;
    this.itens = itens;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(order: any, itens?: Item[]): OrderModel {
    return new OrderModel(
      order.id,
      order.publicId,
      order.code,
      order.clientId ?? null,
      order.updatedBy ?? null,
      order.status,
      Number(order.totalAmount ?? order.totalPrice ?? 0),
      order.paymentMethod ?? null,
      order.observation ?? null,
      (itens || order.itens || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        observation: item.observation ?? null,
      })),
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : String(order.createdAt),
      order.updatedAt instanceof Date
        ? order.updatedAt.toISOString()
        : String(order.updatedAt),
    );
  }
}
