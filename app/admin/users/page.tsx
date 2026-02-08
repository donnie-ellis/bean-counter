// ./app/admin/users/page.tsx

import { requireRole } from '@/lib/auth/requireRole'
import { getUserProfiles } from '@/app/admin/users/actions'
import InviteForm from './invite_form'
import UsersTable from './users_table'

export default async function AdminUsersPage() {
    await requireRole('admin')

    const users = await getUserProfiles()
    if (!users) return <h1>Loading...</h1>
    
    return (
        <main className='mx-auto p-6 space-y-6'>
            {/* Invite Users Section */}
            <section>
                <InviteForm />
            </section>
            {/* Users Section */}
            <section>
            <UsersTable users={users} />
            </section>
        </main>
    )
}
