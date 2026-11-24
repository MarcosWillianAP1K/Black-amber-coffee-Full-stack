import type * as z from "zod";
import type {
  ToggleUserStatusSchema,
  UpdateUserAdminSchema,
  UpdateUserSelfSchema,
} from "../validators/user.validator.js";

export interface UserDTO {
  publicId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserSelfInput = z.infer<typeof UpdateUserSelfSchema>;
export type UpdateUserAdminInput = z.infer<typeof UpdateUserAdminSchema>;
export type ToggleUserStatusInput = z.infer<typeof ToggleUserStatusSchema>;
