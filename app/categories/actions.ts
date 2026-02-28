// ./app/budget/categories/actions.ts

'use server'

import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { Category, UpdateCategoryForm, InsertCategoryForm, CreateCategorySchema, UpdateCategorySchema, CategoryWithSpending, CategoryList } from '@/schemas'
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
        .select('id, name, created_at, parent_id, budget_amount')
        .order('name');
    if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
    }
    return data;
}

// Get a list of all categories
export async function getCategoryList(): Promise<CategoryList> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
    if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
    }
    return data;
}

// Insert a category
export async function createCategory(category: InsertCategoryForm): Promise<Category> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const validatedData = CreateCategorySchema.safeParse(category);
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
    const validatedData = UpdateCategorySchema.safeParse(category);
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
    revalidatePath('/categories')
    return data;
}

// Delete a category
export async function deleteCategory(id: string): Promise<string> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
    return id;
}

export async function getCategoriesWithBudget(target_month: string = new Date().toISOString()): Promise<CategoryWithSpending[]> {
    const supabase = await createClient();
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .rpc('get_monthly_categories_with_budgets', {
            target_month: target_month
        })

    if (error) {
        console.error('Error fetching categories with budget:', error);
        throw new Error('Failed to fetch categories with budget');
    }
    return data;
}
