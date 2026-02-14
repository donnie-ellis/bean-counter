// ./app/accounts/_components/AccountManager.tsx
'use client'

import { useState } from "react"
import AccountsTable from "@/app/accounts/_components/accountsTable"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountWithMembers, CreateAccountForm, SmallProfile } from "@/schemas"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteAccount, updateAccount, insertAccount, getAllAccountsWithMembers } from "@/app/accounts/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AccountForm } from "@/app/accounts/_components/accountForm"
import { toast } from "sonner"

type AccountManagerProps = {
    className?: string
    initialAccounts: AccountWithMembers[] | null
    profiles: SmallProfile[]
}

export default function AccountManager({
    className,
    initialAccounts,
    profiles
}: AccountManagerProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<AccountWithMembers | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<AccountWithMembers | null>(null)
    const [accounts, setAccounts] = useState<AccountWithMembers[] | []>(initialAccounts ?? [])
    const [accountsLoading, setAccountsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function refreshAccounts() {
        setAccountsLoading(true)
        const data = await getAllAccountsWithMembers()
        setAccounts(data)
        setAccountsLoading(false)
    }

    function openAdd() {
        setEditing(null)
        setOpen(true)
    }

    function openEdit(account: AccountWithMembers) {
        setEditing(account)
        setOpen(true)
    }
    async function confirmDelete() {
        if (!deleteTarget) return
        await deleteAccount(deleteTarget.id)
        await refreshAccounts()
        setDeleteTarget(null)
    }

    async function onSubmit(values: CreateAccountForm) {
        if (editing) {
            setIsSubmitting(true)
            await updateAccount(editing.id, values)
            toast.success("Account updated")
            await refreshAccounts()
            setIsSubmitting(false)
        } else {
            setIsSubmitting(true)
            await insertAccount(values)
            toast.success("Account created")
            await refreshAccounts()
            setIsSubmitting(false)
        }
        setOpen(false)
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Accounts</CardTitle>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={openAdd}
                    >
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </CardHeader>
                <CardContent>
                    <AccountsTable 
                        accounts={accounts}
                        onEdit={openEdit}
                        onDelete={(account) => setDeleteTarget(account)}
                        isLoading={accountsLoading} 
                    />
                </CardContent>
            </Card>

            {/* Edit form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Account" : "Add Account"}
                        </DialogTitle>
                    </DialogHeader>
                    <AccountForm
                        account={editing}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        isCreate={!editing}
                        profiles={profiles}
                    />
                </DialogContent>
            </Dialog>


            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete
                            <span className="font-medium"> {deleteTarget?.name}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
