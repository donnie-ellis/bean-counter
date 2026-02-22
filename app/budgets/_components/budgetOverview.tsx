// ./app/budgets/_components/budgetOverview.tsx

'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetOverviewProps {
    totalBudget: number;
    totalSpent: number;
    month?: Date;
    className?: string;
}

export const BudgetOverview = ({ totalBudget, totalSpent, month = new Date(), className = '' }: BudgetOverviewProps) => {


    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle
                    className="text-xs uppercase tracking-widest text-muted-foreground flex justify-between items-center"
                >
                    <div>
                        {month.toLocaleString('default', { month: 'long' })} {month.getFullYear()} - All Budgets
                    </div>
                    <div>
                        ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="w-full" />
                </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between items-center pt-0">
                <div>
                    {((totalSpent / totalBudget) * 100).toFixed(0)}% of total budgets spent
                </div>
                <div>
                    ${totalBudget - totalSpent > 0 ? (totalBudget - totalSpent).toFixed(2) : '0.00'} left
                </div>
            </CardFooter>
        </Card>
)
}