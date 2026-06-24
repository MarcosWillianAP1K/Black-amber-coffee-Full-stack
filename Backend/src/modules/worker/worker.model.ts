export default class WorkerModel {
  id: number;
  publicId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  salary: number;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    publicId: string,
    email: string,
    fullName: string,
    phone: string | null,
    avatarUrl: string | null,
    role: string,
    salary: number,
    isAdmin: boolean,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.email = email;
    this.fullName = fullName;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.role = role;
    this.salary = salary;
    this.isAdmin = isAdmin;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(worker: any): WorkerModel {
    return new WorkerModel(
      worker.id,
      worker.publicId,
      worker.email ?? "",
      worker.fullName ?? "",
      worker.phone ?? null,
      worker.avatarUrl ?? null,
      worker.role,
      Number(worker.salary),
      worker.isAdmin,
      worker.isActive,
      worker.createdAt instanceof Date ? worker.createdAt.toISOString() : String(worker.createdAt),
      worker.updatedAt instanceof Date ? worker.updatedAt.toISOString() : String(worker.updatedAt),
    );
  }
}
