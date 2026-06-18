export class PaymentMethod {
  static readonly CASH = "CASH";
  static readonly CARD = "CARD";
  static readonly PIX = "PIX";

  static readonly VALUES = [
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.PIX
  ] as const;

  static values() {
    return PaymentMethod.VALUES;
  }

  static isValid(metod: string): metod is typeof PaymentMethod.VALUES[number] {
    return PaymentMethod.VALUES.includes(metod as any);
  }
}

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];