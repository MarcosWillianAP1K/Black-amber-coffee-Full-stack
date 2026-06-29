import * as z from "zod";
import { WorkerRoles } from "../../core/enuns/workerRole";

export const WorkerResponseSchema = z.object({
  publicId: z.string(),
  email: z.email(),
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }),
  salary: z.number(),
  isAdmin: z.boolean(),
  isActive: z.boolean(),
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
    avatarBuffer: z.instanceof(Buffer).nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );

export const WorkerUpdateRequestSchema = z
  .object({
    name: z.string().min(1, "Full name must not be empty").optional(),
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

export const WorkerLoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const GetWorkerResponseSchema = z.object({
  data: WorkerResponseSchema,
});

export const UpdateWorkerResponseSchema = z.object({
  data: WorkerResponseSchema,
  message: z.string().optional(),
});

export const WorkerLoginResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      publicId: z.string(),
      role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }),
      email: z.email(),
      fullName: z.string(),
    }),
  }),
});

export type Worker = z.infer<typeof WorkerResponseSchema>;
export type WorkerUpdateInput = z.infer<typeof WorkerUpdateInputSchema>;
export type WorkerUpdateRequest = z.infer<typeof WorkerUpdateRequestSchema>;
export type WorkerLoginInput = z.infer<typeof WorkerLoginSchema>;
export type GetWorkerResponse = z.infer<typeof GetWorkerResponseSchema>;
export type UpdateWorkerResponse = z.infer<typeof UpdateWorkerResponseSchema>;
export type WorkerLoginResponse = z.infer<typeof WorkerLoginResponseSchema>;
