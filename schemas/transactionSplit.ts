// schemas/transactionSplit.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Transaction Split
export const TransactionSplitSchema = BaseEntitySchema.extend({
    transaction_id: z.string().uuid(),
    category_id: z.string().uuid().nullable(),
    amount: z.number().positive(),
});

// CreateTransaction Split
export const CreateTransactionSplitSchema = z.object({
    transaction_id: z.string().uuid(),
    category_id: z.string().uuid().nullable().optional(),
    amount: z.number().positive(),
});

// Update Transaction Split
export const UpdateTransactionSplitSchema = CreateTransactionSplitSchema.partial();

// Transaction Splits Sum
export const TransactionSplitsSumSchema = z.array(TransactionSplitSchema).superRefine((splits, ctx) => {
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    if (total <= 0) {
        ctx.addIssue({
            path: [],
            message: 'Total of splits must be greater than zero',
            code: z.ZodIssueCode.custom,
        });
    }
});

// Types
export type TransactionSplit = z.infer<typeof TransactionSplitSchema>;
export type CreateTransactionSplitForm = z.infer<typeof CreateTransactionSplitSchema>;
export type UpdateTransactionSplitForm = z.infer<typeof UpdateTransactionSplitSchema>;
export type TransactionSplitsSum = z.infer<typeof TransactionSplitsSumSchema>;
