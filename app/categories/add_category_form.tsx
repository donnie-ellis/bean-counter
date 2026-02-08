// ./app/categories/add_category_form.tsx

'use client'

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Category, InsertCategoryForm, CreateCategorySchema } from '@/schemas';
import { toast } from 'sonner';
import { createCategory } from '@/app/categories/actions';

interface AddCategoryFormProps {
    categories: Category[];
    onCategoryAdded?: (category: Category) => void;
    onCancel?: () => void;
    showSubmitButton?: boolean;
    submitButtonText?: string;
    compact?: boolean;
}

export function AddCategoryForm({
    categories,
    onCategoryAdded,
    onCancel,
    showSubmitButton = true,
    submitButtonText = 'Add Category',
    compact = false,
}: AddCategoryFormProps) {
    const { control, handleSubmit, reset } = useForm<InsertCategoryForm>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            name: '',
            parent_id: null
        }
    });

    // Get only parent categories (top-level)
    const parentCategories = categories.filter(cat => !cat.parent_id);

    const onSubmit = async (data: InsertCategoryForm) => {
        try {
            const newCategory = await createCategory(data);
            reset();
            toast.success('Category created successfully');
            onCategoryAdded?.(newCategory);
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    if (compact) {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex-1">
                            <Input
                                id="category-name"
                                placeholder="Category name..."
                                {...field}
                                value={field.value ?? ''}
                                className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />
                <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="category-name">Category Name</FieldLabel>
                        <Input
                            id="category-name"
                            placeholder="Enter category name..."
                            {...field}
                            value={field.value ?? ''}
                            className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />

            <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                    <Field>
                        <FieldLabel htmlFor="parent-category">Parent Category (Optional)</FieldLabel>
                        <Select
                            value={field.value || undefined}
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                        >
                            <SelectTrigger id="parent-category">
                                <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Top-level category)</SelectItem>
                                {parentCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Only one level of nesting is allowed
                        </p>
                    </Field>
                )}
            />

            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                {showSubmitButton && (
                    <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        {submitButtonText}
                    </Button>
                )}
            </div>
        </form>
    );
}