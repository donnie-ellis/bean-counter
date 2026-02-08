// ./app/categories/actions.ts

'use server'

import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { Category, UpdateCategoryForm, InsertCategoryForm, InsertCategorySchema, UpdateCategorySchema, CategorySchema } from '@/schemas'
import { revalidatePath } from 'next/cache';

// Get all categories
export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, user_id, created_at, parent_id')
        .order('name');
    if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
    }
    return data;

}

// Get a single category
export async function getCategory(id: string): Promise<Category> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, user_id, created_at, parent_id')
        .eq('id', id)
        .single();
    if (error) {
        console.error('Error fetching category:', error);
        throw new Error('Failed to fetch category');
    }
    return data
}

// Insert a category
export async function createCategory(category: InsertCategoryForm): Promise<Category> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const validatedData = InsertCategorySchema.safeParse({ ...category, user_id: user.id });
    if (!validatedData.success) {
        console.error('Validation failed:', validatedData.error);
        throw new Error('Validation failed');
    }
    const { data, error } = await supabase
        .from('categories')
        .insert(validatedData.data)
        .select()
        .single();
    if (error) {
        console.error('Error creating category:', error);
        throw new Error('Failed to create category');
    }
    revalidatePath('/budget/categories')
    return data;
}

// Update a category
export async function updateCategory(id: string, category: UpdateCategoryForm): Promise<Category> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const validatedData = UpdateCategorySchema.safeParse({ ...category, user_id: user.id });
    if (!validatedData.success) {
        console.error('Validation failed:', validatedData.error);
        throw new Error('Validation failed');
    }
    const { data, error } = await supabase
        .from('categories')
        .update(validatedData.data)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
    }
    revalidatePath('/budget/categories')
    return data;
}

// Delete a category
export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const user = await getUser();
    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
    revalidatePath('/budget/categories')
    return null;
}
