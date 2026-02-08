// schemas/category.ts

import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Category
export const CategorySchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
    parent_id: z.string().uuid().nullable(),
});

// Insert Category
export const InsertCategorySchema = z.object({
    name: z.string().trim().min(1).max(255),
    parent_id: z.string().uuid().nullable().optional(),
});

// Update Category
export const UpdateCategorySchema = InsertCategorySchema.partial();

export const CreateCategoryFormSchema = z.object({
    name: z.string().trim().min(1).max(255),
    parent_id: z.string().uuid().nullable().optional(),
});

// Tree
export const CategoryTreeSchema: z.ZodType<Category & { children?: Category[] }> =
    CategorySchema.extend({
        children: z.array(z.lazy(() => CategoryTreeSchema)).optional(),
    });


// Types
export type Category = z.infer<typeof CategorySchema>;

export type UpdateCategoryForm = z.infer<typeof UpdateCategorySchema>;

export type InsertCategoryForm = z.infer<typeof InsertCategorySchema>;

export type CreateCategoryForm = z.infer<typeof CreateCategoryFormSchema>;
