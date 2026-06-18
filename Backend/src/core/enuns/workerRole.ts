export class WorkerRoles {
  static readonly ADMIN = "ADMIN";
  static readonly BARMAN = "BARMAN";
  static readonly BARISTA = "BARISTA";
  static readonly WAITER = "WAITER";

  static readonly VALUES = [
    WorkerRoles.ADMIN,
    WorkerRoles.BARISTA,
    WorkerRoles.BARMAN,
    WorkerRoles.WAITER
  ] as const;

  static values (){
    return WorkerRoles.VALUES;
  }

  static isValid (role: string): role is typeof WorkerRoles.VALUES[number]{
    return WorkerRoles.VALUES.includes(role as any);
  }
}

export type WorkerRole = typeof WorkerRoles.VALUES[number];