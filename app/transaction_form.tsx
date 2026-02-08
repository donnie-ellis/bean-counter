'use client'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Account, CreateTransactionSchema, CreateTransactionForm } from '@/schemas'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { use, useActionState, useEffect, useState } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { getAccounts } from '@/app/accounts/actions'
import { createClient } from '@/lib/supabase/client'

export function InsertTransactionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>();
    const [categories, setCategories] = useState();
    const [tags, setTags] = useState();
    const [cardhoders, setCardhoders] = useState();
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [cardhodersLoading, setCardhodersLoading] = useState(false);

    const supabase = createClient();
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateTransactionForm>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            cardholder_id: '',
            description: '',
            merchant: '',
            category_id: '',
            is_pending: false,
            notes: '',
        }
    });

    useEffect(() => {
        const fetchAccounts = async () => {
        setAccountsLoading(true);
            const data = await getAccounts();
            if (!data) {
                console.error('There was an error fetching accounts: ');
            } else {
                setAccounts(data);
            }
        setAccountsLoading(false);
        };
        fetchAccounts();
    }, []);

    const onSubmit = async (data: CreateTransactionForm) => {
        setIsSubmitting(true);
        setIsSubmitting(false);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Accounts */}
            <div>
                <Controller
                    name="account_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                aria-invalid={fieldState.invalid}
                            >
                                <SelectTrigger
                                    className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    id='accounts'
                                >
                                    <SelectValue placeholder='Select account' />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts && accounts.map((account: Account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />
            </div>
        </form>
    )
}