// ./app/_components/transactionsTab.tsx

import TransactionManager from "@/app/transactions/_components/transactionManager";
import { AccountWithMembers, CategoryList, SmallProfile } from "@/schemas";
import { TabsContent } from "@/components/ui/tabs";

interface TransactionsTabProps {
    className?: string;
    categories: CategoryList;
    accounts: AccountWithMembers[];
    users: SmallProfile[];
    currentUserId: string;
}

export default async function TransactionsTab({ className,categories, accounts, users, currentUserId }: TransactionsTabProps) {

    return (
        <TabsContent value="transactions" className={className}>
            <TransactionManager
                accounts={accounts}
                users={users}
                currentUserId={currentUserId}
                categories={categories}
                className="w-full" />
        </TabsContent>
    )
}