// ./app/transaction/page.tsx

import TransactionManager from "@/app/transactions/_components/transactionManager"
import { getCategoryList } from "@/app/categories/actions"
import { getAccounts } from "@/app/accounts/actions"
import { getSmallProfiles } from "@/app/profile/actions"
import { requireRole } from "@/lib/auth/requireRole"

export default async function Transactions() {
    const currentUser = await requireRole('user')

    const categories = await getCategoryList()
    const accounts = await getAccounts()
    const users = await getSmallProfiles()

    return(
        <main>
            <TransactionManager
                categories={categories}
                accounts={accounts}
                users={users}
                currentUserId={currentUser.profile.id} />
        </main>
    )
}

