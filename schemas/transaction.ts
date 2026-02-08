// schemas/transaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas
// TransactionDirection
export const TransactionDirectionSchema = z.enum(['credit', 'debit']);

// Transaction
export const TransactionSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    account_id: z.string().uuid(),
    cardholder_id: z.string().uuid().nullable(),
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
export const CreateTransactionSchema = z.object({
    account_id: z.string().uuid(),
    cardholder_id: z.string().uuid().nullable().optional(),
    direction: TransactionDirectionSchema,
    amount: z.number().positive(),
    description: z.string().trim().max(255).nullable().optional(),
    merchant: z.string().trim().max(255).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    occurred_at: z.date(),
    is_pending: z.boolean().optional(), // DB default false
    notes: z.string().nullable().optional(),
    raw_data: z.record(z.string(), z.any()).nullable().optional(),
});

// Update Transaction
export const UpdateTransactionSchema = CreateTransactionSchema.partial();

// TransactionWithRelation
export const TransactionWithRelationsSchema = TransactionSchema.extend({
    account: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }).optional(),
    cardholder: z.object({
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
export type CreateTransactionForm = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionForm = z.infer<typeof UpdateTransactionSchema>;
