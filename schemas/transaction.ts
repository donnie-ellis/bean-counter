// schemas/transaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

export const TransactionDirectionSchema = z.enum(['credit', 'debit']);

export type TransactionDirection = z.infer<typeof TransactionDirectionSchema>;

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

export type Transaction = z.infer<typeof TransactionSchema>;

export const InsertTransactionSchema = z.object({
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

export const UpdateTransactionSchema = InsertTransactionSchema.partial();

export const CreateTransactionFormSchema = z.object({
    account_id: z.string().uuid(),
    cardholder_id: z.string().uuid().nullable().optional(),
    direction: TransactionDirectionSchema,
    amount: z.coerce.number().positive(),
    description: z.string().trim().max(255).nullable().optional(),
    merchant: z.string().trim().max(255).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    occurred_at: z.coerce.date(),
    is_pending: z.coerce.boolean().optional(),
    notes: z.string().nullable().optional(),
    raw_data: z.record(z.string(), z.any()).nullable().optional(),
});

export type CreateTransactionForm = z.infer<typeof CreateTransactionFormSchema>;

TransactionSchema.superRefine((data, ctx) => {
    if (data.amount <= 0) {
        ctx.addIssue({
            path: ['amount'],
            message: 'Amount must be greater than zero',
            code: z.ZodIssueCode.custom,
        });
    }
});

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
