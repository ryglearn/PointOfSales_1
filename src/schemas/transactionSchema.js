import { z } from "zod";

export const getAllTransactionQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.coerce.string().default(""),
});

export const paramsId = z.object({
  id: z.coerce.number().int().min(1, "id tidak valid"),
});

export const transactionItemSchema = z.object({
  product_id: z.coerce.number().int().min(1, "product_id tidak valid"),
  qty: z.coerce.number().int().min(1, "qty minimal 1"),
});

export const createTransactionSchema = z.object({
  customer_id: z.coerce.number().int().min(1, "customer_id tidak valid"),
  items: z.array(transactionItemSchema).min(1, "items tidak boleh kosong"),
});

export const transactionReportQuery = z.object({
  date_start: z.string().optional(),
  date_end: z.string().optional(),
});
