export class WorkerRoles {
  static readonly BARISTA = "barista";
  static readonly CAIXA = "caixa";
  static readonly GERENTE = "gerente";
  static readonly ATENDENTE = "atendente";

  static readonly VALUES = [
    WorkerRoles.BARISTA,
    WorkerRoles.CAIXA,
    WorkerRoles.GERENTE,
    WorkerRoles.ATENDENTE
  ] as const;

  static values (){
    return WorkerRoles.VALUES;
  }

  static isValid (role: string): role is typeof WorkerRoles.VALUES[number]{
    return WorkerRoles.VALUES.includes(role as any);
  }
}

export type WorkerRole = typeof WorkerRoles.VALUES[number];