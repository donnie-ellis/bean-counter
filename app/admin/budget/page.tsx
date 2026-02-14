// ./app/budget/admin/page.tsx

import CategoryManager from "@/app/categories/_components/categoryManager";
import { getCategories } from "@/app/categories/actions";
import { getCardholders } from "@/app/cardholder/actions";
import { getTags } from "@/app/tags/actions";
import { getAccounts } from "@/app/accounts/actions";
import TagManager from "@/app/tags/_components/tagManager";
import CardholderManager from "@/app/cardholder/_components/cardholderManager";
import { getUserProfiles } from "@/app/admin/users/actions";
import AccountManager from "@/app/accounts/_components/accountManager";

export default async function BudgetAdminPage() {
    const categories = await getCategories();
    const tags = await getTags();
    const cardholders = await getCardholders();
    const accounts = await getAccounts();
    const profiles = await getUserProfiles();

    return (
        <div className="lg:flex lg:flex-row px-4 gap-4">
            <div className="flex flex-col gap-4 basis-3/4">
                {/* Accounts */}
                {!accounts ? (
                    <div>Loading...</div>
                ) : (
                    <AccountManager accounts={accounts} cardholders={cardholders} />
                )}

                {/* Categories */}
                {!categories ? (
                    <div>Loading...</div>
                ) : (
                    <CategoryManager categories={categories} />
                )}
            </div>
            <div className="flex flex-col gap-4 basis-1/4">
                {/* Cardholders */}
                {!cardholders || !profiles ? (
                    <div>Loading...</div>
                ) : (

                    <CardholderManager cardholders={cardholders} profiles={profiles} />
                )}

                {/* Tags */}
                {!tags ? (
                    <div>Loading...</div>
                ) : (
                    <TagManager tags={tags} />
                )}
            </div>
        </div>
    )
}