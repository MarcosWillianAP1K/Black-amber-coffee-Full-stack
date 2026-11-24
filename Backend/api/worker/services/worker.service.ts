import { SecurityUtils } from "../../../core/security/security.utils.js";
import { imageService } from "../../../core/storage/image.service.js";
import { r2StorageProvider } from "../../../core/storage/bucket.provider.js";
import { AuthModel } from "../../auth/models/auth.model.js";
import { WorkerModel } from "../models/worker.model.js";
import type {
  RegisterWorkerInput,
  UpdateWorkerAdminInput,
  UpdateWorkerSelfInput,
  WorkerDTO,
} from "../dtos/worker.dto.js";

export class WorkerService {
  static async listAll(): Promise<WorkerDTO[]> {
    return WorkerModel.findAll();
  }

  static async getByPublicId(publicId: string): Promise<WorkerDTO> {
    const worker = await WorkerModel.findByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    return worker;
  }

  static async create(data: RegisterWorkerInput): Promise<WorkerDTO> {
    const existing = await AuthModel.findByEmail(data.email);
    if (existing) throw new Error("EMAIL_ALREADY_IN_USE");

    const hashedPassword = await SecurityUtils.hashPassword(data.password);

    return WorkerModel.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone ?? null,
      role: data.role,
      salary: data.salary,
      isAdmin: data.role === "gerente",
    });
  }

  static async updateSelf(
    publicId: string,
    data: UpdateWorkerSelfInput,
    avatarBuffer?: Buffer,
  ): Promise<WorkerDTO> {
    const current = await WorkerModel.findByPublicId(publicId);
    if (!current) throw new Error("WORKER_NOT_FOUND");

    if (!avatarBuffer && Object.keys(data).length === 0) {
      throw new Error("INVALID_REQUEST");
    }

    let avatarUrl: string | undefined;
    if (avatarBuffer) {
      const processed = await imageService.processAvatar(avatarBuffer);
      const key = imageService.generateAvatarKey("workers", publicId);
      const uploaded = await r2StorageProvider.upload({
        key,
        body: processed.large,
        contentType: processed.contentType,
      });
      if (current.avatarUrl) {
        await r2StorageProvider.delete(current.avatarUrl).catch(() => undefined);
      }
      avatarUrl = uploaded.url;
    }

    const hashedPassword = data.password
      ? await SecurityUtils.hashPassword(data.password)
      : undefined;

    const updated = await WorkerModel.updateByPublicId(publicId, {
      fullName: data.fullName ?? data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      avatarUrl,
    });

    if (!updated) throw new Error("WORKER_NOT_FOUND");
    return updated;
  }

  static async updateAdmin(publicId: string, data: UpdateWorkerAdminInput): Promise<WorkerDTO> {
    const current = await WorkerModel.findByPublicId(publicId);
    if (!current) throw new Error("WORKER_NOT_FOUND");

    const hashedPassword = data.password
      ? await SecurityUtils.hashPassword(data.password)
      : undefined;

    const updated = await WorkerModel.updateByPublicId(publicId, {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      isAdmin: data.role !== undefined ? data.role === "gerente" : undefined,
      salary: data.salary,
      isActive: data.isActive,
    });

    if (!updated) throw new Error("WORKER_NOT_FOUND");
    return updated;
  }

  static async toggleStatus(publicId: string, explicitStatus?: boolean): Promise<WorkerDTO> {
    const current = await WorkerModel.findByPublicId(publicId);
    if (!current) throw new Error("WORKER_NOT_FOUND");

    const nextStatus = explicitStatus !== undefined ? explicitStatus : !current.isActive;
    const updated = await WorkerModel.updateByPublicId(publicId, { isActive: nextStatus });

    if (!updated) throw new Error("WORKER_NOT_FOUND");
    return updated;
  }

  static async deleteByPublicId(publicId: string): Promise<void> {
    const deleted = await WorkerModel.deleteByPublicId(publicId);
    if (!deleted) throw new Error("WORKER_NOT_FOUND");
  }
}
