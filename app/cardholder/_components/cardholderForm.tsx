// ./app/cardholder/_components/cardHolderForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

import { CreateCardholderForm, CreateCardholderSchema, Cardholder, Profile } from '@/schemas';

type CardholderFormProps = {
    cardHolder?: Cardholder | null;
    profiles: Profile[];
    onSubmit: (data: CreateCardholderForm) => Promise<void>;
    isSubmitting?: boolean;
    isCreate?: boolean;
}

export default function CardholderForm({
    cardHolder,
    profiles,
    onSubmit,
    isSubmitting = false,
    isCreate = true
}: CardholderFormProps) {
    const { control, handleSubmit, formState } = useForm<CreateCardholderForm>({
        resolver: zodResolver(CreateCardholderSchema),
        defaultValues: {
            name: cardHolder?.name || '',
            user_id: cardHolder?.user_id || ''
        }
    });

    const getSubmitButtonText = () => {
        if (isSubmitting) {
            return 'Submitting...';
        }
        return isCreate ? 'Create Cardholder' : 'Update Cardholder';
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel htmlFor='cardholder-name'>Name</FieldLabel>
                        <Input
                            id="cardholder-name"
                            placeholder="Cardholder Name"
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
                name="user_id"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel>Profile</FieldLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            aria-invalid={fieldState.invalid}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a profile" />
                            </SelectTrigger>
                            <SelectContent>
                                {profiles.map(profile => (
                                    <SelectItem key={profile.id} value={profile.id}>
                                        {profile.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError>{formState.errors.user_id?.message}</FieldError>
                    </Field>
                )}
            />
            <Button type="submit">{getSubmitButtonText()}</Button>
        </form>
    )

}