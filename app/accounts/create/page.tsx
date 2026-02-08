// ./app/accounts/create/page.tsx

import { CreateAccountForm } from "./account_form";
import { requireRole } from "@/lib/auth/requireRole";

export default async function CreateAccountPage() {
    await requireRole('user');

    return (
        <main className='mx-auto flex flex-col justify-center items-center p-6 space-y-6'>
            <section>
                <CreateAccountForm />
            </section>
        </main>
    )
}