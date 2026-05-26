import * as z from "zod";
import { WorkerRoles } from "@/core/enuns/workerRole";

export const WorkerProfileSchema = z.object({
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarImage: z.string().nullable(),
  email: z.email(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkerResponseSchema = z.object({
  publicId: z.string(),
  role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }),
  salary: z.number(),
  isActive: z.boolean(),
  profile: WorkerProfileSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkerUpdateInputSchema = z
  .object({
    fullName: z.string().min(1, "Full name must not be empty").optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().min(1, "Phone must not be empty").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );

export const GetWorkerResponseSchema = z.object({
  data: WorkerResponseSchema,
});

export const UpdateWorkerResponseSchema = z.object({
  data: WorkerResponseSchema,
  message: z.string().optional(),
});

export type WorkerProfile = z.infer<typeof WorkerProfileSchema>;
export type Worker = z.infer<typeof WorkerResponseSchema>;
export type WorkerUpdateInput = z.infer<typeof WorkerUpdateInputSchema>;
export type GetWorkerResponse = z.infer<typeof GetWorkerResponseSchema>;
export type UpdateWorkerResponse = z.infer<typeof UpdateWorkerResponseSchema>;
