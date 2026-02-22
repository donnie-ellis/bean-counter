import { requireAuth } from "@/lib/auth/requireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBudgetCard } from "./categories/_components/categoryBudgetCard";
import { getCategoriesWithBudget } from "./categories/actions";
import { CategoryWithBudget } from "@/schemas";
import { getProfile } from "@/lib/auth/getProfile";
import { Badge } from "@/components/ui/badge";
import CategorySnapshot from "@/app/categories/_components/categorySnapshot";
import BudgetTrend from "./budgets/_components/budgetTrend";
import { BudgetOverview } from "@/app/budgets/_components/budgetOverview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTransactionsByMonth } from "@/app/transactions/actions";
import { TransactionList } from "./transactions/_components/transactionList";
import { TransactionsTable } from "./transactions/_components/transactionsTable";
import { getAccounts } from "@/app/accounts/actions";
import TransactionManager from "./transactions/_components/transactionManager";
export default async function Home() {
    const user = await requireAuth();
    const profile = await getProfile(user.id);
    const categories = await getCategoriesWithBudget();
    const transactions = await getTransactionsByMonth(new Date());
    const accounts = await getAccounts();

    if (!categories) {
        return <div>Loading...</div>;
    }
    const warnBudgets = categories.filter(c => c.budget_amount > 0 && c.spent / c.budget_amount >= 0.85);
    const categoriesWithBudget = categories.filter(c => c.budget_amount > 0);
    const totalBudget = categoriesWithBudget.reduce((sum, c) => sum + (c.budget_amount || 0), 0);
    const totalSpent = categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0);

    return (
        <>
            <header className="px-8 flex items-center justify-between">
                <div>
                <h1 className="text-xl font-bold text-muted-foreground">Hello </h1>
                <h2 className="text-2xl font-bold text-foreground">{profile.first_name}</h2>
                </div>
                <div>
                    <Button variant="default" size="icon" className="">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <main className="min-h-screen mx-auto p-6">
                
                <section>
                    <BudgetOverview totalBudget={totalBudget} totalSpent={totalSpent} className="mb-6" />
                </section>
                <section>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-transparent border-b w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="budgets">Budgets</TabsTrigger>
                            <TabsTrigger value="reports">Activity</TabsTrigger>
                            {profile.role === "admin" && <TabsTrigger value="admin">Admin</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="overview" className="pt-6 flex flex-wrap gap-4">
                            {/* The Snapshot component */}
                            <CategorySnapshot categories={categoriesWithBudget} className="w-full md:flex-1" />

                            {/* The monthly progress component */}
                            <BudgetTrend totalBudget={totalBudget} totalSpent={totalSpent} className="w-full md:flex-1" />

                            {/* Are any budgets at 85%? Show them if so */}
                            {warnBudgets.length > 0 && (
                                <div className="w-full">
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[11px] uppercase tracking-wide text-secondary-foreground/80">Needs Attention</span>
                                        <Badge variant="destructive">{warnBudgets.length}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {warnBudgets.map((category: CategoryWithBudget) => (
                                            <CategoryBudgetCard key={category.id} category={category} allCategories={categories} className="w-full md:flex-1" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent transactions */}
                            <TransactionList transactions={transactions} className="w-full md:flex-1" />

                        </TabsContent>

                        <TabsContent value="transactions" className="pt-6">
                            This is where the transactions table will go
                        </TabsContent>

                        <TabsContent value="budgets" className="pt-6">
                            {categories.length === 0 ? (
                                <div className="text-center text-sm text-slate-500 py-10">
                                    No budgets yet. Create a budget to see it here.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {categories.map((category: CategoryWithBudget) => (
                                        <CategoryBudgetCard key={category.id} category={category} allCategories={categories} className="w-full md:flex-1" />
                                    ))}
                                </div>
                            )
                            }
                        </TabsContent>

                        <TabsContent value="reports" className="pt-6">
                            <TransactionManager accounts={accounts} className="w-full" />
                        </TabsContent>

                        {profile.role === "admin" && (
                            <TabsContent value="admin" className="pt-6">
                                This is where the admin panel will go
                            </TabsContent>
                        )}
                    </Tabs>
                </section>
            </main>
        </>
    );
}
