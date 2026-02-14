// ./app/budgets/_components/budgetManager.tsx

"use client"

import { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus } from "lucide-react"

import { type CreateBudgetForm, type Budget, BudgetWithCategory } from "@/schemas"
import { getBudgetsWithCategory } from "@/app/budgets/actions"
import { Item, ItemActions, ItemContent, ItemGroup } from "@/components/ui/item"
import BudgetTable from "./budgetTable"

type BudgetManagerProps = {
    initialBudgets: BudgetWithCategory[];
    className?: string;
}


interface CategoryNode {
    id: string;
    name: string;
    budgets: BudgetWithCategory[];
    children: CategoryNode[];
    parentId: string | null;
}

export default function BudgetManager(
    {
        initialBudgets,
        className = "",
    }: BudgetManagerProps
) {
    const [budgets, setBudgets] = useState<BudgetWithCategory[]>(initialBudgets ?? [])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<BudgetWithCategory | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BudgetWithCategory | null>(null)
    const [openDelete, setOpenDelete] = useState<BudgetWithCategory | null>(null)

    async function refreshBudgets() {
        const data = await getBudgetsWithCategory()
        setBudgets(data ?? [])
    }

    function openAdd() {
        setEditing(null)
        setOpen(true)
    }

    const openEdit = (budget: BudgetWithCategory) => {
        setEditing(budget)
        setOpen(true)
    }

    async function onSubmit(values: CreateBudgetForm) {
        try {
            if (editing) {
                //await updateBudget(editing.id, values)
                toast.success("Budget updated")
            } else {
                //await insertBudget(values)
                toast.success("Budget created")
            }
            setOpen(false)
            refreshBudgets()
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        try {
            //await deleteBudget(deleteTarget.id)
            await refreshBudgets()
            toast.success("Budget deleted")
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setOpenDelete(null)
        }
    }

    // Helper function to build category tree from flat budget list
    function buildCategoryTree(budgets: BudgetWithCategory[]): CategoryNode[] {
        const categoryMap = new Map<string, CategoryNode>();

        // First pass: collect all unique categories and their budgets
        budgets.forEach((budget) => {
            if (!budget.category) return;

            const categoryId = budget.category.id;
            const parentId = budget.category.parent?.id ?? null;

            // Create or update the category node
            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    id: categoryId,
                    name: budget.category.name,
                    budgets: [],
                    children: [],
                    parentId: parentId,
                });
            }

            // Add budget to this category
            categoryMap.get(categoryId)!.budgets.push(budget);

            // Ensure parent category exists (even if it has no budgets)
            if (parentId && budget.category.parent && !categoryMap.has(parentId)) {
                categoryMap.set(parentId, {
                    id: parentId,
                    name: budget.category.parent.name,
                    budgets: [],
                    children: [],
                    parentId: null, // We don't know the grandparent from this data
                });
            }
        });

        // Second pass: build the tree structure
        const rootCategories: CategoryNode[] = [];

        categoryMap.forEach((node) => {
            if (node.parentId === null) {
                // This is a root category
                rootCategories.push(node);
            } else {
                // This is a child category - add it to its parent
                const parent = categoryMap.get(node.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Parent not found, treat as root
                    rootCategories.push(node);
                }
            }
        });

        return rootCategories;
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Budgets</CardTitle>
                    <Button size="sm" variant="secondary" onClick={openAdd}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardHeader>

                <CardContent>
                    <BudgetTable budgets={buildCategoryTree(budgets)} />
                </CardContent>
            </Card>
        </div>
    )
}