"use client"

import { useState } from "react"

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
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"

import {
  type Cardholder,
  type Profile,
  CreateCardholderForm,
} from "@/schemas"

import {
  insertCardholder,
  updateCardholder,
  deleteCardholder,
} from "@/app/cardholder/actions"

import { Item, ItemActions, ItemContent, ItemGroup } from "@/components/ui/item"
import CardholderForm from "@/app/cardholder/_components/cardholderForm"

type CardholderManagerProps = {
  cardholders: Cardholder[];
  profiles: Profile[];
  className?: string;
}

export default function CardholderManager({ 
  cardholders,
  profiles,
  className = "",
}: CardholderManagerProps) {

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cardholder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cardholder | null>(null)
  
  function openAdd() {
    setEditing(null)
    //form.reset({ name: "", user_id: "" })
    setOpen(true)
  }

  function openEdit(cardholder: Cardholder) {
    setEditing(cardholder)
    //form.reset({ name: cardholder.name, user_id: cardholder.user_id ?? "" })
    setOpen(true)
  }

  async function onSubmit(values: CreateCardholderForm) {
    try {
      if (editing) {
        await updateCardholder(editing.id, values)
        toast.success("Cardholder updated")
      } else {
        await insertCardholder(values)
        toast.success("Cardholder created")
      }
      setOpen(false)
    } catch (error) {
      toast.error("An error occurred.")
      console.error(error);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteCardholder(deleteTarget.id)
      toast.success(`Cardholder "${deleteTarget.name}" deleted.`)
      setDeleteTarget(null)
    } catch (error) {
      toast.error("An error occurred.")
      console.error(error);
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cardholders</CardTitle>
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          <ItemGroup className="mt-6 space-y-1">
            {cardholders.map(ch => (
              <Item
                key={ch.id}
                className="flex items-center justify-between px-3 py-2"
                variant="outline"
              >
                <ItemContent>
                  <span>{ch.name}</span>
                </ItemContent>
                <ItemActions className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ch)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(ch)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Cardholder" : "Add Cardholder"}
            </DialogTitle>
          </DialogHeader>
            <CardholderForm
              cardHolder={editing}
              profiles={profiles}
              onSubmit={onSubmit}
              isSubmitting={false}
            />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cardholder?</AlertDialogTitle>
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
