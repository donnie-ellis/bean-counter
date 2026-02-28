// ./app/admin/users/page.tsx

import { requireRole } from '@/lib/auth/requireRole'
import { getUserProfiles } from '@/app/admin/users/actions'
import InviteForm from '@/app/admin/users/invite_form'
import UsersTable from '@/app/admin/users/users_table'
import AdminMenu from '@/app/admin/_components/adminMenu'

export default async function AdminUsersPage() {
    await requireRole('admin')

    const users = await getUserProfiles()
    if (!users) return <h1>Loading...</h1>
    
    return (
        <main className="flex flex-col px-4 gap-4">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-muted-foreground">Admin Portal - Users</h1>
                <AdminMenu />
            </header>
            {/* Invite Users Section */}
            <section>
                <InviteForm />
            </section>
            {/* Users Section */}
            <section>
            <UsersTable users={users} />
            </section>
        </ main>
    )
}
