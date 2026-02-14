// ./app/tags/_components/tagManager.tsx
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
import { Pencil, Plus, Trash2 } from "lucide-react"

import { type CreateTagForm, type Tag } from "@/schemas"
import { insertTag, updateTag, deleteTag } from "@/app/tags/actions"
import { Item, ItemActions, ItemContent, ItemGroup } from "@/components/ui/item"
import TagForm from "@/app/tags/_components/tagForm"

type TagManagerProps = {
    tags: Tag[];
    className?: string;
}


export default function TagManager({
    tags,
    className = "",
}: TagManagerProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Tag | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null)

    function openAdd() {
        setEditing(null)
        //form.reset({ name: "" })
        setOpen(true)
    }

    function openEdit(tag: Tag) {
        setEditing(tag)
        //form.reset({ name: tag.name })
        setOpen(true)
    }

    async function onSubmit(values: CreateTagForm) {
        try {
            if (editing) {
                await updateTag(editing.id, values)
                toast.success("Tag updated successfully")
            } else {
                await insertTag(values)
                toast.success("Tag created successfully")
            }
            setOpen(false)
        } catch (error) {
            toast.error(`Failed to ${editing ? "update" : "create"} tag`)
            console.error(error)
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        try {
            await deleteTag(deleteTarget.id)
            toast.success("Tag deleted successfully")
            setDeleteTarget(null)
        } catch (error) {
            toast.error("Failed to delete tag")
            console.error(error)
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tags</CardTitle>
                    <Button size="sm" variant="secondary" onClick={openAdd}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardHeader>

                <CardContent>
                    <ItemGroup className="mt-6 space-y-2">
                        {tags.map(tag => (
                            <Item
                                key={tag.id}
                                className="flex items-center justify-between px-3 py-2"
                                variant="outline"
                            >
                                <ItemContent>
                                    <span className="font-medium">{tag.name}</span>
                                </ItemContent>
                                <ItemActions className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(tag)}>
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
                        <DialogTitle>{editing ? "Edit Tag" : "Add Tag"}</DialogTitle>
                    </DialogHeader>

                    <TagForm
                        tag={editing}
                        onSubmit={onSubmit}
                        isSubmitting={false}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete tag?</AlertDialogTitle>
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