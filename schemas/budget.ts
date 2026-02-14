// schemas/budget.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Budget Period
export const BudgetPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

// Budget
export const BudgetSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    category_id: z.string().uuid().nullable(),
    period: BudgetPeriodSchema,
    amount: z.number().positive(),
});

export const BudgetWithCategorySchema = BudgetSchema.extend({
    category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        parent: z.object({
            id: z.string().uuid(),
            name: z.string(),
        }).nullable(),
    }).nullable(),
}).omit({ category_id: true, created_at: true, user_id: true });


export const CreateBudgetSchema = z.object({
    category_id: z.string().uuid().nullable().optional(),
    period: BudgetPeriodSchema.optional(), // DB default 'monthly'
    amount: z.number().positive(),
});

// Update Budget
export const UpdateBudgetSchema = CreateBudgetSchema.partial();

// Rules
BudgetSchema.superRefine((data, ctx) => {
    if (data.amount <= 0) {
        ctx.addIssue({
            path: ['amount'],
            message: 'Budget amount must be greater than zero',
            code: z.ZodIssueCode.custom,
        });
    }
});

// Types
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type BudgetWithCategory = z.infer<typeof BudgetWithCategorySchema>;
export type CreateBudgetForm = z.infer<typeof CreateBudgetSchema>;

