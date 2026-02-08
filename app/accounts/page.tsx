// ./app/accounts/page.tsx

import AccountsTable from "@/app/accounts/AccountsTable";
import { requireRole } from "@/lib/auth/requireRole";

export default async function Accounts() {
  await requireRole('user');

  return (
      <main>
        <AccountsTable />
      </main>
    );
}