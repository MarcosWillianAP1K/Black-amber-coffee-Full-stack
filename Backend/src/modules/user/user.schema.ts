import * as z from "zod";

export const UserResponseSchema = z.object({
  publicId: z.string(),
  fullName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserUpdateInputSchema = z
  .object({
    fullName: z.string().min(2, "Full name must not be empty").optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().min(1, "Phone must not be empty").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
    avatarBuffer: z.instanceof(Buffer).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );

export const UserUpdateRequestSchema = z
  .object({
    name: z.string().min(2, "Full name must not be empty").optional(),
    fullName: z.string().min(2, "Full name must not be empty").optional(),
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

export const GetUserResponseSchema = z.object({
  data: UserResponseSchema,
});

export const UpdateUserResponseSchema = z.object({
  data: UserResponseSchema,
  message: z.string().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
