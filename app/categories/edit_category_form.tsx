// ./app/categories/edit_category_form.tsx

'use client'

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Category, UpdateCategorySchema } from '@/schemas';
import { toast } from 'sonner';
import { updateCategory } from '@/app/categories/actions';

interface EditCategoryFormProps {
    category: Category;
    categories: Category[];
    mode: 'inline' | 'modal';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCategoryUpdated?: (category: Category) => void;
    onCancel?: () => void;
}

export function EditCategoryForm({
    category,
    categories,
    mode,
    open = true,
    onOpenChange,
    onCategoryUpdated,
    onCancel,
}: EditCategoryFormProps) {
    const [editValue, setEditValue] = useState(category.name);
    const [editParentId, setEditParentId] = useState<string | null>(category.parent_id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get only parent categories (top-level) excluding current category
    const parentCategories = categories.filter(cat => !cat.parent_id && cat.id !== category.id);

    // Check if category has children
    const hasChildren = categories.some(cat => cat.parent_id === category.id);

    useEffect(() => {
        setEditValue(category.name);
        setEditParentId(category.parent_id);
    }, [category]);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            const validation = UpdateCategorySchema.safeParse({
                name: editValue,
                parent_id: editParentId
            });

            if (!validation.success) {
                toast.warning(validation.error.issues[0].message);
                return;
            }

            const updatedCategory = await updateCategory(category.id, {
                name: editValue,
                parent_id: editParentId
            });

            toast.success('Category updated successfully');
            onCategoryUpdated?.(updatedCategory);

            if (mode === 'modal') {
                onOpenChange?.(false);
            }
        } catch (error) {
            toast.error('Failed to update category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setEditValue(category.name);
        setEditParentId(category.parent_id);

        if (mode === 'modal') {
            onOpenChange?.(false);
        } else {
            onCancel?.();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const formContent = (
        <div className="space-y-4">
            <Field>
                <FieldLabel htmlFor="edit-category-name">Category Name</FieldLabel>
                <Input
                    id="edit-category-name"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Category name"
                    autoFocus={mode === 'modal'}
                    onKeyDown={handleKeyDown}
                />
            </Field>

            <Field>
                <FieldLabel htmlFor="edit-parent-category">Parent Category</FieldLabel>
                <Select
                    value={editParentId || 'none'}
                    onValueChange={(value) => setEditParentId(value === 'none' ? null : value)}
                    disabled={hasChildren}
                >
                    <SelectTrigger id="edit-parent-category">
                        <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (Top-level)</SelectItem>
                        {parentCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasChildren && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Cannot change parent while this category has subcategories
                    </p>
                )}
            </Field>
        </div>
    );

    if (mode === 'modal') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category name or change its parent category.
                        </DialogDescription>
                    </DialogHeader>
                    {formContent}
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Inline mode
    return (
        <div className="flex items-start gap-2 flex-1">
            <div className="flex-1 space-y-2">
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Category name"
                    autoFocus
                    onKeyDown={handleKeyDown}
                />
                <Select
                    value={editParentId || 'none'}
                    onValueChange={(value) => setEditParentId(value === 'none' ? null : value)}
                    disabled={hasChildren}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (Top-level)</SelectItem>
                        {parentCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasChildren && (
                    <p className="text-xs text-muted-foreground">
                        Cannot change parent while this category has subcategories
                    </p>
                )}
            </div>
            <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                disabled={isSubmitting}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}