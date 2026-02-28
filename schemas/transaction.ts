// schemas/transaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';
//Interfaces
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

export const CreateTransactionFormSchema = TransactionSchema.omit({ id: true, created_at: true, raw_data: true });

// Update Transaction
export const UpdateTransactionSchema = CreateTransactionSchema.partial();

// TransactionWithRelation
export const TransactionWithRelationsSchema = TransactionSchema.extend({
    account: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }).optional(),
    member: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }).optional(),
    category: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }).optional(),
});

// Rules
TransactionSchema.superRefine((data, ctx) => {
    if (data.amount <= 0) {
        ctx.addIssue({
            path: ['amount'],
            message: 'Amount must be greater than zero',
            code: z.ZodIssueCode.custom,
        });
    }
});

// Types
export type TransactionDirection = z.infer<typeof TransactionDirectionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransactionForm = z.infer<typeof CreateTransactionFormSchema>;
export type UpdateTransactionForm = z.infer<typeof UpdateTransactionSchema>;
