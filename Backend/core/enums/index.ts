export class WorkerRoles {
  static readonly BARISTA = "barista";
  static readonly CAIXA = "caixa";
  static readonly GERENTE = "gerente";
  static readonly ATENDENTE = "atendente";

  static readonly VALUES = [
    WorkerRoles.BARISTA,
    WorkerRoles.CAIXA,
    WorkerRoles.GERENTE,
    WorkerRoles.ATENDENTE,
  ] as const;

  static values() {
    return WorkerRoles.VALUES;
  }

  static isValid(role: string): role is (typeof WorkerRoles.VALUES)[number] {
    return (WorkerRoles.VALUES as readonly string[]).includes(role);
  }
}

export type WorkerRole = (typeof WorkerRoles.VALUES)[number];

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
    OrderStatus.CANCELADO,
  ] as const;

  static values() {
    return OrderStatus.VALUES;
  }

  static isValid(status: string): status is (typeof OrderStatus.VALUES)[number] {
    return (OrderStatus.VALUES as readonly string[]).includes(status);
  }
}

export type OrderStatusType = (typeof OrderStatus.VALUES)[number];

export class ProductCategory {
  static readonly CAFE = "cafe";
  static readonly CHA = "cha";
  static readonly SUCO = "suco";
  static readonly SMOOTHIE = "smoothie";
  static readonly LANCHE = "lanche";
  static readonly SOBREMESA = "sobremesa";
  static readonly OUTRO = "outro";

  static readonly VALUES = [
    ProductCategory.CAFE,
    ProductCategory.CHA,
    ProductCategory.SUCO,
    ProductCategory.SMOOTHIE,
    ProductCategory.LANCHE,
    ProductCategory.SOBREMESA,
    ProductCategory.OUTRO,
  ] as const;

  static values() {
    return ProductCategory.VALUES;
  }

  static isValid(category: string): category is (typeof ProductCategory.VALUES)[number] {
    return (ProductCategory.VALUES as readonly string[]).includes(category);
  }
}

export type ProductCategoryType = (typeof ProductCategory.VALUES)[number];

export class PaymentMethod {
  static readonly PIX = "pix";
  static readonly CARTAO_CREDITO = "cartao_credito";
  static readonly CARTAO_DEBITO = "cartao_debito";
  static readonly DINHEIRO = "dinheiro";

  static readonly VALUES = [
    PaymentMethod.PIX,
    PaymentMethod.CARTAO_CREDITO,
    PaymentMethod.CARTAO_DEBITO,
    PaymentMethod.DINHEIRO,
  ] as const;

  static values() {
    return PaymentMethod.VALUES;
  }

  static isValid(method: string): method is (typeof PaymentMethod.VALUES)[number] {
    return (PaymentMethod.VALUES as readonly string[]).includes(method);
  }
}

export type PaymentMethodType = (typeof PaymentMethod.VALUES)[number];

export class PaymentStatus {
  static readonly PENDENTE = "pendente";
  static readonly CONFIRMADO = "confirmado";
  static readonly RECUSADO = "recusado";
  static readonly ESTORNADO = "estornado";

  static readonly VALUES = [
    PaymentStatus.PENDENTE,
    PaymentStatus.CONFIRMADO,
    PaymentStatus.RECUSADO,
    PaymentStatus.ESTORNADO,
  ] as const;

  static values() {
    return PaymentStatus.VALUES;
  }

  static isValid(status: string): status is (typeof PaymentStatus.VALUES)[number] {
    return (PaymentStatus.VALUES as readonly string[]).includes(status);
  }
}

export type PaymentStatusType = (typeof PaymentStatus.VALUES)[number];

export class AttendanceStatus {
  static readonly PRESENTE = "presente";
  static readonly FALTA = "falta";
  static readonly FALTA_JUSTIFICADA = "falta_justificada";
  static readonly FOLGA = "folga";

  static readonly VALUES = [
    AttendanceStatus.PRESENTE,
    AttendanceStatus.FALTA,
    AttendanceStatus.FALTA_JUSTIFICADA,
    AttendanceStatus.FOLGA,
  ] as const;

  static values() {
    return AttendanceStatus.VALUES;
  }

  static isValid(status: string): status is (typeof AttendanceStatus.VALUES)[number] {
    return (AttendanceStatus.VALUES as readonly string[]).includes(status);
  }
}

export type AttendanceStatusType = (typeof AttendanceStatus.VALUES)[number];
