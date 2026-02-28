// ./app/budget/admin/page.tsx

import CategoryManager from "@/app/categories/_components/categoryManager";
import { getCategories } from "@/app/categories/actions";
import { getAllAccountsWithMembers } from "@/app/accounts/actions";
import AccountManager from "@/app/accounts/_components/accountManager";
import { getSmallProfiles } from "@/app/profile/actions";
import Link from "next/link";

export default async function BudgetAdminPage() {
    const categories = await getCategories();
    const accounts = await getAllAccountsWithMembers();
    const profiles = await getSmallProfiles();

    return (
        <main className="lg:flex lg:flex-row px-4 gap-4">
            <header>
                <h1 className="text-xl font-bold text-muted-foreground">Bean-Counter admin</h1>
                <Link href="/">Home</Link>
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