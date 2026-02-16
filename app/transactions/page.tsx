// ./app/transaction/page.tsx

import TransactionManager from "@/app/transactions/_components/transactionManager"
import { getTransactions } from "@/app/transactions/actions"
import { getCategories } from "@/app/categories/actions"
import { getAccounts } from "@/app/accounts/actions"
import { getTags } from "@/app/tags/actions"
import { getSmallProfiles } from "@/app/profile/actions"
import { requireRole } from "@/lib/auth/requireRole"

export default async function Transactions() {
    const currentUser = await requireRole('user')

    const categories = await getCategories()
    const accounts = await getAccounts()
    const tags = await getTags()
    const users = await getSmallProfiles()

    return(
        <main>
            <TransactionManager
                categories={categories}
                accounts={accounts}
                tags={tags}
                users={users}
                currentUserId={currentUser.profile.id} />
        </main>
    )
}

