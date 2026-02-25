import AccountsTable from '@/app/accounts/_components/accountsTable';
import { requireRole } from '@/lib/auth/requireRole';
import { getAllAccountsWithMembers } from '@/app/accounts/actions';

export default async function Accounts() {
  await requireRole('user');
  const accounts = await getAllAccountsWithMembers();
  
  return (
    <main>
      <AccountsTable accounts={accounts} />
    </main>
  );
}