// ./app/admin/users/users_table.tsx

'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Ban, CheckCircle, Shield, User } from "lucide-react"
import { setBanDuration, setUserRole } from "@/app/admin/users/actions"

export default function UsersTable({ users }: { users: any[] }) {
    const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null)
    const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null)
    
    const handleStatusChange = async (user: any) => {
        setUpdatingStatusFor(user.id)
        let banDuration = 0
        if (!user.is_banned) {
            banDuration = 60 * 60 * 24 * 365 * 100
        }

        const response = await setBanDuration(user.id, banDuration)
        if (response.error) {
            toast.error('Failed to update user status')
        } else {
            toast.success('User status updated successfully')
        }
        setUpdatingStatusFor(null)
    }
    
    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
        setUpdatingRoleFor(userId)
        const response = await setUserRole(userId, newRole)
        if (response.error) {
            toast.error('Failed to update user role')
        } else {
            toast.success('User role updated successfully')
        }
        setUpdatingRoleFor(null)
    }

    if (!users) return (<span>Help</span>)

    if (users.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Mobile card layout */}
                <div className="md:hidden space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{user.first_name} {user.last_name}</div>
                                    <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                            disabled={user.role === 'admin' || updatingRoleFor === user.id}
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleRoleChange(user.id, 'user')}
                                            disabled={user.role === 'user' || updatingRoleFor === user.id}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Make User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleStatusChange(user)}
                                            disabled={updatingStatusFor === user.id}
                                            className={user.is_banned ? '' : 'text-destructive focus:text-destructive'}
                                        >
                                            {user.is_banned ? (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Enable User
                                                </>
                                            ) : (
                                                <>
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Ban User
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={user.is_banned ? 'destructive' : 'secondary'} className="text-xs">
                                    {user.is_banned ? 'Disabled' : 'Active'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                                {user.last_sign_in_at && (
                                    <span className="text-xs text-muted-foreground">
                                        Last: {new Date(user.last_sign_in_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table layout */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3 font-medium">User</th>
                                <th className="text-left p-3 font-medium hidden lg:table-cell">Last Sign In</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-left p-3 font-medium">Role</th>
                                <th className="text-left p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-3 hidden lg:table-cell whitespace-nowrap">
                                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={user.is_banned ? 'destructive' : 'secondary'}>
                                            {user.is_banned ? 'Disabled' : 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline">
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                                    disabled={user.role === 'admin' || updatingRoleFor === user.id}
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChange(user.id, 'user')}
                                                    disabled={user.role === 'user' || updatingRoleFor === user.id}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Make User
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(user)}
                                                    disabled={updatingStatusFor === user.id}
                                                    className={user.is_banned ? '' : 'text-destructive focus:text-destructive'}
                                                >
                                                    {user.is_banned ? (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Enable User
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Ban User
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}