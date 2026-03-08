import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CreateTransactionForm } from "@/schemas"
import { useState } from "react"
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form"

export default function AmountInput({
    field,
    fieldState,
    isSubmitting,
  }: {
    field: ControllerRenderProps<CreateTransactionForm, 'amount'>
    fieldState: ControllerFieldState
    isSubmitting: boolean
  }) {
    const [displayValue, setDisplayValue] = useState<string>(
      field.value != null && field.value !== 0
        ? field.value.toFixed(2)
        : ''
    )
  
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Amount</FieldLabel>
        <Input
          disabled={isSubmitting}
          inputMode="decimal"
          placeholder="$0.00"
          value={displayValue}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            const parts = raw.split('.')
            const sanitized = parts.length > 2
              ? parts[0] + '.' + parts.slice(1).join('')
              : raw
            setDisplayValue(sanitized)
            const parsed = parseFloat(sanitized)
            field.onChange(!isNaN(parsed) ? parsed : null)
          }}
          onBlur={() => {
            const parsed = parseFloat(displayValue)
            if (!isNaN(parsed)) {
              const formatted = parsed.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })
              setDisplayValue(formatted)
              field.onChange(parsed)
            } else {
              setDisplayValue('')
              field.onChange(null)
            }
            field.onBlur()
          }}
          aria-invalid={fieldState.invalid}
        />
        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
      </Field>
    )
  }