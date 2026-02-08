// schemas/accountMember.ts
import { z } from 'zod';
import { TimestampedEntitySchema } from '@/schemas/base';

// Schemas

// Account Role
export const AccountRoleSchema = z.enum(['owner', 'editor', 'viewer']);

// Account Member
export const AccountMemberSchema = TimestampedEntitySchema.extend({
    account_id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: AccountRoleSchema,
});

// Create AccountMember
export const CreateAccountMemberSchema = AccountMemberSchema.omit({
    created_at: true,
});

// Update AccountMember
export const UpdateAccountMemberSchema = z.object({
    role: AccountRoleSchema,
});

// Type
export type AccountRole = z.infer<typeof AccountRoleSchema>;
export type AccountMember = z.infer<typeof AccountMemberSchema>;
export type CreateAccountMemberForm = z.infer<typeof CreateAccountMemberSchema>;
