import { z } from "zod";

export const getAllUserQuery = z.object({
  page: z.coerce.number().min(1, "minimal page = 1 !").default(1),
  limit: z.coerce.number().min(1, "minimal limit = 1 !").max(100).default(10),
  search: z.coerce.string().optional(),
  role: z.coerce.string().default(""),
  order: z.enum(["desc", "asc"]).default("asc")
});

export const paramsId = z.object({
  id: z.coerce.number().int().min(1, "id tidak boleh kurang dari 1 !")
});

export const createUserSchema = z.object({
  name: z.coerce.string().min(3, "nama minimal 3 character !").max(50, "nama maximal 50 character !"),
  email: z.coerce.string().email(),
  password: z.coerce.string().min(8, "password minimal 8 character"),
  role: z.enum(["admin", "staff"], "harus admin / staff").default("staff"),
});
export const updateUserSchema = z.object({
  name: z.coerce.string().min(3).max(50).optional(),
  email: z.coerce.string().email().optional(),
  password: z.coerce.string().min(8).optional(),
  role: z.enum(["admin", "staff"]).optional()
});

