export class PaymentMethod {
  static readonly PIX = "pix";
  static readonly CARTAO_CREDITO = "cartao_credito";
  static readonly CARTAO_DEBITO = "cartao_debito";
  static readonly DINHEIRO = "dinheiro";

  static readonly VALUES = [
    PaymentMethod.PIX,
    PaymentMethod.CARTAO_CREDITO,
    PaymentMethod.CARTAO_DEBITO,
    PaymentMethod.DINHEIRO
  ] as const;

  static values() {
    return PaymentMethod.VALUES;
  }

  static isValid(method: string): method is typeof PaymentMethod.VALUES[number] {
    return PaymentMethod.VALUES.includes(method as any);
  }
}

export type PaymentMethodType =
  (typeof PaymentMethod.VALUES)[number];

export class PaymentStatus {
  static readonly PENDENTE = "pendente";
  static readonly CONFIRMADO = "confirmado";
  static readonly RECUSADO = "recusado";
  static readonly ESTORNADO = "estornado";

  static readonly VALUES = [
    PaymentStatus.PENDENTE,
    PaymentStatus.CONFIRMADO,
    PaymentStatus.RECUSADO,
    PaymentStatus.ESTORNADO
  ] as const;

  static values() {
    return PaymentStatus.VALUES;
  }

  static isValid(status: string): status is typeof PaymentStatus.VALUES[number] {
    return PaymentStatus.VALUES.includes(status as any);
  }
}

export type PaymentStatusType =
  (typeof PaymentStatus.VALUES)[number];