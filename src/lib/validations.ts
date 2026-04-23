import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const roleRequestSchema = z.object({
  userId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser positivo"),
  cost: z.coerce.number().min(0, "El costo debe ser positivo"),
  stock: z.coerce.number().int().min(0, "El stock debe ser positivo"),
  minStock: z.coerce.number().int().min(0, "El stock mínimo debe ser positivo"),
  supplierId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  contact: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const movementSchema = z.object({
  type: z.enum(["ENTRADA", "SALIDA"]),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  reason: z.string().optional(),
  productId: z.string().min(1, "El producto es requerido"),
});

export const roleUpdateSchema = z.object({
  userId: z.string().min(1, "El usuario es requerido"),
  role: z.enum(["EMPLOYEE", "ADMIN", "MASTER_ADMIN"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type MovementInput = z.infer<typeof movementSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;