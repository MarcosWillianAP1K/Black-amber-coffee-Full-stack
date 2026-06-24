import * as z from "zod";
import { WorkerRoles } from "../../core/enuns/workerRole";

// Worker Response (flat — no nested profile)
export const workerResponseSchema = z.object({
  publicId: z.string(),
  email: z.email(),
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }),
  salary: z.number(),
  isActive: z.boolean(),
  isAdmin: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Register Worker Input
export const registerWorkerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().min(1, "Phone number is required").optional(),
  role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }),
  salary: z.number().positive("Salary must be a positive number"),
});

// Login Worker Input
export const loginWorkerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Register Worker Response
export const registerWorkerResponseSchema = z.object({
  data: workerResponseSchema,
});

// Login Worker Response
export const loginWorkerResponseSchema = z.object({
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

// Update Worker Input
export const updateWorkerSchema = z
  .object({
    fullName: z.string().min(1, "Full name must not be empty").optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().min(1, "Phone must not be empty").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
    salary: z.number().positive("Salary must be a positive number").optional(),
    role: z.enum(WorkerRoles.VALUES, { message: "Invalid Role" }).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );

// Get Worker Response
export const getWorkerResponseSchema = z.object({
  data: workerResponseSchema,
});

// Update Worker Response
export const updateWorkerResponseSchema = z.object({
  data: workerResponseSchema,
  message: z.string().optional(),
});

// Types
export type Worker = z.infer<typeof workerResponseSchema>;
export type RegisterWorkerInput = z.infer<typeof registerWorkerSchema>;
export type LoginWorkerInput = z.infer<typeof loginWorkerSchema>;
export type RegisterWorkerResponse = z.infer<
  typeof registerWorkerResponseSchema
>;
export type LoginWorkerResponse = z.infer<typeof loginWorkerResponseSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type GetWorkerResponse = z.infer<typeof getWorkerResponseSchema>;
export type UpdateWorkerResponse = z.infer<typeof updateWorkerResponseSchema>;
