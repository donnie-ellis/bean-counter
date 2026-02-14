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

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("budgets")
        .select(`
            id, period, amount,
            category:categories!inner (
                id,
                name,
                parent:categories (
                    id,
                    name
                )
            )
        `)
        .order("created_at", { ascending: false })
        .returns<z.infer<BudgetWithCategory>[]>();

    if (error) {
        console.error("Error fetching budgets:", error)
        throw new Error("Failed to fetch budgets")
    }

    // Validate and parse data with Zod
    //   fixes supabase returning an array for category when it's a single object
    const budgets = z.array(BudgetWithCategorySchema).parse(data)

    return budgets;
}