// schemas/recurringTransaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';
import { TransactionDirection, TransactionDirectionSchema } from '@/schemas';

// Schemas

// Recurrence Frequency
export const RecurrenceFrequencySchema = z.enum([
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly',
]);

// Recurring Transaction
export const RecurringTransactionSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    account_id: z.string().uuid(),
    category_id: z.string().uuid().nullable(),
    direction: TransactionDirectionSchema,
    amount: z.number().positive(),
    description: z.string().trim().max(255).nullable(),
    frequency: RecurrenceFrequencySchema,
    start_date: z.date(),
    next_run_date: z.date(),
    is_active: z.boolean(),
}); export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;

// Create Recurring Transaction
export const CreateRecurringTransactionSchema = z.object({
    account_id: z.string().uuid(),
    category_id: z.string().uuid().nullable().optional(),
    direction: TransactionDirectionSchema,
    amount: z.number().positive(),
    description: z.string().trim().max(255).nullable().optional(),
    frequency: RecurrenceFrequencySchema,
    start_date: z.date(),
    next_run_date: z.date(),
    is_active: z.boolean().optional(), // DB default true
});

// Update Recurring Transaction
export const UpdateRecurringTransactionSchema = CreateRecurringTransactionSchema.partial();

// Rules
RecurringTransactionSchema.superRefine((data, ctx) => {
    if (data.next_run_date < data.start_date) {
        ctx.addIssue({
            path: ['next_run_date'],
            message: 'Next run date cannot be before start date',
            code: z.ZodIssueCode.custom,
        });
    }
});

// Types
export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;
export type CreateRecurringTransactionForm = z.infer<typeof CreateRecurringTransactionSchema>;
export type UpdateRecurringTransactionForm = z.infer<typeof UpdateRecurringTransactionSchema>;
