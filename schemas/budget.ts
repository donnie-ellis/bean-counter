// schemas/budget.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

export const BudgetPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;

export const BudgetSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    category_id: z.string().uuid().nullable(),
    period: BudgetPeriodSchema,
    amount: z.number().positive(),
  });
  
  export type Budget = z.infer<typeof BudgetSchema>;

  export const InsertBudgetSchema = z.object({
    category_id: z.string().uuid().nullable().optional(),
    period: BudgetPeriodSchema.optional(), // DB default 'monthly'
    amount: z.number().positive(),
  });

  export const UpdateBudgetSchema = InsertBudgetSchema.partial();

  export const CreateBudgetFormSchema = z.object({
    category_id: z.string().uuid().nullable().optional(),
    period: BudgetPeriodSchema.optional(),
    amount: z.coerce.number().positive(),
  });
  
  export type CreateBudgetForm = z.infer<typeof CreateBudgetFormSchema>;
  
  BudgetSchema.superRefine((data, ctx) => {
    if (data.amount <= 0) {
      ctx.addIssue({
        path: ['amount'],
        message: 'Budget amount must be greater than zero',
        code: z.ZodIssueCode.custom,
      });
    }
  });
  