// ./app/accounts/accountForm.tsx

'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { CreateAccountFormSchema, type CreateAccountForm, SmallProfile, AccountWithMembers, AccountRole } from '@/schemas'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface AccountFormProps {
    account?: AccountWithMembers | null;
    profiles: SmallProfile[];
    onSubmit: (data: CreateAccountForm) => Promise<void>;
    isSubmitting?: boolean;
    isCreate?: boolean;
    isCompact?: boolean;
}

export function AccountForm({ 
    account,
    profiles,
    onSubmit,
    isSubmitting = false,
    isCreate = true,
    isCompact = false
}: AccountFormProps ) {

    const { control, handleSubmit, watch } = useForm<CreateAccountForm>({
        resolver: zodResolver(CreateAccountFormSchema),
        defaultValues: {
            name: account ? account.name : '',
            type: account ? account.type : 'checking',
            institution: account ? account.institution : '',
            credit_limit: account ? account.credit_limit : null,
            is_active: account ? account.is_active : true,
            account_members: account?.account_members?.map(member => ({
                user_id: member.user_id,
                role: member.role,
            })) ?? [],
        },
    });

    const accountType = watch('type')

    function getSubmitButtonText() {
        if (isSubmitting) {
            return isCreate ? 'Creating...' : 'Updating...'
        }
        return isCreate ? 'Create Account' : 'Update Account'
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

            {/* Account Members (with role selection) */}
            <Controller
                name="account_members"
                control={control}
                render={({ field }) => {
                    const value = field.value ?? []
                    
                    const handleSwitchChange = (profileId: string, checked: boolean) => {
                        if (checked) {
                            // Add member with default 'viewer' role
                            const existingMember = value.find(m => m.user_id === profileId)
                            if (!existingMember) {
                                field.onChange([...value, {
                                    id: crypto.randomUUID(),
                                    user_id: profileId,
                                    role: 'viewer' as AccountRole
                                }])
                            }
                        } else {
                            // Remove member
                            field.onChange(value.filter(m => m.user_id !== profileId))
                        }
                    }
                    
                    const handleRoleChange = (profileId: string, role: AccountRole) => {
                        field.onChange(value.map(m => 
                            m.user_id === profileId ? { ...m, role } : m
                        ))
                    }
                    
                    return (
                        <FieldSet>
                            <FieldLegend>Account Members & Roles</FieldLegend>
                            <FieldDescription>Select users who can access this account and assign their roles.</FieldDescription>
                            <FieldGroup>
                                <div className='space-y-2 mt-2'>
                                    {profiles.map((profile) => {
                                        const member = value.find(m => m.user_id === profile.id)
                                        const isSelected = !!member
                                        
                                        return (
                                            <div key={profile.id} className='space-y-3'>
                                                {/* User Selection */}
                                                <Field orientation="horizontal" className='flex items-center justify-between'>
                                                    <FieldLabel 
                                                        htmlFor={`account_member_${profile.id}`}
                                                        className='font-medium'
                                                    >
                                                        {profile.first_name} {profile.last_name}
                                                    </FieldLabel>
                                                    <Switch
                                                        id={`account_member_${profile.id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => 
                                                            handleSwitchChange(profile.id, checked)
                                                        }
                                                    />
                                                </Field>
                                                
                                                {/* Role Selection (only shown when user is selected) */}
                                                {isSelected && (
                                                    <div className='ml-6 pl-4 border-l-2 pb-2'>
                                                        <FieldLabel className='text-sm mb-2 block text-muted-foreground'>Role</FieldLabel>
                                                        <RadioGroup
                                                            value={member.role}
                                                            onValueChange={(role) => 
                                                                handleRoleChange(profile.id, role as AccountRole)
                                                            }
                                                            className='space-y-2'
                                                        >
                                                            <Field orientation="horizontal" className='flex items-center gap-2'>
                                                                <RadioGroupItem 
                                                                    value="owner" 
                                                                    id={`role_owner_${profile.id}`}
                                                                />
                                                                <FieldLabel 
                                                                    htmlFor={`role_owner_${profile.id}`}
                                                                    className='font-normal cursor-pointer'
                                                                >
                                                                    Owner
                                                                </FieldLabel>
                                                                <FieldDescription className='ml-auto text-xs'>
                                                                    Full access
                                                                </FieldDescription>
                                                            </Field>
                                                            <Field orientation="horizontal" className='flex items-center gap-2'>
                                                                <RadioGroupItem 
                                                                    value="editor" 
                                                                    id={`role_editor_${profile.id}`}
                                                                />
                                                                <FieldLabel 
                                                                    htmlFor={`role_editor_${profile.id}`}
                                                                    className='font-normal cursor-pointer'
                                                                >
                                                                    Editor
                                                                </FieldLabel>
                                                                <FieldDescription className='ml-auto text-xs'>
                                                                    Can modify
                                                                </FieldDescription>
                                                            </Field>
                                                            <Field orientation="horizontal" className='flex items-center gap-2'>
                                                                <RadioGroupItem 
                                                                    value="viewer" 
                                                                    id={`role_viewer_${profile.id}`}
                                                                />
                                                                <FieldLabel 
                                                                    htmlFor={`role_viewer_${profile.id}`}
                                                                    className='font-normal cursor-pointer'
                                                                >
                                                                    Viewer
                                                                </FieldLabel>
                                                                <FieldDescription className='ml-auto text-xs'>
                                                                    Read only
                                                                </FieldDescription>
                                                            </Field>
                                                        </RadioGroup>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
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

            {/* Active Switch */}
            <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                    <Field orientation="horizontal" className='flex items-center justify-between'>
                        <FieldLabel htmlFor='is_active'>Enable the account</FieldLabel>
                        <Switch
                            id="is_active"
                            checked={field.value}
                            onCheckedChange={(val) => field.onChange(val)}
                        />
                    </Field>
                )}
            />

            {/* Submit */}
            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {getSubmitButtonText()}
                </Button>
            </div>
        </form>
    )
}