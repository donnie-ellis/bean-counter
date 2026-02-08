// ./schemas/profile.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Profile
export const ProfileSchema = BaseEntitySchema.extend({
    email: z.string().email(),
    first_name: z.string().min(1, 'First name is required').max(255),
    last_name: z.string().min(1, 'Last name is required').max(255),
    role: z.string().min(1, 'Role is required').max(255),
    full_name: z.string().min(1, 'Full name is required').max(255),
    last_sign_in_at: z.date().nullable(),
    banned_unttil: z.date().nullable(),
    is_banned: z.boolean(),
    ban_duration_seconds: z.number().nullable(),
});

// Update Profile
export const UpdateProfileSchema = z.object({
    first_name: z.string().min(1, 'First name is required').max(255).optional(),
    last_name: z.string().min(1, 'Last name is required').max(255).optional(),
})

// Types
export type Profile = z.infer<typeof ProfileSchema>;
export type UpdateProfileForm = z.infer<typeof UpdateProfileSchema>;
