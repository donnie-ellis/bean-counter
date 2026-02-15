// ./app/budgets/page.tsx
import { getBudgetsWithCategory } from "@/app/budgets/actions"
import BudgetManager from "./_components/budgetManager"
import { requireRole } from "@/lib/auth/requireRole"
import { getCategories } from "@/app/categories/actions"

export default async function BudgetsPage() {
    await requireRole("user")
    const budgets = await getBudgetsWithCategory()
    const categories = await getCategories()

    return (
        <main  className="px-4">
            <h1 className="text-2xl font-bold mb-4">Budgets</h1>
            <BudgetManager initialBudgets={budgets ?? []} />
        </main>
    )
        
}