'use client'
import { useState, useRef, useEffect } from "react"
import {
    CreateTransactionForm,
    Transaction,
    Account,
    SmallProfile,
    CategoryWithSpending,
    Category
} from "@/schemas"
import { deleteTransaction, insertTransaction, updateTransaction } from "@/app/transactions/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import TransactionForm from "@/app/transactions/_components/transactionForm"
import { TransactionsTable, TransactionsTableRef } from "@/app/transactions/_components/transactionsTable"
import { CreateTransactionButton } from "./createTransactionButton"

interface TransactionManagerProps {
    className?: string
    categories?: Category[] | CategoryWithSpending[]
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
    const [isMobile, setIsMobile] = useState(false)

    const tableRef = useRef<TransactionsTableRef>(null)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

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
                tableRef.current?.refetch()
            } else {
                setIsSubmitting(true)
                await insertTransaction(values)
                setIsSubmitting(false)
                toast.success("Transaction created")
                tableRef.current?.refetch()
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
            tableRef.current?.refetch()
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    const formTitle = editing ? "Edit Transaction" : "Add Transaction"

    const formContent = (
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
    )

    return (
        <>
            <main className={className}>
                <Card className="m-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Transactions</CardTitle>
                        <CreateTransactionButton
                            variant={"default"}
                            size="sm"
                            categories={categories}
                            accounts={accounts}
                            users={users}
                            currentUserId={currentUserId}
                            icon={true}
                            buttonText="Add"
                        />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <TransactionsTable
                            ref={tableRef}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            accounts={accounts}
                        />
                    </CardContent>
                </Card>
            </main>

            {/* Edit form — Drawer on mobile, Dialog on desktop */}
            {isMobile ? (
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{formTitle}</DrawerTitle>
                        </DrawerHeader>
                        <div className="px-4 pb-6">
                            {formContent}
                        </div>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{formTitle}</DialogTitle>
                        </DialogHeader>
                        {formContent}
                    </DialogContent>
                </Dialog>
            )}

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