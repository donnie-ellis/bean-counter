// ./app/_components/overViewTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import CategorySnapshot from "@/app/categories/_components/categorySnapshot";
import { TransactionList } from "@/app/transactions/_components/transactionList";
import BudgetTrend from "@/components/budgetTrend";
import DailyTotals from "@/components/dailyTotals";
import { CategoryBudgetCard } from "@/app/categories/_components/categoryBudgetCard";
import { getTransactionsByMonth } from "@/app/transactions/actions";
import { Badge } from "@/components/ui/badge";
import { CategoryWithSpending } from "@/schemas";

interface OverViewTabProps {
    className?: string;
    categories: CategoryWithSpending[];
    selectedMonth: string | Date;
}

export default async function OverViewTab({ className, categories, selectedMonth }: OverViewTabProps) {
    const transactions = await getTransactionsByMonth(new Date(selectedMonth));
    const warnBudgets = categories.filter(c => c.budget_amount > 0 && c.spent / c.budget_amount >= 0.85);
    const categoriesWithBudget = categories.filter(c => c.budget_amount > 0);
    const categoryList = categories.map(c => ({ id: c.id, name: c.name }));
    const totalBudget = categoriesWithBudget.reduce((sum, c) => sum + (c.budget_amount || 0), 0);
    const totalSpent = categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0);


    return (
        <TabsContent value="overview" className={className}>
            {/* The Snapshot component */}
            <CategorySnapshot categories={categoriesWithBudget} className="w-full md:flex-1" />

            {/* The monthly progress component */}
            <BudgetTrend totalBudget={totalBudget} totalSpent={totalSpent} className="w-full md:flex-1" />


            <DailyTotals className="w-full md:flex-1" transactions={transactions} />

            {/* Are any budgets at 85%? Show them if so */}
            {warnBudgets.length > 0 && (
                <div className="w-full">
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] uppercase tracking-wide text-secondary-foreground/80">Needs Attention</span>
                        <Badge variant="destructive">{warnBudgets.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {warnBudgets.map((category: CategoryWithSpending) => (
                            <CategoryBudgetCard key={category.id} category={category} allCategories={categories} className="w-full md:flex-1" />
                        ))}
                    </div>
                </div>
            )}


            {/* Recent transactions */}
            <TransactionList
                className="w-full md:flex-1"
                categoryList={categoryList}
                transactions={transactions}
            />

        </TabsContent>

    )
}