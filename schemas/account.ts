// schemas/account.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

export const AccountTypeSchema = z.enum([
    'checking',
    'savings',
    'credit_card',
    'cash',
    'investment',
    'loan',
]);

export const AccountSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
    type: AccountTypeSchema,
    institution: z.string().trim().max(255).nullable(),
    credit_limit: z.number().nullable(),
    is_active: z.boolean(),
});

export type Account = z.infer<typeof AccountSchema>;

export const InsertAccountSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: AccountTypeSchema,
    institution: z.string().trim().max(255).nullable().optional(),
    credit_limit: z.number().nullable().optional(),
    is_active: z.boolean().optional(), // default true in DB
});

export const UpdateAccountSchema = InsertAccountSchema.partial();

export const CreateAccountFormSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: AccountTypeSchema,
    institution: z.string().trim().max(255).nullable().optional(),
    credit_limit: z.number().nullable().optional(),
    is_active: z.boolean().optional(),
    cardholder_id: z.string().uuid().nullable().optional(),
    account_member_ids: z.array(z.string()).optional(),
});

export type CreateAccountForm = z.infer<typeof CreateAccountFormSchema>;

export const AccountWithValidationSchema = AccountSchema.superRefine((data, ctx) => {
    if (data.type !== 'credit_card' && data.credit_limit != null) {
        ctx.addIssue({
            path: ['credit_limit'],
            message: 'Credit limit is only valid for credit card accounts',
            code: z.ZodIssueCode.custom,
        });
    }
});
