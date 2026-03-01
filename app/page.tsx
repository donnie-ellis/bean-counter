import { requireAuth } from "@/lib/auth/requireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBudgetCard } from "@/app/categories/_components/categoryBudgetCard";
import { getCategoriesWithBudget } from "@/app/categories/actions";
import { CategoryWithSpending } from "@/schemas";
import { getProfile } from "@/lib/auth/getProfile";
import { Badge } from "@/components/ui/badge";
import CategorySnapshot from "@/app/categories/_components/categorySnapshot";
import BudgetTrend from "@/components/budgetTrend";
import { BudgetOverview } from "@/components/budgetOverview";
import { getTransactionsByMonth } from "@/app/transactions/actions";
import { TransactionList } from "@/app/transactions/_components/transactionList";
import { getAllAccountsWithMembers } from "@/app/accounts/actions";
import TransactionManager from "@/app/transactions/_components/transactionManager";
import { CreateTransactionButton } from "@/app/transactions/_components/createTransactionButton";
import { getSmallProfiles } from "@/app/profile/actions";
import MonthPicker from "@/components/monthPicker";
import DailyTotals from "@/components/dailyTotals";
import AdminMenu from "./admin/_components/adminMenu";

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
    const categoriesFull = await getCategoriesWithBudget(selectedMonth.toString());
    const transactions = await getTransactionsByMonth(new Date(selectedMonth));
    const accounts = await getAllAccountsWithMembers();

    if (!categoriesFull) {
        return <div>Loading...</div>;
    }
    const warnBudgets = categoriesFull.filter(c => c.budget_amount > 0 && c.spent / c.budget_amount >= 0.85);
    const categoriesWithBudget = categoriesFull.filter(c => c.budget_amount > 0);
    const totalBudget = categoriesWithBudget.reduce((sum, c) => sum + (c.budget_amount || 0), 0);
    const totalSpent = categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0);
    const users = await getSmallProfiles()
    const categoryList = categoriesFull.map(c => ({ id: c.id, name: c.name }));


    return (
        <>
            <header className="px-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-muted-foreground">Hello </h1>
                    <h2 className="text-2xl font-bold text-foreground">{profile.first_name}</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-2 p-4">
                        <div className="md:order-1">
                        {profile.role === "admin" && (
                            <AdminMenu />     
                       )}
                       </div>
                        <div className="md:order-2">
                        <MonthPicker />
                        </div>
                </div>
            </header>
            <main className="min-h-screen mx-auto p-6">

                <section>
                    <BudgetOverview totalBudget={totalBudget} totalSpent={totalSpent} className="mb-6" />
                </section>
                <section>
                    {/******************************* Tabs ***********************************/}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-accent border-b w-full justify-between z-10 fixed bottom-0 left-0 right-0 rounded-none h-14 px-2 md:sticky md:top-0 md:h-10 md:rounded-lg md:justify-between md:w-full">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="categories">Categories</TabsTrigger>
                                <TabsTrigger value="reports">Activity</TabsTrigger>
                        </TabsList>

                        {/******************************* Overview Tab ***********************************/}
                        <TabsContent value="overview" className="pt-6 flex flex-wrap gap-4">
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
                                            <CategoryBudgetCard key={category.id} category={category} allCategories={categoriesFull} className="w-full md:flex-1" />
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

                        <TabsContent value="transactions" className="pt-6">
                            This is where the transactions table will go
                        </TabsContent>

                        {/******************************* Budgets Tab ***********************************/}
                        <TabsContent value="categories" className="pt-6">
                            {categoriesFull.length === 0 ? (
                                <div className="text-center text-sm text-foreground/70 py-10">
                                    No Categories yet, please create some to get started
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {categoriesFull.map((category: CategoryWithSpending) => (
                                        <CategoryBudgetCard key={category.id} category={category} allCategories={categoriesFull} className="w-full md:flex-1" />
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
                    </Tabs>
                </section>
            </main>
            <CreateTransactionButton
                variant="default"
                size="icon"
                categories={categoryList}
                accounts={accounts}
                users={users}
                currentUserId={profile.id}
                icon={true}
                className="fixed bottom-18 right-4 z-50 rounded-full h-12 w-10 md:h-30 md:w-20 shadow-lg opacity-55 hover:opacity-75"
            />

        </>
    );
}
