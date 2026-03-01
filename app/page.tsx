import { requireAuth } from "@/lib/auth/requireAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoriesWithBudget } from "@/app/categories/actions";
import { getProfile } from "@/lib/auth/getProfile";
import { BudgetOverview } from "@/components/budgetOverview";
import { getAllAccountsWithMembers } from "@/app/accounts/actions";
import { CreateTransactionButton } from "@/app/transactions/_components/createTransactionButton";
import { getSmallProfiles } from "@/app/profile/actions";
import MonthPicker from "@/components/monthPicker";
import AdminMenu from "./admin/_components/adminMenu";
import OverViewTab from "./_components/overViewTab";
import CategoriesTab from "./_components/categoriesTab";
import TransactionsTab from "./_components/transactionsTab";

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
    const accounts = await getAllAccountsWithMembers();

    if (!categoriesFull) {
        return <div>Loading...</div>;
    }
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
                            <TabsTrigger value="transactions">Activity</TabsTrigger>
                        </TabsList>

                        {/******************************* Overview Tab ***********************************/}
                        <OverViewTab
                            className="p-4 flex flex-col gap-4"
                            categories={categoriesFull}
                            selectedMonth={selectedMonth}
                        />

                        {/******************************* Budgets Tab ***********************************/}
                        <CategoriesTab
                            className="p-4 flex flex-col gap-4"
                            categories={categoriesWithBudget}
                        />

                        {/******************************* Transactions Tab ***********************************/}
                        <TransactionsTab
                            className="p-4 flex flex-col gap-4"
                            categories={categoryList}
                            users={users}
                            accounts={accounts}
                            currentUserId={profile.id}
                        />
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
