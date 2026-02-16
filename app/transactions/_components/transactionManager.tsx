// ./app/transactions/_components/transactionManager.tsx

'use client'
import { useState } from "react"
import {
    CreateTransactionForm,
    Transaction,
    Category,
    Account,
    SmallProfile
} from "@/schemas"
import { deleteTransaction, insertTransaction, updateTransaction } from "@/app/transactions/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import TransactionForm from "@/app/transactions/_components/transactionForm"
import { TransactionsTable } from "./transactionsTable"
import { DialogDescription } from "@base-ui/react"

interface TransactionManagerProps {
    className?: string
    categories?: Category[]
    accounts?: Account[]
    users?: SmallProfile[]
    currentUserId?: string
}

export default function TransactionManager({
    className = '',
    categories = [],
    accounts = [],
    users = [],
    currentUserId = ''
}: TransactionManagerProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Transaction | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    function openAdd() {
        setEditing(null)
        setOpen(true)
    }

    const openEdit = (transaction: Transaction) => {
        setEditing(transaction)
        setOpen(true)
    }

    async function onSubmit(values: CreateTransactionForm) {
        try {
            if (editing) {
                setIsSubmitting(true)
                await updateTransaction(editing.id, values)
                setIsSubmitting(false)
                toast.success("Transaction updated")
            } else {
                setIsSubmitting(true)
                await insertTransaction(values)
                setIsSubmitting(false)
                toast.success("Transaction created")
            }
            setOpen(false)
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        try {
            await deleteTransaction(deleteTarget)
            setDeleteTarget(null)
            toast.success("Transaction deleted")
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    return (
        <>
            <main className={className}>
                <Card className="m-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Transactions</CardTitle>
                        <Button size="sm" variant="secondary" onClick={openAdd}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <TransactionsTable
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            accounts={accounts}
                        />
                    </CardContent>
                </Card>
                {/* Implement UI for listing, adding, editing, and deleting transactions */}
            </main>

            {/* Edit form */}
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogContent className="sm:max-w-md">
                    
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Transaction" : "Add Transaction"}
                        </DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        transaction={editing}
                        categories={categories}
                        accounts={accounts}
                        users={users}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        isCreate={!editing}
                        currentUserId={currentUserId}
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
