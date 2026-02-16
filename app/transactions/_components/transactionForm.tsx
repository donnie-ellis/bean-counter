// ./app/transactions/_components/TransactionForm.tsx

'use client'

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    CreateTransactionForm,
    CreateTransactionSchema,
    Transaction,
    Account,
    Category,
    SmallProfile
} from '@/schemas';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';

interface TransactionFormProps {
    transaction?: Transaction | null;
    categories: Category[];
    accounts: Account[];
    users: SmallProfile[];
    onSubmit: (data: CreateTransactionForm) => Promise<void>;
    isSubmitting?: boolean;
    isCreate?: boolean;
    isCompact?: boolean;
    currentUserId?: string;
}

export default function TransactionForm({
    transaction,
    categories,
    accounts,
    users,
    onSubmit,
    isSubmitting = false,
    isCreate = true,
    isCompact = false,
    currentUserId = ''
}: TransactionFormProps) {
    const { control, handleSubmit } = useForm<CreateTransactionForm>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            account_id: transaction?.account_id || '',
            cardholder_id: transaction?.cardholder_id ?? currentUserId,
            direction: transaction?.direction || 'debit',
            amount: transaction?.amount || 0,
            description: transaction?.description || null,
            merchant: transaction?.merchant || null,
            category_id: transaction?.category_id || null,
            occurred_at: transaction ? new Date(transaction.occurred_at) : new Date(),
            is_pending: transaction?.is_pending || false,
            notes: transaction?.notes || null,
        }
    });

    const getSubmitButtonText = () => {
        if (isSubmitting) {
            return isCreate ? 'Creating...' : 'Updating...';
        }
        return isCreate ? 'Create Transaction' : 'Update Transaction';
    }

    if (isCompact) {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                {/* Compact form fields here */}
                <Button type="submit" disabled={isSubmitting}>
                    {getSubmitButtonText()}
                </Button>
            </form>
        );
    }

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Account */}
                <Controller
                    name="account_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Account</FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger aria-invalid={fieldState.invalid}>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Category */}
                <Controller
                    name="category_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Category</FieldLabel>
                            <Select
                                value={field.value ?? ''}
                                onValueChange={(v) => field.onChange(v || null)}
                            >
                                <SelectTrigger aria-invalid={fieldState.invalid}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Cardholder */}
                <Controller
                    name="cardholder_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Cardholder</FieldLabel>
                            <Select
                                value={field.value ?? ''}
                                onValueChange={(v) => field.onChange(v || null)}
                            >
                                <SelectTrigger
                                    aria-invalid={fieldState.invalid}
                                >
                                    <SelectValue placeholder="Optional cardholder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Direction */}
                <Controller
                    name="direction"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Direction</FieldLabel>

                            <div className="flex rounded-md border overflow-hidden w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => field.onChange("debit")}
                                    className={`
                                        w-1/2 rounded-none
                                        ${field.value === "debit"
                                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            : "hover:bg-muted"
                                        }
                                      `}
                                >
                                    Debit
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => field.onChange("credit")}
                                    className={`
                                        w-1/2 rounded-none
                                        ${field.value === "credit"
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    Credit
                                </Button>
                            </div>

                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Amount */}
                <Controller
                    name="amount"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Amount</FieldLabel>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={field.value ?? ''}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value)
                                    field.onChange(value >= 0 ? value : 0)
                                }}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Occurred At */}
                <Controller
                    name="occurred_at"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Date</FieldLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal whitespace-normal h-auto py-2"
                                        aria-invalid={fieldState.invalid}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span className="break-worrds">
                                            {field.value
                                                ? format(field.value, "PPP p")
                                                : "Pick a date"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            if (!date) return
                                            const existing = field.value ?? new Date()
                                            date.setHours(existing.getHours())
                                            date.setMinutes(existing.getMinutes())
                                            field.onChange(date)
                                        }}
                                    />
                                    <div className="p-3 border-t">
                                        <Input
                                            type="time"
                                            value={field.value ? format(field.value, "HH:mm") : ""}
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(":").map(Number)
                                                const updated = new Date(field.value ?? new Date())
                                                updated.setHours(hours)
                                                updated.setMinutes(minutes)
                                                field.onChange(updated)
                                            }}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

            </div>

            {/* Full Width Fields */}
            <div className="space-y-6">

                {/* Description */}
                <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Description</FieldLabel>
                            <Input
                                placeholder="Transaction description..."
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Merchant */}
                <Controller
                    name="merchant"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Merchant</FieldLabel>
                            <Input
                                placeholder="Merchant name..."
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

                {/* Notes */}
                <Controller
                    name="notes"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Notes</FieldLabel>
                            <Textarea
                                placeholder="Optional notes..."
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )}
                />

            </div>
            <div className="flex gap-2 justify-end">
                <Button type="submit" className="w-full">
                    {getSubmitButtonText()}
                </Button>
            </div>
        </form>
    );
}

