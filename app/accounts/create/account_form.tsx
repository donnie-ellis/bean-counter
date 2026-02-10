// ./app/accounts/add_account_form.tsx

'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CreateAccountSchema, type CreateAccountForm, Account } from '@/schemas'
import { insertAccount } from '@/app/accounts/actions'
import { getCardholders } from '@/app/cardholder/actions'
import { Checkbox } from '@/components/ui/checkbox'

interface AddAccountFormProps {
    accounts: Account[];
    onAccountAdded?: (account: Account) => void;
    onCancel?: () => void;
    showSubmitButton?: boolean;
    submitButtonText?: string;
    compact?: boolean;
}

export function CreateAccountForm({ 
    accounts,
    onAccountAdded,
    onCancel,
    showSubmitButton = true,
    submitButtonText = 'Create Account',
    compact = false 
}: AddAccountFormProps ) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cardholders, setCardholders] = useState<{ id: string; name: string }[]>([])

    const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<CreateAccountForm>({
        resolver: zodResolver(CreateAccountSchema),
        defaultValues: {
            name: '',
            type: 'checking',
            institution: '',
            credit_limit: null,
            is_active: true,
            cardholder_id: null,
            account_member_ids: [],
        },
    })

    const accountType = watch('type')
    const primaryCardholderId = watch('cardholder_id')
    const accountMemberIds = watch('account_member_ids')

    // Fetch cardholders
    useEffect(() => {
        async function fetchCardholders() {
            const data = await getCardholders()
            if (!data) {
                console.error('Error fetching cardholders:')
                toast.error('Error fetching cardholders')
                return
            }
            setCardholders(data)
        }
        fetchCardholders()
    }, [])

    //Auto select member when primary is changed
    useEffect(() => {
        if (!primaryCardholderId) return;
        const safeMembers: string[] = Array.isArray(accountMemberIds) ? accountMemberIds : []

        if (!safeMembers.includes(primaryCardholderId)) {
            setValue('account_member_ids', [...safeMembers, primaryCardholderId])
        }
    }, [primaryCardholderId]);

    const onSubmit = async (data: CreateAccountForm) => {
        setIsSubmitting(true)
        const result = await insertAccount(data)
        if (!result) {
            console.error('Error saving account')
            toast.error('Error saving account')
            setIsSubmitting(false)
            return
        }
        toast.success('Account created successfully')
        reset()
        setIsSubmitting(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name */}
            <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='flex-1'>
                        <FieldLabel htmlFor="name">Account Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="e.g., My Checking Account"
                            {...field}
                            value={field.value ?? ''}
                            className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />

                    {/* Account Type */}
                    <Controller
                        name="type"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="type">Account Type</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger
                                        id="type"
                                        className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    >
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="checking">Checking</SelectItem>
                                        <SelectItem value="savings">Savings</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="investment">Investment</SelectItem>
                                        <SelectItem value="loan">Loan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    {/* Primary Cardholder */}
                    <Controller
                        name="cardholder_id"
                        control={control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel htmlFor="cardholder_id">Primary Cardholder</FieldLabel>
                                <Select
                                    value={field.value ?? ''}
                                    onValueChange={(val) => field.onChange(val === '' ? null : val)}
                                >
                                    <SelectTrigger id="cardholder_id">
                                        <SelectValue placeholder="Select cardholder (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="-- None --">None</SelectItem>
                                        {cardholders.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />

                    {/* Account Members (multi-select) */}
                    <Controller
                        name="account_member_ids"
                        control={control}
                        render={({ field }) => {
                            const value = field.value ?? []
                            return (
                                <FieldSet>
                                    <FieldLegend>Assign Account Members</FieldLegend>
                                    <FieldDescription>Optional: select additional users who can access this account.</FieldDescription>
                                    <FieldGroup>
                                        <Field orientation="responsive" className='flex flex-wrap gap-3'>
                                            {cardholders.map((c) => (
                                                <div key={c.id} className='flex items-center gap-2 flex-none'>
                                                    <Checkbox
                                                        key={c.id}
                                                        id={`account_member_${c.id}`}
                                                        checked={value.includes(c.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (c.id === primaryCardholderId && !checked) {
                                                                toast.warning('Primary cardholder cannot be removed from account members');
                                                                return;
                                                            }
                                                            if (checked) {
                                                                if (!value.includes(c.id)) {
                                                                    field.onChange([...value, c.id])
                                                                }
                                                            } else {
                                                                field.onChange(field.value?.filter((id) => id !== c.id))
                                                            }
                                                        }}
                                                    />
                                                    <FieldLabel htmlFor={`account_member_${c.id}`}>{c.name}</FieldLabel>
                                                </div>
                                            ))}
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            );
                        }}
                    />

                    {/* Institution */}
                    <Controller
                        name="institution"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="institution">Institution</FieldLabel>
                                <Input
                                    id="institution"
                                    placeholder="e.g., Bank of America"
                                    {...field}
                                    value={field.value ?? ''}
                                    className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    {/* Credit Limit */}
                    {accountType === 'credit_card' && (
                        <Controller
                            name="credit_limit"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="credit_limit">Credit Limit</FieldLabel>
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 5000"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            field.onChange(val === '' ? null : Number(val))
                                        }}
                                        className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">Maximum credit limit for this card</p>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    )}

                    {/* Active Checkbox */}
                    <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                            <Field className='flex flex-wrap'>
                                <div className='flex items-center gap-2 flex-none'>
                                    <Checkbox
                                        id="is_active"
                                        checked={field.value}
                                        onCheckedChange={(val) => field.onChange(val)}
                                    />
                                    <FieldLabel htmlFor='is_active'>Enable the account</FieldLabel>
                                </div>
                            </Field>
                        )}
                    />

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
                            Reset
                        </Button>
                    </div>
                </form>
    )
}
