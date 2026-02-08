"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, Trash2 } from "lucide-react"

import {
  CreateCardholderSchema,
  type CreateCardholderFormSchema,
  type Cardholder,
  type Profile,
  CreateCardholderForm,
} from "@/schemas"

import {
  insertCardholder,
  updateCardholder,
  deleteCardholder,
} from "@/app/cardholder/actions"

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

export default function CardholderManager({ cardholders, profiles, className = "" }: { cardholders: Cardholder[], profiles: Profile[], className?: string }) {

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cardholder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cardholder | null>(null)

  const form = useForm<CreateCardholderForm>({
    resolver: zodResolver(CreateCardholderSchema),
    defaultValues: { name: "", user_id: "" },
  })

  function openAdd() {
    setEditing(null)
    form.reset({ name: "", user_id: "" })
    setOpen(true)
  }

  function openEdit(cardholder: Cardholder) {
    setEditing(cardholder)
    form.reset({ name: cardholder.name, user_id: cardholder.user_id ?? "" })
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
          <div className="mt-6 space-y-1">
            {cardholders.map(ch => (
              <div
                key={ch.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span>{ch.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ch)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(ch)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Cardholder" : "Add Cardholder"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input {...field} />
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <div className="space-y-1">
                  <Label>User</Label>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.first_name} {p.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
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
