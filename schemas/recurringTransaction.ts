// schemas/recurringTransaction.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';
import { TransactionDirection, TransactionDirectionSchema } from '@/schemas';

export const RecurrenceFrequencySchema = z.enum([
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly',
]);

export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;

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
});

export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;

export const InsertRecurringTransactionSchema = z.object({
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

export const UpdateRecurringTransactionSchema = InsertRecurringTransactionSchema.partial();

export const CreateRecurringTransactionFormSchema = z.object({
    category_id: z.string().uuid().nullable().optional(),
    direction: TransactionDirectionSchema,
    amount: z.coerce.number().positive(),
    description: z.string().trim().max(255).nullable().optional(),
    frequency: RecurrenceFrequencySchema,
    start_date: z.coerce.date(),
    next_run_date: z.coerce.date(),
    is_active: z.coerce.boolean().optional(),
});

export type CreateRecurringTransactionForm = z.infer<typeof CreateRecurringTransactionFormSchema>;

RecurringTransactionSchema.superRefine((data, ctx) => {
    if (data.next_run_date < data.start_date) {
        ctx.addIssue({
            path: ['next_run_date'],
            message: 'Next run date cannot be before start date',
            code: z.ZodIssueCode.custom,
        });
    }
});
