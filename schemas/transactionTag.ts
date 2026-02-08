// schemas/transactionTag.ts
import { z } from 'zod';

export const TransactionTagSchema = z.object({
    transaction_id: z.string().uuid(),
    tag_id: z.string().uuid(),
});

export type TransactionTag = z.infer<typeof TransactionTagSchema>;

export const InsertTransactionTagSchema = TransactionTagSchema;

export const DeleteTransactionTagSchema = z.object({
    transaction_id: z.string().uuid(),
    tag_id: z.string().uuid(),
});

export const TransactionTagIdListSchema = z.array(z.string().uuid());

export const InsertTransactionTagsBulkSchema = z.array(InsertTransactionTagSchema);
