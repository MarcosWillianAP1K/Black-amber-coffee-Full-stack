import WorkerRepository from "@/modules/worker/worker.repository";
import OrderRepository from "@/modules/order/order.repository";
import OrderHistoryRepository from "@/modules/order/history/orderHistory.repository";
import ProductRepository from "@/modules/product/product.repository";
import authRepository from "@/modules/auth/auth.repository";
import { db } from "@/config/database";
import { generateId } from "@/core/gereteId";
import SecurityUtils from "@/core/security";
import WorkerModel from "@/modules/worker/worker.model";
import { workers, workerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  RegisterWorkerInput,
  UpdateWorkerInput,
  RegisterWorkerResponse,
  registerWorkerResponseSchema,
  UpdateWorkerResponse,
  updateWorkerResponseSchema,
  GetWorkerResponse,
  getWorkerResponseSchema,
  Worker,
  workerResponseSchema,
} from "./admin.shemas";
import { OrderStatus } from "@/core/enuns/orederStatus";

export default class AdminService {
  private workerRepository: WorkerRepository;
  private orderRepository: OrderRepository;
  private orderHistoryRepository: OrderHistoryRepository;
  private productRepository: ProductRepository;
  private authRepo: authRepository;

  constructor(
    workerRepository: WorkerRepository,
    orderRepository: OrderRepository,
    orderHistoryRepository: OrderHistoryRepository,
    productRepository: ProductRepository,
    authRepo: authRepository,
  ) {
    this.workerRepository = workerRepository;
    this.orderRepository = orderRepository;
    this.orderHistoryRepository = orderHistoryRepository;
    this.productRepository = productRepository;
    this.authRepo = authRepo;
  }

  // ============================================================
  // Worker Management
  // ============================================================

  async registerWorker(data: RegisterWorkerInput): Promise<RegisterWorkerResponse> {
    const existingWorker = await this.authRepo.getByEmail(data.email);
    if (existingWorker) {
      throw new Error("EMAIL_ALREADY_IN_USE");
    }

    const hashedPassword = await SecurityUtils.hashPassword(data.password);
    const publicId = generateId();
    const now = new Date();

    const result = await db.transaction(async (tx) => {
      const [insertedWorker] = await tx
        .insert(workers)
        .values({
          publicId,
          role: data.role,
          salary: String(data.salary),
          isActive: true,
          isAdmin: data.role === "ADMIN",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const [insertedProfile] = await tx
        .insert(workerProfiles)
        .values({
          workerId: insertedWorker.id,
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone ?? null,
          avatarImage: null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return { worker: insertedWorker, profile: insertedProfile };
    });

    return registerWorkerResponseSchema.parse({
      data: {
        publicId: result.worker.publicId,
        email: result.profile.email,
        role: result.worker.role,
        salary: Number(result.worker.salary),
        createdAt: result.worker.createdAt.toISOString(),
        updatedAt: result.worker.updatedAt.toISOString(),
        profile: {
          fullName: result.profile.fullName,
          phone: result.profile.phone,
          avatarImage: result.profile.avatarImage,
          email: result.profile.email,
          createdAt: result.profile.createdAt.toISOString(),
          updatedAt: result.profile.updatedAt.toISOString(),
        },
      },
    });
  }

  async getAllWorkers(): Promise<Worker[]> {
    const workersList = await this.workerRepository.getAll();
    return workersList.map((worker) =>
      workerResponseSchema.parse({
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
      }),
    );
  }

  async getWorker(publicId: string): Promise<GetWorkerResponse> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");

    return getWorkerResponseSchema.parse({
      data: {
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
      },
    });
  }

  async updateWorker(
    publicId: string,
    data: UpdateWorkerInput,
  ): Promise<UpdateWorkerResponse> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await SecurityUtils.hashPassword(data.password);
    }

    const result = await db.transaction(async (tx) => {
      if (data.role !== undefined || data.salary !== undefined) {
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.role !== undefined) {
          updateData.role = data.role;
          updateData.isAdmin = data.role === "ADMIN";
        }
        if (data.salary !== undefined) updateData.salary = String(data.salary);

        await tx
          .update(workers)
          .set(updateData)
          .where(eq(workers.publicId, publicId));
      }

      const profileUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (data.fullName !== undefined) profileUpdate.fullName = data.fullName;
      if (data.email !== undefined) profileUpdate.email = data.email;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (hashedPassword !== undefined) profileUpdate.password = hashedPassword;

      if (Object.keys(profileUpdate).length > 1) {
        await tx
          .update(workerProfiles)
          .set(profileUpdate)
          .where(eq(workerProfiles.workerId, worker.id));
      }

      const [updatedWorker] = await tx
        .select()
        .from(workers)
        .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId))
        .where(eq(workers.publicId, publicId))
        .limit(1);

      return updatedWorker;
    });

    if (!result) throw new Error("WORKER_NOT_FOUND");

    const updatedModel = WorkerModel.fromDatabase(
      result.workers,
      result.worker_profiles,
    );

    return updateWorkerResponseSchema.parse({
      data: {
        publicId: updatedModel.publicId,
        role: updatedModel.role,
        salary: updatedModel.salary,
        isActive: updatedModel.isActive,
        profile: {
          fullName: updatedModel.profile.fullName,
          phone: updatedModel.profile.phone,
          avatarImage: updatedModel.profile.avatarImage,
          email: updatedModel.profile.email,
          createdAt: updatedModel.profile.createdAt,
          updatedAt: updatedModel.profile.updatedAt,
        },
        createdAt: updatedModel.createdAt,
        updatedAt: updatedModel.updatedAt,
      },
      message: "Worker updated successfully",
    });
  }

  async deleteWorker(publicId: string): Promise<void> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    await this.workerRepository.deleteByPublicId(publicId);
  }

  // ============================================================
  // Order Management
  // ============================================================

  async getAllOrders() {
    return this.orderRepository.getAll();
  }

  async getOrderByPublicId(publicId: string) {
    const order = await this.orderRepository.getbyPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    return order;
  }

  async cancelOrder(publicId: string) {
    const order = await this.orderRepository.getbyPublicId(publicId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error("ORDER_ALREADY_CANCELLED");
    }

    const updated = await this.orderRepository.cancelOrder(publicId);
    if (updated) {
      await this.orderHistoryRepository.add(
        updated.id,
        "ADMIN",
        order.status,
        OrderStatus.CANCELLED,
      );
    }

    return updated;
  }
}
