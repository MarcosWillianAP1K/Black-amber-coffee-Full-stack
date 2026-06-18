export class AuthType {
  static readonly CLIENT = "CLIENT";
  static readonly WORKER = "WORKER";

  static readonly VALUES = [AuthType.CLIENT, AuthType.WORKER] as const;

  static values() {
    return AuthType.VALUES;
  }

  static isValid(metod: string): metod is (typeof AuthType.VALUES)[number] {
    return AuthType.VALUES.includes(metod as any);
  }
}
