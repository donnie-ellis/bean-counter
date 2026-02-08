// schemas/cardholder.ts

import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Cardholder
export const CardholderSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required').max(255),
});

// Insert Cardholder
export const InsertCardholderSchema = z.object({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1).max(255),
});

export const CreateCardholderFormSchema = z.object({
    name: z.string().trim().min(1).max(255),
    user_id: z.string().uuid(),
});

// Update Cardholder
export const UpdateCardholderSchema = InsertCardholderSchema.partial();


// Types
export type Cardholder = z.infer<typeof CardholderSchema>;

export type CreateCardholderForm = z.infer<typeof CreateCardholderFormSchema>;

export type UpdateCardholderForm = z.infer<typeof UpdateCardholderSchema>;
