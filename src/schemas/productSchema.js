import { z } from "zod";

export const getAllProductQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.coerce.string().default(""),
});

export const paramsId = z.object({
  id: z.coerce.number().int().min(1),
});

export const createProductSchema = z.object({
  name: z.coerce.string().min(3).max(50),
  price: z.coerce.number().min(1).default(0),
  stock: z.coerce.number().int().min(1).default(0),
  category_id: z.coerce.number().int().min(1),
});

export const updateProductSchema = z.object({
  name: z.coerce.string().min(3).max(50),
  price: z.coerce.number().min(1).default(0),
  stock: z.coerce.number().int().min(1).default(0),
  category_id: z.coerce.number().int().min(1),
});
