// ./schemas/category.ts

import { z } from 'zod';
import { BaseEntitySchema } from '@/schemas/base';

// Schemas

// Category
export const CategorySchema = BaseEntitySchema.extend({
    user_id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
    parent_id: z.string().uuid().nullable(),
    budget_amount: z.number().positive(),
    totaled_budget: z.number().positive().optional(),
});

// Insert Category
export const CreateCategorySchema = z.object({
    name: z.string().trim().min(1).max(255),
    parent_id: z.string().uuid().nullable().optional(),
    budget_amount: z.number().positive()
});

// Update Category
export const UpdateCategorySchema = CreateCategorySchema.partial();


// Tree
export const CategoryTreeSchema: z.ZodType<Category & { children?: Category[] }> =
    CategorySchema.extend({
        children: z.array(z.lazy(() => CategoryTreeSchema)).optional(),
    });


// Types
export type Category = z.infer<typeof CategorySchema>;
export type UpdateCategoryForm = z.infer<typeof UpdateCategorySchema>;
export type InsertCategoryForm = z.infer<typeof CreateCategorySchema>;
export type CategoryWithSpending = Pick<Category, 'id' | 'name' | 'parent_id' | 'budget_amount' | 'totaled_budget'> & {
    spent: number;
    remaining: number;
}
export type CategoryList = Pick<Category, 'id' | 'name'>[];
