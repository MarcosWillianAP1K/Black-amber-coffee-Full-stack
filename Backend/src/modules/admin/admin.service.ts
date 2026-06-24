import WorkerRepository from "@/modules/worker/worker.repository";
import OrderRepository from "@/modules/order/order.repository";
import OrderHistoryRepository from "@/modules/order/history/orderHistory.repository";
import ProductRepository from "@/modules/product/product.repository";
import authRepository from "@/modules/auth/auth.repository";
import { db } from "@/config/database";
import SecurityUtils from "@/core/security";
import WorkerModel from "@/modules/worker/worker.model";
import { workers } from "@/db/schema";
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
import UserRepository from "@/modules/user/user.repository";
import UserModel from "@/modules/user/user.model";
import * as z from "zod";

// Client response schema — flat structure matching UserModel
const clientResponseSchema = z.object({
  publicId: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

export type ClientAdmin = z.infer<typeof clientResponseSchema>;

export default class AdminService {
  private workerRepository: WorkerRepository;
  private orderRepository: OrderRepository;
  private orderHistoryRepository: OrderHistoryRepository;
  private productRepository: ProductRepository;
  private authRepo: authRepository;
  private userRepository: UserRepository;

  constructor(
    workerRepository: WorkerRepository,
    orderRepository: OrderRepository,
    orderHistoryRepository: OrderHistoryRepository,
    productRepository: ProductRepository,
    authRepo: authRepository,
    userRepository?: UserRepository,
  ) {
    this.workerRepository = workerRepository;
    this.orderRepository = orderRepository;
    this.orderHistoryRepository = orderHistoryRepository;
    this.productRepository = productRepository;
    this.authRepo = authRepo;
    this.userRepository = userRepository ?? new UserRepository(db);
  }

  // ============================================================
  // Worker Management
  // ============================================================

  private serializeWorker(worker: WorkerModel): Worker {
    return workerResponseSchema.parse({
      publicId: worker.publicId,
      email: worker.email,
      fullName: worker.fullName,
      phone: worker.phone,
      avatarUrl: worker.avatarUrl,
      role: worker.role,
      salary: worker.salary,
      isActive: worker.isActive,
      isAdmin: worker.isAdmin,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    });
  }

  async registerWorker(data: RegisterWorkerInput): Promise<RegisterWorkerResponse> {
    const existingWorker = await this.authRepo.getByEmail(data.email);
    if (existingWorker) {
      throw new Error("EMAIL_ALREADY_IN_USE");
    }

    const hashedPassword = await SecurityUtils.hashPassword(data.password);
    const now = new Date();

    const [insertedWorker] = await db
      .insert(workers)
      .values({
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone ?? null,
        avatarUrl: null,
        role: data.role,
        salary: String(data.salary),
        isActive: true,
        isAdmin: data.role === "gerente",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const workerModel = WorkerModel.fromDatabase(insertedWorker);

    return registerWorkerResponseSchema.parse({
      data: this.serializeWorker(workerModel),
    });
  }

  async getAllWorkers(): Promise<Worker[]> {
    const workersList = await this.workerRepository.getAll();
    return workersList.map((worker) => this.serializeWorker(worker));
  }

  async getWorker(publicId: string): Promise<GetWorkerResponse> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");

    return getWorkerResponseSchema.parse({
      data: this.serializeWorker(worker),
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

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (hashedPassword !== undefined) updateData.password = hashedPassword;
    if (data.role !== undefined) {
      updateData.role = data.role;
      updateData.isAdmin = data.role === "gerente";
    }
    if (data.salary !== undefined) updateData.salary = String(data.salary);

    const [updatedRow] = await db
      .update(workers)
      .set(updateData)
      .where(eq(workers.publicId, publicId))
      .returning();

    if (!updatedRow) throw new Error("WORKER_NOT_FOUND");

    const updatedModel = WorkerModel.fromDatabase(updatedRow);

    return updateWorkerResponseSchema.parse({
      data: this.serializeWorker(updatedModel),
      message: "Worker updated successfully",
    });
  }

  async deleteWorker(publicId: string): Promise<void> {
    const worker = await this.workerRepository.getByPublicId(publicId);
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    await this.workerRepository.deleteByPublicId(publicId);
  }

  // ============================================================
  // Client Management (Admin)
  // ============================================================

  private serializeClient(client: UserModel): ClientAdmin {
    return clientResponseSchema.parse({
      publicId: client.publicId,
      email: client.email,
      fullName: client.fullName,
      phone: client.phone,
      avatarUrl: client.avatarUrl,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  }

  async getAllClients(): Promise<ClientAdmin[]> {
    const clients = await this.userRepository.getAll();
    return clients.map((client) => this.serializeClient(client));
  }

  async getClient(publicId: string): Promise<ClientAdmin> {
    const client = await this.userRepository.getByPublicId(publicId);
    if (!client) throw new Error("CLIENT_NOT_FOUND");
    return this.serializeClient(client);
  }

  async updateClient(
    publicId: string,
    data: { fullName?: string; phone?: string },
  ): Promise<ClientAdmin> {
    const client = await this.userRepository.getByPublicId(publicId);
    if (!client) throw new Error("CLIENT_NOT_FOUND");

    const updatedClient = new UserModel(
      client.id,
      client.publicId,
      client.email,
      data.fullName ?? client.fullName,
      data.phone ?? client.phone,
      client.avatarUrl,
      client.isActive,
      client.createdAt,
      new Date().toISOString(),
    );

    const result = await this.userRepository.update(updatedClient);
    return this.serializeClient(result);
  }

  async deleteClient(publicId: string): Promise<void> {
    const client = await this.userRepository.getByPublicId(publicId);
    if (!client) throw new Error("CLIENT_NOT_FOUND");
    await this.userRepository.deleteByPublicId(publicId);
  }
}
