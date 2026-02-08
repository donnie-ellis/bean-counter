// schemas/base.ts
import { z } from 'zod';

// Reusable base for all entities with timestamps
export const TimestampedEntitySchema = z.object({
  created_at: z.date(),
});

// Base for entities with ID + timestamps
export const BaseEntitySchema = TimestampedEntitySchema.extend({
  id: z.string().uuid(),
});

export type TimestampedEntity = z.infer<typeof TimestampedEntitySchema>;
export type BaseEntity = z.infer<typeof BaseEntitySchema>;