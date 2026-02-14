import AccountsTable from '@/app/accounts/_components/accountsTable';
import { requireRole } from '@/lib/auth/requireRole';
import { getAccounts } from '@/app/accounts/actions';

export default async function Accounts() {
  await requireRole('user');
  const accounts = await getAccounts();
  
  return (
    <main>
      <AccountsTable accounts={accounts} />
    </main>
  );
}