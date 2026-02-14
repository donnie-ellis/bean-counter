import React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { BudgetWithCategory } from "@/schemas"
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash } from "lucide-react";

interface BudgetTableProps {
    budgets: CategoryNode[];
        onEdit?: (budget: BudgetWithCategory) => void;
        onDelete?: (budget: BudgetWithCategory) => void;
        isLoading?: boolean;
        className?: string;
}


interface CategoryNode {
    id: string;
    name: string;
    budgets: BudgetWithCategory[];
    children: CategoryNode[];
    parentId: string | null;
}

export default function BudgetTable({
    budgets,
    onEdit,
    onDelete,
    isLoading = false,
    className,
}: BudgetTableProps) {

    // Helper function to format budget amount with period
    function formatBudgetAmount(amount: number, period: BudgetWithCategory["period"]): string {
        return `$${amount.toFixed(2)}/${period}`;
    }

    function CategoryRows({
        nodes,
        depth = 0
    }: {
        nodes: CategoryNode[];
        depth?: number;
    }) {
        return (
            <>
                {nodes.map((node) => (
                    <React.Fragment key={node.id}>
                        {/* Parent Category Row */}
                        <TableRow className="font-medium bg-muted/50">
                            <TableCell style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
                                {depth > 0 && "↳ "}
                                {node.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {node.budgets.length > 0
                                    ? `${node.budgets.length} budget${node.budgets.length > 1 ? 's' : ''}`
                                    : 'No budgets'}
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>

                        {/* Budget Rows for this category */}
                        {node.budgets.map((budget) => (
                            <TableRow key={budget.id}>
                                <TableCell
                                    style={{ paddingLeft: `${depth * 2 + 2.5}rem` }}
                                    className="text-muted-foreground"
                                >
                                    • Budget
                                </TableCell>
                                <TableCell>{budget.period}</TableCell>
                                <TableCell>{formatBudgetAmount(budget.amount, budget.period)}</TableCell>
                                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit && onEdit(budget)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete && onDelete(budget)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                            </TableRow>
                        ))}

                        {/* Recursively render children */}
                        {node.children.length > 0 && (
                            <CategoryRows nodes={node.children} depth={depth + 1} />
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    }
    if (budgets.length === 0) {
        return <div>No budgets found.</div>;
    }

    return (
        <div className={className}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Category</TableHead>
                        <TableHead className="w-[20%]">Period</TableHead>
                        <TableHead className="w-[20%]">Amount</TableHead>
                        <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <CategoryRows nodes={budgets} />
                </TableBody>
            </Table>
        </div>
    );

}