import * as z from "zod";
import { ProductCategory } from "../../../core/enums/index.js";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório."),
  description: z.string().nullable().optional(),
  imgUrl: z.string().nullable().optional(),
  price: z.coerce.number().positive("O preço deve ser maior que zero."),
  category: z.enum(ProductCategory.VALUES, { message: "Categoria inválida." }),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1, "Nome do produto não pode ser vazio.").optional(),
  description: z.string().nullable().optional(),
  imgUrl: z.string().nullable().optional(),
  price: z.coerce.number().positive("O preço deve ser maior que zero.").optional(),
  category: z.enum(ProductCategory.VALUES, { message: "Categoria inválida." }).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateProductStockSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantidade não pode ser negativa."),
  minQuantity: z.coerce.number().int().min(0, "Quantidade mínima não pode ser negativa.").optional(),
});
