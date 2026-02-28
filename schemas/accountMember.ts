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


// Type
export type AccountRole = z.infer<typeof AccountRoleSchema>;
