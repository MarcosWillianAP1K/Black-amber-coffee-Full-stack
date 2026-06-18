import * as z from "zod";

export const RegisterClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiuscula.")
    .regex(/[0-9]/, "A senha deve ter ao menos um Numero."),
  phone: z.string().min(1, "Phone number is required").optional(),
});

export const LoginClientSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const ProfileResponseSchema = z.object({
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarImage: z.string().nullable(),
  createdAt: z.string(),
});

export const RegisterResponseSchema = z.object({
  data: z.object({
    publicId: z.string(),
    email: z.email(),
    createdAt: z.string(),
    updatedAt: z.string(),
    profile: ProfileResponseSchema,
  }),
});

export const LoginResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      publicId: z.string(),
      email: z.email(),
      userType: z.literal("user"),
      profile: ProfileResponseSchema,
    }),
  }),
});

export const SendPasswordResetSchema = z.object({
  email: z.email().min(6, "O email deve ter ao menos 6 caracteres."),
});
export const CheckPasswordResetSchema = z.object({
  userTokenId: z.string().min(1, "Código de reset é obrigatório."),
  code: z.string().min(1, "Código de reset é obrigatório."),
});

export const ResetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, "Token de reset é obrigatório."),
    newPassword: z
      .string()
      .min(6, "A senha deve ter ao menos 6 caracteres.")
      .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiuscula.")
      .regex(/[0-9]/, "A senha deve ter ao menos um Numero."),
    confirmNewPassword: z
      .string()
      .min(6, "A senha deve ter ao menos 6 caracteres.")
      .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiuscula.")
      .regex(/[0-9]/, "A senha deve ter ao menos um Numero."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não conferem.",
    path: ["confirmNewPassword"],
  });

export const RefreshtokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const RefreshTokenResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
  logoutAllDevices: z.boolean().default(false),
});

export const LogoutResponseSchema = z.object({
  data: z.object({
    success: z.boolean(),
  }),
});

export const SendPasswordResetResponseSchema = z.object({
  email: z.email(),
  userTokenId: z.string().nullable(),
  expiresAt: z.date(),
});

export const CheckPasswordResetResponseSchema = z.object({
  resetToken: z.string(),
});

export const ResetPasswordResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    publicId: z.string(),
    email: z.email(),
    profile: z.object({
      fullName: z.string(),
      phone: z.string().nullable(),
      avatarImage: z.string().nullable(),
      createdAt: z.string(),
    }),
  }),
});

export type RefreshTokenInput = z.infer<typeof RefreshtokenSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type SendPasswordResetInput = z.infer<typeof SendPasswordResetSchema>;
export type CheckPasswordResetInput = z.infer<typeof CheckPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export type RegisterInput = z.infer<typeof RegisterClientSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginInput = z.infer<typeof LoginClientSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SendPasswordResetResponse = z.infer<
  typeof SendPasswordResetResponseSchema
>;
export type CheckPasswordResetResponse = z.infer<
  typeof CheckPasswordResetResponseSchema
>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
