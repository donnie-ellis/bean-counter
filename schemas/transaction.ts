// schemas/transaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Interfaces
export interface TransactionQueryParams {
  page: number
  pageSize: number
  sortBy?: keyof Transaction
  sortOrder?: "asc" | "desc"
  search?: string
}

export interface PaginatedTransactions {
  data: Transaction[]
  count: number
}

// Schemas
// TransactionDirection
export const TransactionDirectionSchema = z.enum(['credit', 'debit']);

// Transaction
export const TransactionSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  direction: TransactionDirectionSchema,
  amount: z.number().positive(),
  description: z.string().trim().max(255).nullable(),
  merchant: z.string().trim().max(255).nullable(),
  category_id: z.string().uuid().nullable(),
  occurred_at: z.date(),
  is_pending: z.boolean(),
  notes: z.string().nullable(),
  raw_data: z.record(z.string(), z.any()).nullable(),
});

// Create Transaction
export const CreateTransactionSchema = TransactionSchema.omit({ id: true, created_at: true, raw_data: true });

export const CreateTransactionFormSchema = TransactionSchema.omit({ id: true, created_at: true, raw_data: true }).extend({
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be greater than zero'),
});

// Types
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransactionForm = z.infer<typeof CreateTransactionFormSchema>;