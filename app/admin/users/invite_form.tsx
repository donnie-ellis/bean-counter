// ./app/admin/users/invite_form.tsx

'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { inviteUser } from "@/app/admin/users/actions"
import { toast } from "sonner"

export default function InviteForm() {
    const [inviteEmail, setInviteEmail] = useState('')
    const [isInviting, setIsInviting] = useState(false)

    const handleInvite = async () => {
        setIsInviting(true)
        try {
            await inviteUser(inviteEmail)
            toast.success(inviteEmail + ' invited successfully')
            setInviteEmail('')
        } catch (error) {
            console.error(error)
            toast.error('Failed to invite user')
        } finally {
            setIsInviting(false)
        }
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite User</CardTitle>
                <CardDescription>Invite a new user by email. They will be added to the allowed emails list.</CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-6 pt-6">
                <Input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                />
                <Button variant="default" onClick={handleInvite} disabled={isInviting}>
                    {isInviting && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Invite
                </Button>
            </CardContent>
        </Card>
    )
}