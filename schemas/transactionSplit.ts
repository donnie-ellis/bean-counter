// schemas/transactionSplit.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

export const TransactionSplitSchema = BaseEntitySchema.extend({
    transaction_id: z.string().uuid(),
    category_id: z.string().uuid().nullable(),
    amount: z.number().positive(),
});

export type TransactionSplit = z.infer<typeof TransactionSplitSchema>;

export const InsertTransactionSplitSchema = z.object({
    transaction_id: z.string().uuid(),
    category_id: z.string().uuid().nullable().optional(),
    amount: z.number().positive(),
});

export const UpdateTransactionSplitSchema = InsertTransactionSplitSchema.partial();

export const CreateTransactionSplitFormSchema = z.object({
    category_id: z.string().uuid().nullable().optional(),
    amount: z.coerce.number().positive(),
});

export type CreateTransactionSplitForm = z.infer<typeof CreateTransactionSplitFormSchema>;

export const TransactionSplitListSchema = z.array(TransactionSplitSchema);

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
