// schemas/transactionTag.ts
import { z } from 'zod';

// Schemas

// Transaction Tag
export const TransactionTagSchema = z.object({
    transaction_id: z.string().uuid(),
    tag_id: z.string().uuid(),
});

// Create Transaction Tag
export const CreateTransactionTagSchema = TransactionTagSchema;

// Update Transaction Tag
export const UpdateTransactionTagSchema = TransactionTagSchema.partial();

// Types
export type TransactionTag = z.infer<typeof TransactionTagSchema>;
export type CreateTransactionTagForm = z.infer<typeof CreateTransactionTagSchema>;
export type UpdateTransactionTagForm = z.infer<typeof UpdateTransactionTagSchema>;
