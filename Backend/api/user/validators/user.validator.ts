import * as z from "zod";

export const UpdateUserSelfSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres.").optional(),
  fullName: z.string().min(2, "Nome completo deve ter pelo menos 2 caracteres.").optional(),
  email: z.email("E-mail inválido.").optional(),
  phone: z.string().min(1, "Telefone não pode ser vazio.").nullable().optional(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional(),
});

export const UpdateUserAdminSchema = z
  .object({
    fullName: z.string().min(2, "Nome completo deve ter pelo menos 2 caracteres.").optional(),
    email: z.email("E-mail inválido.").optional(),
    phone: z.string().min(1, "Telefone não pode ser vazio.").nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualização.");

export const ToggleUserStatusSchema = z.object({
  isActive: z.boolean().optional(),
});
