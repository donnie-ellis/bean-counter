// ./app/budgets/_components/budgetForm.tsx
'use client'

import { CreateBudgetForm, CreateBudgetSchema, BudgetWithCategory, Category, BudgetPeriodSchema } from "@/schemas"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
} from "@/components/ui/select"

interface BudgetFormProps {
    budget?: BudgetWithCategory | null;
    onSubmit: (data: CreateBudgetForm) => Promise<void>
    isSubmitting?: boolean
    categories: Category[]
    isCreate?: boolean
}

export default function BudgetForm({
    budget,
    onSubmit,
    isSubmitting,
    categories,
    isCreate = true
}: BudgetFormProps) {

    const BudgetPeriodOptions = BudgetPeriodSchema.options

    const { control, handleSubmit } = useForm<CreateBudgetForm>({
        resolver: zodResolver(CreateBudgetSchema),
        defaultValues: {
            category_id: budget?.category?.id || '',
            amount: budget?.amount || 0,
            period: budget?.period || 'monthly'
        }
    })

    function getSubmitButtonText() {
        if (isSubmitting) {
            return !budget ? 'Creating...' : 'Updating...'
        }
        return !budget ? 'Create Budget' : 'Update Budget'
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
                name="category_id"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel htmlFor="budget-category">Category</FieldLabel>
                        <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={!isCreate}>
                            <SelectTrigger
                                id="category"
                                aria-invalid={fieldState.invalid}
                            >
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {!budget ? categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    )) :
                                        <SelectItem value={budget.category?.id || ''}>
                                            {budget.category?.name || 'Uncategorized'}
                                        </SelectItem>
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                name="amount"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel htmlFor="budget-amount">Amount</FieldLabel>
                        <Input
                            id="budget-amount"
                            placeholder="Budget Amount..."
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            <Controller
                name="period"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel htmlFor="budget-period">Period</FieldLabel>
                        <Select value={field.value ?? 'monthly'} onValueChange={field.onChange}>
                            <SelectTrigger
                                aria-invalid={fieldState.invalid}
                                id="period"
                            >
                                <SelectValue placeholder="Select a period..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {BudgetPeriodOptions.map((period) => (
                                        <SelectItem key={period} value={period}>
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />
            {/* Submit */}
            <div className="flex gap-4">
                <Button type="submit" variant="default" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {getSubmitButtonText()}
                </Button>
            </div>

        </form>
    )
}