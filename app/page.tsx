import { requireAuth } from "@/lib/auth/requireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBudgetCard } from "./categories/_components/categoryBudgetCard";
import { getCategoriesWithBudget } from "./categories/actions";
import { CategoryWithSpending } from "@/schemas";
import { getProfile } from "@/lib/auth/getProfile";
import { Badge } from "@/components/ui/badge";
import CategorySnapshot from "@/app/categories/_components/categorySnapshot";
import BudgetTrend from "@/components/budgetTrend";
import { BudgetOverview } from "@/components/budgetOverview";
import { getTransactionsByMonth } from "@/app/transactions/actions";
import { TransactionList } from "./transactions/_components/transactionList";
import { getAccounts } from "@/app/accounts/actions";
import TransactionManager from "./transactions/_components/transactionManager";
import { CreateTransactionButton } from "./transactions/_components/createTransactionButton";
import { getSmallProfiles } from "@/app/profile/actions";
import MonthPicker from "@/components/monthPicker";
import AccountManager from "./accounts/_components/accountManager";
import CategoryManager from "./categories/_components/categoryManager";

interface HomeProps { 
    searchParams: Promise<{
        month?: Date;
    }>;
}

export default async function Home({ searchParams, }: HomeProps) {
    const { month } = await searchParams;
    const selectedMonth = month ?? new Date().toISOString();
    const user = await requireAuth();
    const profile = await getProfile(user.id);
    const categories = await getCategoriesWithBudget(selectedMonth.toString());
    const transactions = await getTransactionsByMonth(new Date(selectedMonth));
    const accounts = await getAccounts();

    if (!categories) {
        return <div>Loading...</div>;
    }
    const warnBudgets = categories.filter(c => c.budget_amount > 0 && c.spent / c.budget_amount >= 0.85);
    const categoriesWithBudget = categories.filter(c => c.budget_amount > 0);
    const totalBudget = categoriesWithBudget.reduce((sum, c) => sum + (c.budget_amount || 0), 0);
    const totalSpent = categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0);
    const users = await getSmallProfiles()
    const categoryList = categories.map(c => ({ id: c.id, name: c.name }));


    return (
        <>
            <header className="px-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-muted-foreground">Hello </h1>
                    <h2 className="text-2xl font-bold text-foreground">{profile.first_name}</h2>
                </div>
                <div>
                    <MonthPicker />
                </div>
            </header>
            <main className="min-h-screen mx-auto p-6">

                <section>
                    <BudgetOverview totalBudget={totalBudget} totalSpent={totalSpent} className="mb-6" />
                </section>
                <section>
                <Tabs defaultValue="overview" className="w-full">
  <TabsList className="bg-accent border-b w-full justify-between fixed bottom-0 left-0 right-0 rounded-none h-14 px-2 md:sticky md:top-0 md:h-10 md:rounded-lg md:justify-start md:w-auto">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="budgets">Budgets</TabsTrigger>

    <CreateTransactionButton
      variant="default"
      size="lg"
      categories={categoryList}
      accounts={accounts}
      users={users}
      currentUserId={profile.id}
      icon={true}
      className="rounded-full h-10 w-10 md:h-20 md:w-20 md:-translate-y-6"
    />

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
                        {/******************************* Budgets Tab ***********************************/}
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
                            <TransactionManager
                                accounts={accounts}
                                users={users}
                                currentUserId={profile.id}
                                categories={categoryList}
                                className="w-full" />
                        </TabsContent>

                            {/******************************* Admin Tab ***********************************/}
                        {profile.role === "admin" && (
                            <TabsContent value="admin" className="pt-6">
                                <AccountManager profiles={users} initialAccounts={accounts} />
                                <CategoryManager categories={categories} />
                            </TabsContent>
                        )}
                    </Tabs>
                </section>
            </main>
        </>
    );
}
