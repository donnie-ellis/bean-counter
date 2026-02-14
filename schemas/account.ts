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
    user_id: z.string().uuid(),
});

// Account with Members
export const AccountWithMembersSchema = AccountSchema.extend({
    account_members: z.array(z.object({
        user_id: z.string().uuid(),
        role: z.string(),
    }))
});

// Create Account Form (without user_id, account_members, and timestamps)
export const CreateAccountFormSchema = AccountWithMembersSchema.omit({
    user_id: true,
    id: true,
    created_at: true,
});


// Update Account
export const UpdateAccountSchema = CreateAccountSchema.partial();

// Type
export type Account = z.infer<typeof AccountSchema>;

export type AccountWithMembers = z.infer<typeof AccountWithMembersSchema>;

export type CreateAccountForm = z.infer<typeof CreateAccountFormSchema>;

export type UpdateAccountForm = z.infer<typeof UpdateAccountSchema>;

export type AccountType = z.infer<typeof AccountTypeSchema>;
