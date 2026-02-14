// ./app/categories/_components/categoryManager.tsx
'use client'

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"

import {
    type InsertCategoryForm,
    type Category,
} from "@/schemas"

import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/app/categories/actions"
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
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item"
import CategoryForm from "@/app/categories/_components/categoryForm"

interface CategoryNode extends Category {
    children?: CategoryNode[]
}

function buildTree(categories: Category[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    categories.forEach(c => map.set(c.id, { ...c, children: [] }))

    map.forEach(cat => {
        if (cat.parent_id) {
            map.get(cat.parent_id)?.children?.push(cat)
        } else {
            roots.push(cat)
        }
    })

    return roots
}

export default function CategoryManager({ categories, className = "" }: { categories: Category[], className?: string }) {
    const tree = useMemo(() => buildTree(categories), [categories])

    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [parentId, setParentId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

    function openAdd(parent?: string) {
        setEditing(null)
        setParentId(parent ?? null)
        /* form.reset({ name: "", parent_id: parent ?? null }) */
        setOpen(true)
    }

    function openEdit(category: Category) {
        setEditing(category)
        setParentId(category.parent_id)
        /* form.reset({ name: category.name, parent_id: category.parent_id }) */
        setOpen(true)
    }

    async function onSubmit(values: InsertCategoryForm) {
        if (editing) {
            await updateCategory(editing.id, values)
        } else {
            await createCategory(values)
        }
        setOpen(false)
    }

    async function confirmDelete() {
        if (!deleteTarget) return
        await deleteCategory(deleteTarget.id)
        setDeleteTarget(null)
    }

    return (
        <div className={className}>
            <Card className="">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Categories</CardTitle>
                    <Button size="sm" variant="secondary" onClick={() => openAdd()}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardHeader>

                <CardContent className="space-y-2">
                    <ItemGroup className="mt-6 space-y-1">
                        {tree.map(cat => (
                            <Collapsible key={cat.id} defaultOpen={false}>
                                <Item className="flex items-center justify-between border px-3 py-2" variant="outline">
                                    <ItemMedia>
                                        {cat.children && cat.children.length > 0 ? (
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="icon" className="data-[state=open]:rotate-90 transition">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </CollapsibleTrigger>
                                        ) : (
                                            <span className="w-8" />
                                        )}
                                    </ItemMedia>
                                    <ItemContent className="flex gap-2">
                                        <span className="font-medium">{cat.name}</span>
                                    </ItemContent>
                                    <ItemActions className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openAdd(cat.id)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </ItemActions>
                                </Item>
                                        
                                {cat.children && cat.children.length > 0 && (
                                    <CollapsibleContent>
                                        <ItemGroup className="ml-8 mt-1 space-y-1">
                                            {cat.children.map(child => (
                                                <Item
                                                    key={child.id}
                                                    className="flex items-center justify-between px-3 py-2"
                                                    variant="outline"
                                                >
                                                    <ItemContent>
                                                        <span>{child.name}</span>
                                                    </ItemContent>
                                                    <ItemActions className="flex gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(child)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))}
                                        </ItemGroup>
                                    </CollapsibleContent>
                                )}
                            </Collapsible>
                        ))}
                    </ItemGroup>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Category" : parentId ? "Add Subcategory" : "Add Category"}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        isCompact={false}
                        isCreate={!editing}
                        categories={categories}
                        category={editing}
                        onSubmit={onSubmit}
                        isSubmitting={false}
                        parentId={parentId}
                        />
                </DialogContent>
            </Dialog>

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
