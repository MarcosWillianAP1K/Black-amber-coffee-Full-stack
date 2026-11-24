import * as z from "zod";
import { WorkerRoles } from "../../../core/enums/index.js";

export const RegisterWorkerSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório."),
  email: z.email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  phone: z.string().min(1, "Telefone inválido.").optional(),
  role: z.enum(WorkerRoles.VALUES, { message: "Cargo inválido." }),
  salary: z.coerce.number().min(0, "Salário deve ser maior ou igual a zero."),
});

export const UpdateWorkerSelfSchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio.").optional(),
  fullName: z.string().min(1, "Nome completo não pode ser vazio.").optional(),
  email: z.email("E-mail inválido.").optional(),
  phone: z.string().min(1, "Telefone não pode ser vazio.").optional(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional(),
});

export const UpdateWorkerAdminSchema = z
  .object({
    fullName: z.string().min(1, "Nome completo não pode ser vazio.").optional(),
    email: z.email("E-mail inválido.").optional(),
    phone: z.string().min(1, "Telefone não pode ser vazio.").nullable().optional(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional(),
    salary: z.coerce.number().min(0, "Salário deve ser maior ou igual a zero.").optional(),
    role: z.enum(WorkerRoles.VALUES, { message: "Cargo inválido." }).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualização.");

export const ToggleWorkerStatusSchema = z.object({
  isActive: z.boolean().optional(),
});
