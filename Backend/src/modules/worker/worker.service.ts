import WorkerRepository from "./worker.repository";
import WorkerModel from "./worker.model";
import { r2StorageProvider, imageService } from "@/infra/storage";
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

  private serializeWorker(worker: WorkerModel): Worker {
    return WorkerResponseSchema.parse({
      publicId: worker.publicId,
      email: worker.email,
      fullName: worker.fullName,
      phone: worker.phone,
      avatarUrl: worker.avatarUrl,
      role: worker.role,
      salary: worker.salary,
      isAdmin: worker.isAdmin,
      isActive: worker.isActive,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    });
  }

  async getByPublicId(publicId: string): Promise<Worker> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }
    return this.serializeWorker(worker);
  }

  async getById(id: number): Promise<Worker> {
    const worker = await this.workerRepository.getById(id);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }
    return this.serializeWorker(worker);
  }

  async update(publicId: string, data: WorkerUpdateInput): Promise<Worker> {
    const validatedData = WorkerUpdateInputSchema.parse(data);

    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }

    let avatarUrlUpdate: string | null = worker.avatarUrl;

    if (validatedData.avatarBuffer) {
      const processedImages = await imageService.processAvatar(
        validatedData.avatarBuffer,
      );
      const keys = imageService.generateAvatarKeys(publicId);

      await r2StorageProvider.upload({
        key: keys.large,
        body: processedImages.large,
        contentType: processedImages.contentType,
      });

      avatarUrlUpdate = keys.large;
    }

    let password = undefined;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    const updatedWorker = new WorkerModel(
      worker.id,
      worker.publicId,
      validatedData.email ?? worker.email,
      validatedData.fullName ?? worker.fullName,
      validatedData.phone ?? worker.phone,
      avatarUrlUpdate,
      worker.role,
      worker.salary,
      worker.isAdmin,
      worker.isActive,
      worker.createdAt,
      new Date().toISOString(),
    );

    const result = await this.workerRepository.update(updatedWorker, password);
    return this.serializeWorker(result);
  }

  async delete(publicId: string): Promise<void> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) {
      throw new Error("WORKER_NOT_FOUND");
    }
    await this.workerRepository.deleteByPublicId(publicId);
  }
}
