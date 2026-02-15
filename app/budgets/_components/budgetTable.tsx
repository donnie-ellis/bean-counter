import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { BudgetTreeNode, BudgetWithCategory } from "@/schemas"
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { buildBudgetTree, convertBudgetTreeNodeToBudgetWithCategory, formatCurrency, getBudgetCountDisplay } from "@/lib/budget";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";

interface BudgetTableProps {
    budgets: BudgetWithCategory[];
    onEdit?: (budget: BudgetWithCategory) => void;
    onDelete?: (budgetId: string) => void;
    isLoading?: boolean;
    className?: string;
}

export default function BudgetTable({
    budgets,
    onEdit,
    onDelete,
    isLoading = false,
    className,
}: BudgetTableProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set()
    );

    const tree = buildBudgetTree(budgets);

    const toggleExpanded = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };
    return (
        <div className={className}>
            {tree.map(node => (
                <BudgetTreeRow
                    key={node.categoryId ?? "uncategorized"}
                    node={node}
                    level={0}
                    expandedCategories={expandedCategories}
                    onToggleExpanded={toggleExpanded}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );

    // ============================================================================
    // ROW COMPONENT
    interface BudgetTreeRowProps {
        node: BudgetTreeNode;
        level: number;
        expandedCategories: Set<string>;
        onToggleExpanded: (categoryId: string) => void;
        onEdit?: (budget: BudgetWithCategory) => void;
        onDelete?: (budgetId: string) => void;
    }

    function BudgetTreeRow({
        node,
        level,
        expandedCategories,
        onToggleExpanded,
        onEdit,
        onDelete,
    }: BudgetTreeRowProps) {
        const hasChildren = node.children.length > 0;
        const isExpanded = node.categoryId
            ? expandedCategories.has(node.categoryId)
            : false;

        return (
            <div style={{ paddingLeft: `${level * 1.5}rem` }}>
                {/* Parent/Category Row */}
                <Item
                    variant={level === 0 ? "outline" : "default"}
                >
                    {/* Expand/Collapse Button */}
                    {hasChildren && (
                        <ItemMedia variant="icon">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    node.categoryId && onToggleExpanded(node.categoryId)
                                }
                                className="h-8 w-8 p-0"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        </ItemMedia>
                    )}

                    {/* Category Name & Budget Info */}
                    <ItemContent>
                        <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <ItemTitle className={hasChildren ? "text-base font-semibold" : "text-base"}>
                                        {node.categoryName}
                                    </ItemTitle>

                                    {hasChildren && (
                                        <Badge variant="secondary" className="text-xs">
                                            {node.children.length} subcategor{node.children.length === 1 ? 'y' : 'ies'}
                                        </Badge>
                                    )}
                                </div>

                                <ItemDescription className="mt-1">
                                    {getBudgetCountDisplay(node)}
                                </ItemDescription>
                            </div>

                            {/* Amount */}
                            <div className="text-right shrink-0">
                                <div className={`${hasChildren ? "text-lg font-bold" : "text-base font-semibold"}`}>
                                    {formatCurrency(node.totalAmount)}
                                    <span className="text-xs text-muted-foreground font-normal ml-1">
                                        /mo
                                    </span>
                                </div>

                                {node.children.length > 0 && node.directAmount > 0 && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {formatCurrency(node.directAmount)} direct
                                    </div>
                                )}
                            </div>
                        </div>
                    </ItemContent>

                    {/* Actions */}
                    <ItemActions>
                        <BudgetActionsMenu
                            budgets={node.budgets}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            node={node}
                        />
                    </ItemActions>
                </Item>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="mt-2 space-y-2">
                        {node.children.map(child => (
                            <BudgetTreeRow
                                key={child.categoryId ?? "uncategorized"}
                                node={child}
                                level={level + 1}
                                expandedCategories={expandedCategories}
                                onToggleExpanded={onToggleExpanded}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ============================================================================
    // ACTIONS MENU COMPONENT
    interface BudgetActionsMenuProps {
        budgets: Array<{ id: string; period: string; amount: number }>;
        onEdit?: (budget: BudgetWithCategory) => void;
        onDelete?: (budgetId: string) => void;
        node: BudgetTreeNode;
    }

    function BudgetActionsMenu({ onEdit, onDelete, node }: BudgetActionsMenuProps) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit && onEdit(convertBudgetTreeNodeToBudgetWithCategory(node))}>
                            <Pencil className="ml-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete && onDelete(node.budgets[0].id)}
                            className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        >
                            <Trash2 className="ml-2 h-4 w-4 text-destructive" />
                            Delete
                        </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

    }
}