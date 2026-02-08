// schemas/accountBalance.ts
import { z } from 'zod';
import { TimestampedEntitySchema } from '@/schemas/base';

// Schemas
// Account Balance
export const AccountBalanceSchema = TimestampedEntitySchema.extend({
  account_id: z.string().uuid(),
  balance: z.number(),
});

//Types 
export type AccountBalance = z.infer<typeof AccountBalanceSchema>;

