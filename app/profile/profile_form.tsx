// ./app/profile/profile_form.tsx

'use client'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { logout } from '@/app/auth/logout/actions'
import { updateProfile } from './actions'
import { useState } from 'react'
import { toast } from 'sonner'
import {
    Profile,
    UpdateProfileSchema,
    type UpdateProfileForm
} from '@/schemas'

export function UpdateProfileForm({ profile }: {profile: Profile | null }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!profile) {
        toast('Profile not found');
        return null;
    };

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileForm>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
        },
    })

    const onSubmit = async (data: UpdateProfileForm) => {
        setIsSubmitting(true);
        try {
            await updateProfile(data);
            toast('Profile updated successfully');
            reset(data);
        } catch (err) {
            console.error(err);
            toast('Failed to update profile');
        }
        setIsSubmitting(false);
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-background to-muted/20'>
            <Card className='w-full max-w-2xl shadow-lg'>
                <CardHeader className='space-y-1 pb-6'>
                    <CardTitle className='text-2xl sm:text-3xl font-bold'>Your Profile</CardTitle>
                    <CardDescription className='text-sm sm:text-base'>
                        Update your profile information and manage your account
                    </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6 mt-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* First Name */}
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                                    <Input
                                        id="first_name"
                                        placeholder="e.g., John"
                                        {...field}
                                        value={field.value ?? ''}
                                        className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                        {/* Last Name */}
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                                    <Input
                                        id="last_name"
                                        placeholder="e.g., Doe"
                                        {...field}
                                        value={field.value ?? ''}
                                        className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <Separator />
                    <div className='w-full space-y-3 justify-center items-center flex flex-col'>
                        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                            Account Actions
                        </h3>
                        <Button
                            onClick={() => logout()}
                            className='text-sm font-semibold text-destructive-foreground uppercase tracking-wide'
                            variant={'destructive'}
                        >
                            Sign Out
                        </ Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
