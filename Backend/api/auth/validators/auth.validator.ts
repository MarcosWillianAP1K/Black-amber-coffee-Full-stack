import * as z from "zod";

export const RegisterClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.email("E-mail inválido."),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula.")
    .regex(/[0-9]/, "A senha deve ter ao menos um número."),
  phone: z.string().min(1, "Telefone inválido.").optional(),
});

export const LoginSchema = z.object({
  email: z.email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório."),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório."),
  logoutAllDevices: z.boolean().default(false),
});

export const SendPasswordResetSchema = z.object({
  email: z.email("E-mail inválido.").min(6, "O e-mail deve ter ao menos 6 caracteres."),
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
      .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula.")
      .regex(/[0-9]/, "A senha deve ter ao menos um número."),
    confirmNewPassword: z
      .string()
      .min(6, "A senha deve ter ao menos 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não conferem.",
    path: ["confirmNewPassword"],
  });
