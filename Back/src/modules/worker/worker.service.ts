import WorkerRepository from "./worker.repository";
import WorkerModel from "./worker.model";
import {
  WorkerUpdateInput,
  Worker,
  WorkerResponseSchema,
  WorkerUpdateInputSchema,
} from "./worker.schema";
import SecurityUtils from "@/core/security";

export default class WorkerService {
  private workerRepository: WorkerRepository;

  constructor(workerRepository: WorkerRepository) {
    this.workerRepository = workerRepository;
  }

  async getByPublicId(publicId: string): Promise<Worker> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }

    return WorkerResponseSchema.parse({
      publicId: worker.publicId,
      role: worker.role,
      salary: worker.salary,
      isActive: worker.isActive,
      profile: {
        fullName: worker.profile.fullName,
        phone: worker.profile.phone,
        avatarImage: worker.profile.avatarImage,
        email: worker.profile.email,
        createdAt: worker.profile.createdAt,
        updatedAt: worker.profile.updatedAt,
      },
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    });
  }

  async getById(id: number): Promise<Worker> {
    const worker = await this.workerRepository.getById(id);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }

    return WorkerResponseSchema.parse({
      publicId: worker.publicId,
      role: worker.role,
      salary: worker.salary,
      isActive: worker.isActive,
      profile: {
        fullName: worker.profile.fullName,
        phone: worker.profile.phone,
        avatarImage: worker.profile.avatarImage,
        email: worker.profile.email,
        createdAt: worker.profile.createdAt,
        updatedAt: worker.profile.updatedAt,
      },
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    });
  }

  async update(publicId: string, data: WorkerUpdateInput): Promise<Worker> {
    const validatedData = WorkerUpdateInputSchema.parse(data);

    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }

    let password = worker.profile.password;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    const updatedWorker = new WorkerModel(
      worker.id,
      worker.publicId,
      worker.role,
      worker.salary,
      worker.isActive,
      worker.createdAt,
      worker.updatedAt,
      {
        fullName: validatedData.fullName ?? worker.profile.fullName,
        email: validatedData.email ?? worker.profile.email,
        phone: validatedData.phone ?? worker.profile.phone,
        avatarImage: worker.profile.avatarImage,
        password,
        createdAt: worker.profile.createdAt,
        updatedAt: new Date().toISOString(),
      },
    );

    const result = await this.workerRepository.updateProfile(updatedWorker);

    return WorkerResponseSchema.parse({
      publicId: result.publicId,
      role: result.role,
      salary: result.salary,
      isActive: result.isActive,
      profile: {
        fullName: result.profile.fullName,
        phone: result.profile.phone,
        avatarImage: result.profile.avatarImage,
        email: result.profile.email,
        createdAt: result.profile.createdAt,
        updatedAt: result.profile.updatedAt,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(publicId: string): Promise<void> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }
    await this.workerRepository.deleteByPublicId(publicId);
  }
}
