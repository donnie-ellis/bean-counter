// ./app/budgets/actions.ts
"use server";

import { Budget, BudgetWithCategory, CreateBudgetSchema, BudgetPeriod, BudgetWithCategorySchema } from "@/schemas/budget";
import { getCategory } from "@/app/categories/actions";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/getUser";
import { z } from "zod";

export async function getBudgetsWithCategory(): Promise<BudgetWithCategory[] | null> {
    const user = await getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }
    
    const supabase = await createClient();
    
    // Step 1: Get budgets with their categories
    const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select(`
            id,
            period,
            amount,
            category:categories (
                id,
                name,
                parent_id
            )
        `)
        .order("created_at", { ascending: false });
    
    if (budgetsError) {
        console.error("Error fetching budgets:", budgetsError);
        throw new Error("Failed to fetch budgets");
    }
    
    // Step 2: Get all unique parent_ids
    const categoryData = budgets?.map(b => 
        Array.isArray(b.category) ? b.category[0] : b.category
    ).filter(Boolean);
    
    const parentIds = [...new Set(
        categoryData?.map(c => c?.parent_id).filter(Boolean) as string[]
    )];
    
    // Step 3: Fetch parent categories if needed
    const parentCategories: Map<string, { id: string; name: string }> = new Map();
    if (parentIds.length > 0) {
        const { data: parents, error: parentsError } = await supabase
            .from("categories")
            .select("id, name")
            .in("id", parentIds);
        
        if (!parentsError && parents) {
            parents.forEach(p => {
                parentCategories.set(p.id, p);
            });
        }
    }
    
    // Step 4: Transform the data
    const transformedData = budgets?.map(budget => {
        const category = Array.isArray(budget.category)
            ? budget.category[0]
            : budget.category;
        
        if (!category) {
            return {
                ...budget,
                category: null,
            };
        }
        
        const parent = category.parent_id 
            ? parentCategories.get(category.parent_id) || null
            : null;
        
        return {
            ...budget,
            category: {
                ...category,
                parent,
            },
        };
    });
    
    return z.array(BudgetWithCategorySchema).parse(transformedData);
}

// Insert budget
export async function insertBudget(data: z.infer<typeof CreateBudgetSchema>): Promise<void> {
    const user = await getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("budgets")
        .insert({
            user_id: user.id,
            category_id: data.category_id,
            amount: data.amount,
            period: data.period || "monthly"
        })

    if (error) {
        console.error("Error inserting budget:", error)
        throw new Error("Failed to create budget")
    }
}

// Update budget by ID
export async function updateBudget(id: string, data: z.infer<typeof CreateBudgetSchema>): Promise<void> {
    const user = await getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("budgets")
        .update({
            category_id: data.category_id,
            amount: data.amount,
            period: data.period
        })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error updating budget:", error)
        throw new Error("Failed to update budget")
    }
}

// Delete budget by ID
export async function deleteBudget(id: string): Promise<void> {
    const user = await getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error deleting budget:", error)
        throw new Error("Failed to delete budget")
    }
}
