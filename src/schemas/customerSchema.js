import { z } from "zod";

export const getAllCustomerQuery = z.object({
  page: z.coerce.number().min(1, "tidak boleh kurang dari 1 !").default(1),
  limit: z.coerce.number().min(1, "tidak boleh kurang dari 1 !").max(100, "maximal 100 !").default(10),
  search: z.coerce.string().default(""),
}); 

export const paramsId = z.object({
  id: z.coerce.number().int().min(1, "parameter id tidak boleh kurang dari 1")
});

export const createCustomerSchema = z.object({
  name: z.coerce.string().min(3).max(50),
  address: z.coerce.string(),
  phone: z.coerce.string().regex(/^[0-9]+$/, "hanya boleh angka").min(10, "minimal 10 karakter !").max(20, "Maximal 20 karakter !")
});
export const updateCustomerSchema = z.object({
  name: z.coerce.string().min(3).max(50),
  address: z.coerce.string(),
  phone: z.coerce.string().regex(/^[0-9]+$/, "hanya boleh angka").min(10, "minimal 10 karakter !").max(20, "Maximal 20 karakter !")  
});

