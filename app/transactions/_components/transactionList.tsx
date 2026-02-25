// ./app/transaction/_components/transactionList.tsx

'use client'

import { getCategoryList } from "@/app/categories/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryList, Transaction } from "@/schemas";

interface TransactionListProps {
    transactions: Transaction[];
    title?: string;
    numberOfTransactions?: number;
    className?: string;
    categoryList?: CategoryList;
}

const getColor = (name: string) =>
    `hsl(${name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`



export function TransactionList({ transactions, className, title="Recent Transactions", numberOfTransactions=5, categoryList }: TransactionListProps) {
    const displayedTransactions = transactions.slice(0, numberOfTransactions);

    function CategoryBadge({ categoryID }: { categoryID: string | null }) {
    if (!categoryList || !categoryID) {
        return (
            <Badge className="text-xs font-normal px-2 py-0 capitalize rounded-full border" variant="outline">Unknown</Badge>
    )};
    const category = categoryList.find(c => c.id === categoryID)
    const color = getColor(category?.name || 'Unknown')
    return (
        <Badge
            variant="outline"
            className="text-xs font-normal px-2 py-0 capitalize rounded-full border"
            style={{ 
                borderColor: color, 
                color: color,
                backgroundColor: `${color}1a`
              }}
        >
            {category?.name || 'Unknown'}
        </Badge>
    )

}
    
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex justify-between text-xs">
                    <h1 className="text-muted-foreground uppercase tracking-widest">
                       {title}
                    </h1>
                    </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {transactions.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No transactions for this month.</div>
                ) : (
                    displayedTransactions.map((t) => (
                        <div key={t.id} className="px-4 py-3 border-b last:border-b-0 flex justify-between items-center gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{t.merchant}</div>
                                <div className="text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString()}</div>
                            </div>
                            <div className="hidden md:block min-w-0 flex-1">
                                <div className="text-sm text-muted-foreground truncate">{t.description}</div>
                            </div>
                            <div className="shrink-0 pr-6">
                                <CategoryBadge categoryID={t.category_id} />
                            </div>
                            <div className={`shrink-0 font-medium text-sm tabular-nums ${t.direction === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                                ${Math.abs(t.amount).toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}