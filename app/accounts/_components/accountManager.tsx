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
import { Account, Cardholder, CreateAccountForm } from "@/schemas"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteAccount, updateAccount, insertAccount } from "@/app/accounts/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AccountForm } from "@/app/accounts/_components/accountForm"

type AccountManagerProps = {
    className?: string
    accounts: Account[]
    cardholders: Cardholder[]
}

export default function AccountManager({
    className,
    accounts,
    cardholders
}: AccountManagerProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Account | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)

    function openAdd() {
        setEditing(null)
        /* form.reset({ name: "", parent_id: parent ?? null }) */
        setOpen(true)
    }

    function openEdit(account: Account) {
        setEditing(account)
        /* form.reset({ name: category.name, parent_id: category.parent_id }) */
        setOpen(true)
    }
    async function confirmDelete() {
        if (!deleteTarget) return
        await deleteAccount(deleteTarget.id)
        setDeleteTarget(null)
    }

    async function onSubmit(values: CreateAccountForm) {
        if (editing) {
            await updateAccount(editing.id, values)
        } else {
            await insertAccount(values)
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
                        <Plus className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <AccountsTable accounts={accounts} onEdit={openEdit} onDelete={confirmDelete} />
                </CardContent>
            </Card>

            {/* Edit form */}
            <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Cardholder" : "Add Cardholder"}
            </DialogTitle>
          </DialogHeader>
            <AccountForm
              account={editing}
              onSubmit={onSubmit}
              isSubmitting={false}
              isCreate={!editing}
              cardholders={cardholders}
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
