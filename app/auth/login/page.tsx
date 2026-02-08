// ./app/auth/login/page.tsx

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleLogin = async (data: { email: string }) => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Check your email for the login link.')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Sign In
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your email to receive a magic link
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="signinForm"
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="responsive"
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >

                    <Input
                      {...field}
                      id="signinForm-email"
                      type="email"
                      placeholder="your@email.com"
                      disabled={loading}
                      required
                      className="h-10 mt-6"
                      autoComplete="email"
                      autoFocus
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-sm">
                        {fieldState.error?.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              form="signinForm"
              disabled={loading}
              className="w-full h-10"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Sending...
                </span>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}