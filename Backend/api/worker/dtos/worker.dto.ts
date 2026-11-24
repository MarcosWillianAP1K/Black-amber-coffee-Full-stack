import type * as z from "zod";
import type { WorkerRole } from "../../../core/enums/index.js";
import type {
  RegisterWorkerSchema,
  UpdateWorkerSelfSchema,
  UpdateWorkerAdminSchema,
  ToggleWorkerStatusSchema,
} from "../validators/worker.validator.js";

export interface WorkerDTO {
  publicId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: WorkerRole;
  salary: number;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegisterWorkerInput = z.infer<typeof RegisterWorkerSchema>;
export type UpdateWorkerSelfInput = z.infer<typeof UpdateWorkerSelfSchema>;
export type UpdateWorkerAdminInput = z.infer<typeof UpdateWorkerAdminSchema>;
export type ToggleWorkerStatusInput = z.infer<typeof ToggleWorkerStatusSchema>;
