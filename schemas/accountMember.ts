// schemas/accountMember.ts
import { z } from 'zod';
import { TimestampedEntitySchema } from '@/schemas/base';

export const AccountRoleSchema = z.enum(['owner', 'editor', 'viewer']);

export type AccountRole = z.infer<typeof AccountRoleSchema>;

export const AccountMemberSchema = TimestampedEntitySchema.extend({
    account_id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: AccountRoleSchema,
});

export type AccountMember = z.infer<typeof AccountMemberSchema>;

export const InsertAccountMemberSchema = AccountMemberSchema.omit({
    created_at: true,
});

export const UpdateAccountMemberSchema = z.object({
    role: AccountRoleSchema,
});

export const AddAccountMemberFormSchema = z.object({
    user_id: z.string().uuid(),
    role: AccountRoleSchema.optional(),
});

export type AddAccountMemberForm = z.infer<typeof AddAccountMemberFormSchema>;
