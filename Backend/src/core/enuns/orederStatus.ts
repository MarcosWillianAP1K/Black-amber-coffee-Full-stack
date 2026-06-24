export class OrderStatus {

  static readonly CRIADO = "criado";
  static readonly EM_PREPARO = "em_preparo";
  static readonly PRONTO = "pronto";
  static readonly FINALIZADO = "finalizado";
  static readonly CANCELADO = "cancelado";

  static readonly VALUES = [
    OrderStatus.CRIADO,
    OrderStatus.EM_PREPARO,
    OrderStatus.PRONTO,
    OrderStatus.FINALIZADO,
    OrderStatus.CANCELADO
  ] as const;

  static values() {
    return OrderStatus.VALUES;
  }

  static isValid (status: string): status is typeof OrderStatus.VALUES[number]{
    return OrderStatus.VALUES.includes(status as any)
  }
  
}

export type OrderStatusType =
  ReturnType<typeof OrderStatus.values>[number];