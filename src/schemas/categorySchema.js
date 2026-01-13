import { z } from "zod";

export const getAllCategoryQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.coerce.string().default(""),
});

export const paramsId = z.object({
  id: z.coerce.number().int().min(1),
});

export const createCategorySchema = z.object({
  name: z.coerce.string().min(3).max(50),
});
export const updateCategorySchema = z.object({
  name: z.coerce.string().min(3).max(50),
});

