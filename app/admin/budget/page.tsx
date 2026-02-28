// ./app/budget/admin/page.tsx

import CategoryManager from "@/app/categories/_components/categoryManager";
import { getCategories } from "@/app/categories/actions";
import { getAllAccountsWithMembers } from "@/app/accounts/actions";
import AccountManager from "@/app/accounts/_components/accountManager";
import { getSmallProfiles } from "@/app/profile/actions";
import AdminMenu from "@/app/admin/_components/adminMenu";
import { requireRole } from "@/lib/auth/requireRole";

export default async function BudgetAdminPage() {
    await requireRole('admin')
    const categories = await getCategories();
    const accounts = await getAllAccountsWithMembers();
    const profiles = await getSmallProfiles();

    return (
        <main className="flex flex-col px-4 gap-4">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-muted-foreground">Admin Portal - Accounts and Categories</h1>
                <AdminMenu />
            </header>
            <section  className="pt-6 flex flex-wrap gap-4">
                {/* Accounts */}
                <AccountManager className="w-full md:flex-1" initialAccounts={accounts} profiles={profiles} />

                {/* Categories */}
                <CategoryManager className="w-full md:flex-1" categories={categories} />
            </section>
        </main>
    )
}