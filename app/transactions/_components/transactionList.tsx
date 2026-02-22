// ./app/transaction/_components/transactionList.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/schemas";
import { number } from "zod";

interface TransactionListProps {
    transactions: Transaction[];
    title?: string;
    numberOfTransactions?: number;
    className?: string;
}

export function TransactionList({ transactions, className, title="Recent", numberOfTransactions=5 }: TransactionListProps) {
    const displayedTransactions = transactions.slice(0, numberOfTransactions);
    
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex justify-between text-xs">
                    <h1 className="text-muted-foreground uppercase">
                       {title}
                    </h1>
                    <div>
                        See all
                    </div>
                    </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {transactions.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No transactions for this month.</div>
                ) : (
                    displayedTransactions.map((t) => (
                        <div key={t.id} className="px-4 py-2 border-b last:border-b-0 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{t.description}</div>
                                <div className="text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString()}</div>
                            </div>
                            <div className={`font-medium ${t.direction === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                                ${Math.abs(t.amount).toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}