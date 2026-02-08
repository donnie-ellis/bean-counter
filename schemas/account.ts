// schemas/account.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Account Type
export const AccountTypeSchema = z.enum([
    'checking',
    'savings',
    'credit_card',
    'cash',
    'investment',
    'loan',
]);

// Account
export const AccountSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
    type: AccountTypeSchema,
    institution: z.string().trim().max(255).nullable(),
    credit_limit: z.number().nullable(),
    is_active: z.boolean(),
});

// Create Account
export const CreateAccountSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: AccountTypeSchema,
    institution: z.string().trim().max(255).nullable().optional(),
    credit_limit: z.number().nullable().optional(),
    is_active: z.boolean().optional(),
    cardholder_id: z.string().uuid().nullable().optional(),
    account_member_ids: z.array(z.string()).optional(),
});

// Update Account
export const UpdateAccountSchema = CreateAccountSchema.partial();

// Type
export type Account = z.infer<typeof AccountSchema>;

export type CreateAccountForm = z.infer<typeof CreateAccountSchema>;

export type UpdateAccountForm = z.infer<typeof UpdateAccountSchema>;

export type AccountType = z.infer<typeof AccountTypeSchema>;
