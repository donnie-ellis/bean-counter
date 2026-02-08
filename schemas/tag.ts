// ./schemas/tag.ts

import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Tag
export const TagSchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
});

// Create Tag
export const CreateTagSchema = z.object({
    name: z.string().trim().min(1).max(255),
});

// Update Tag
export const UpdateTagSchema = CreateTagSchema.partial();

// Tag List
export const TagListSchema = z.array(TagSchema);

// Tag Name Array
export const TagNameArraySchema = z.array(
    z.string().trim().min(1).max(255)
);

// Tag Relation
export const TagRelationSchema = z.object({
    tag_id: z.string().uuid(),
});

// Types
export type Tag = z.infer<typeof TagSchema>;
export type CreateTagForm = z.infer<typeof CreateTagSchema>;
export type UpdateTagForm = z.infer<typeof UpdateTagSchema>;
export type TagRelation = z.infer<typeof TagRelationSchema>;
export type TagList = z.infer<typeof TagListSchema>;
export type TagNameArray = z.infer<typeof TagNameArraySchema>;
