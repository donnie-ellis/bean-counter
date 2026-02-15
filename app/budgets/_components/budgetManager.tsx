// ./app/budgets/_components/budgetManager.tsx

"use client"

import { useEffect, useState } from "react"

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
import { Plus, Trash2 } from "lucide-react"

import { type CreateBudgetForm, BudgetWithCategory, Category } from "@/schemas"
import { deleteBudget, getBudgetsWithCategory, insertBudget, updateBudget } from "@/app/budgets/actions"
import BudgetTable from "./budgetTable"
import { getCategoriesWithoutBudget } from "@/app/categories/actions"
import BudgetForm from "./budgetForm"

interface BudgetManagerProps {
    initialBudgets: BudgetWithCategory[];
    className?: string;
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
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setCategories(await getCategoriesWithoutBudget())
        }

        fetchData()
    }, [budgets])

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
                setIsSubmitting(true)
                await updateBudget(editing.id, values)
                await refreshBudgets()
                setIsSubmitting(false)
                toast.success("Budget updated")
            } else {
                setIsSubmitting(true)
                await insertBudget(values)
                await refreshBudgets()
                setIsSubmitting(false)
                toast.success("Budget created")
            }
            setOpen(false)
            refreshBudgets()
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        try {
            await deleteBudget(deleteTarget)
            await refreshBudgets()
            toast.success("Budget deleted")
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    return (
        <>
            <div className={className}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Budgets</CardTitle>
                        <Button size="sm" variant="secondary" onClick={openAdd}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>

                    <CardContent>
                        <BudgetTable budgets={budgets} onDelete={setDeleteTarget} onEdit={openEdit} />
                    </CardContent>
                </Card>
            </div>
            {/* Edit form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Budget" : "Add Budget"}
                        </DialogTitle>
                    </DialogHeader>
                    <BudgetForm
                        budget={editing}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        isCreate={!editing}
                        categories={categories}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the budget.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                            <Trash2 className="ml-2 h-4 w-4" />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}