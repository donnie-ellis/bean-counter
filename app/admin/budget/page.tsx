// ./app/budget/admin/page.tsx

import CategoryManager from "@/app/categories/_components/categoryManager";
import { getCategories } from "@/app/categories/actions";
import { getTags } from "@/app/tags/actions";
import { getAllAccountsWithMembers } from "@/app/accounts/actions";
import TagManager from "@/app/tags/_components/tagManager";
import AccountManager from "@/app/accounts/_components/accountManager";
import { getSmallProfiles } from "@/app/profile/actions";

export default async function BudgetAdminPage() {
    const categories = await getCategories();
    const tags = await getTags();
    const accounts = await getAllAccountsWithMembers();
    const profiles = await getSmallProfiles();

    return (
        <main className="lg:flex lg:flex-row px-4 gap-4">
            <section className="flex flex-col gap-4 basis-3/4">
                {/* Accounts */}
                <AccountManager initialAccounts={accounts} profiles={profiles} />

                {/* Categories */}
                <CategoryManager categories={categories} />
            </section>
            <section className="flex flex-col gap-4 basis-1/4">
                {/* Tags */}
                <TagManager tags={tags} />
            </section>
        </main>
    )
}