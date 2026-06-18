interface WorkerProfile {
  fullName: string;
  email: string;
  phone: string | null;
  avatarImage: string | null;
  avatarBuffer?: Buffer | null;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export default class WorkerModel {
  id: number;
  publicId: string;
  role: string;
  salary: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: WorkerProfile;

  constructor(
    id: number,
    publicId: string,
    role: string,
    salary: number,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    profile: WorkerProfile,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.role = role;
    this.salary = salary;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.profile = profile;
  }

  static fromDatabase(worker: any, profile: any): WorkerModel {
    return new WorkerModel(
      worker.id,
      worker.publicId,
      worker.role,
      Number(worker.salary),
      worker.isActive,
      worker.createdAt.toISOString(),
      worker.updatedAt.toISOString(),
      {
        fullName: profile?.fullName ?? "",
        phone: profile?.phone ?? null,
        avatarImage: profile?.avatarImage ?? null,
        email: profile?.email ?? "",
        createdAt: profile?.createdAt?.toISOString() ?? worker.createdAt.toISOString(),
        updatedAt: profile?.updatedAt?.toISOString() ?? worker.updatedAt.toISOString(),
      },
    );
  }
}
