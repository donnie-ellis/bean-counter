// ./app/tags/_components/tagForm.tsx

'use client'

import { CreateTagSchema, Tag, type CreateTagForm } from "@/schemas"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Loader2 } from "lucide-react"

type TagFormProps = {
    tag?: Tag | null;
    onSubmit: (data: CreateTagForm) => Promise<void>
    isSubmitting?: boolean
}

export default function TagForm({
    tag,
    onSubmit,
    isSubmitting = false,
}: TagFormProps) {
    const { control, handleSubmit } = useForm<CreateTagForm>({
        resolver: zodResolver(CreateTagSchema),
        defaultValues: {
            name: tag?.name || '',
        }
    })

    function getSubmitButtonText() {
        if (isSubmitting) {
            return tag ? "Updating..." : "Creating..."
        }
        return tag ? "Update Tag" : "Create Tag"
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                        <FieldLabel htmlFor="tag-name">Tag Name</FieldLabel>
                        <Input
                            id="tag-name"
                            placeholder="Tag Name..."
                            {...field}
                            value={field.value ?? ''}
                            className={fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : ""}
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </Field>
                )}
            />

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getSubmitButtonText()}
            </Button>
        </form>
    )
}
