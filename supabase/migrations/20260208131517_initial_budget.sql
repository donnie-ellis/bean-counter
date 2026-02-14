-- ============================
-- TYPES
-- ============================

create type account_type as enum ('checking', 'savings', 'credit', 'cash', 'investment');

create type transaction_direction as enum ('outflow', 'inflow', 'transfer');

create type recurrence_frequency as enum ('daily', 'weekly', 'monthly', 'yearly');

create type budget_period as enum ('monthly', 'yearly');

create type account_role as enum ('owner', 'editor', 'viewer');

-- ============================
-- TABLES
-- ============================

-- ===== Accounts =====
create table public.accounts (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    name text not null,
    type account_type not null,
    institution text,
    credit_limit numeric,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique (user_id, name)
);

-- ===== Account Members =====
create table public.account_members (
    account_id uuid references public.accounts (id) on delete cascade,
    user_id uuid references profiles (id) on delete cascade,
    role account_role not null default 'viewer',
    created_at timestamptz default now(),
    primary key (account_id, user_id)
);

-- ===== Cardholders =====
create table public.cardholders (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    name text not null,
    created_at timestamptz default now(),
    unique (user_id, name)
);

-- ====== Categories =====
create table public.categories (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    name text not null,
    parent_id uuid references public.categories (id),
    created_at timestamptz default now(),
    unique (user_id, name)
);

alter table public.categories enable row level security;

-- ===== Tags =====
create table public.tags (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    name text not null,
    created_at timestamptz default now(),
    unique (user_id, name)
);

-- ===== Transactions =====
create table public.transactions (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    account_id uuid not null references public.accounts (id),
    cardholder_id uuid references public.cardholders (id),
    direction transaction_direction not null,
    amount numeric not null check (amount > 0),
    description text,
    merchant text,
    category_id uuid references public.categories (id),
    occurred_at date not null,
    is_pending boolean default false,
    notes text,
    raw_data jsonb,
    created_at timestamptz default now()
);

alter table public.transactions enable row level security;

-- ===== Transaction Splits =====
create table public.transaction_splits (
    id uuid primary key default gen_random_uuid (),
    transaction_id uuid not null references public.transactions (id) on delete cascade,
    category_id uuid references public.categories (id),
    amount numeric not null check (amount > 0)
);

-- ===== Transaction Tags =====
create table public.transaction_tags (
    transaction_id uuid references public.transactions (id) on delete cascade,
    tag_id uuid references public.tags (id) on delete cascade,
    primary key (transaction_id, tag_id)
);

alter table public.tags enable row level security;

-- ===== Recurring Transactions =====
create table public.recurring_transactions (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id),
    account_id uuid not null references public.accounts (id),
    category_id uuid references public.categories (id),
    direction transaction_direction not null,
    amount numeric not null,
    description text,
    frequency recurrence_frequency not null,
    start_date date not null,
    next_run_date date not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- ===== Transaction Imports =====
create table public.transaction_imports (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id),
    provider text not null,
    external_id text not null,
    transaction_id uuid references public.transactions (id),
    imported_at timestamptz default now(),
    unique (
        user_id,
        provider,
        external_id
    )
);

-- ===== Budgets =====
create table public.budgets (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id),
    category_id uuid references public.categories (id),
    period budget_period not null default 'monthly',
    amount numeric not null,
    created_at timestamptz default now(),
    unique (user_id, category_id, period)
);

alter table public.budgets enable row level security;

-- ===== Account Balances =====
create table public.account_balances (
    account_id uuid primary key references public.accounts (id) on delete cascade,
    balance numeric not null default 0,
    updated_at timestamptz default now()
);

-- ============================
-- Functions
-- ============================
create or replace function public.get_signed_amount(
  acc_type account_type,
  direction transaction_direction,
  amt numeric
)
returns numeric as $$
begin
  if acc_type = 'credit' then
    if direction = 'outflow' then return amt;
    else return -amt;
    end if;
  else
    if direction = 'inflow' then return amt;
    else return -amt;
    end if;
  end if;
end;
$$ language plpgsql;

create or replace function public.update_account_balance()
returns trigger as $$
declare
  acc_type account_type;
  delta numeric;
  acc_id uuid;
begin
  acc_id := coalesce(new.account_id, old.account_id);

  select type into acc_type from public.accounts where id = acc_id;

  if tg_op = 'INSERT' then
    delta := public.get_signed_amount(acc_type, new.direction, new.amount);
  elsif tg_op = 'UPDATE' then
    delta := public.get_signed_amount(acc_type, new.direction, new.amount)
           - public.get_signed_amount(acc_type, old.direction, old.amount);
  elsif tg_op = 'DELETE' then
    delta := - public.get_signed_amount(acc_type, old.direction, old.amount);
  end if;

  insert into public.account_balances (account_id, balance)
  values (acc_id, delta)
  on conflict (account_id)
  do update set
    balance = account_balances.balance + delta,
    updated_at = now();

  return coalesce(new, old);
end;
$$ language plpgsql;

-- Helper for RLS on the transactions table
create or replace function public.has_account_access(acc_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.accounts a
    where a.id = acc_id
      and (
        a.user_id = auth.uid()
        or exists (
          select 1
          from public.account_members am
          where am.account_id = a.id
            and am.user_id = auth.uid()
        )
      )
  );
end;
$$ language plpgsql stable;

-- Helper for RLS on the transactions table
create or replace function public.has_account_write_access(acc_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()

    or exists (
      select 1
      from public.accounts a
      where a.id = acc_id
        and a.user_id = auth.uid()
    )

    or exists (
      select 1
      from public.account_members am
      where am.account_id = acc_id
        and am.user_id = auth.uid()
        and am.role in ('owner', 'editor')
    );
$$;

-- Helper function for RLS to see if a user can  select and account
create or replace function public.can_select_account(acc_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.accounts a
      where a.id = acc_id
        and (
          a.user_id = auth.uid()
          or exists (
            select 1
            from public.account_members am
            where am.account_id = a.id
              and am.user_id = auth.uid()
          )
        )
    );
$$;

-- Helper function to see if a user is an account owner
create or replace function public.is_account_owner(acc_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.accounts a
      where a.id = acc_id
        and a.user_id = auth.uid()
    );
$$;

-- ============================
-- Triggers
-- ============================
create trigger trg_update_account_balance
after insert or update or delete on public.transactions
for each row execute function public.update_account_balance();

create or replace function public.validate_transaction_splits()
returns trigger as $$
declare
  total numeric;
  tx_amount numeric;
begin
  select amount into tx_amount from public.transactions where id = new.transaction_id;

  select coalesce(sum(amount), 0)
  into total
  from public.transaction_splits
  where transaction_id = new.transaction_id;

  if total > tx_amount then
    raise exception 'Split total exceeds transaction amount';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_validate_splits
after insert or update on public.transaction_splits
for each row execute function public.validate_transaction_splits();

-- ============================
-- RLS
-- ============================
-- Account Table
alter table public.accounts enable row level security;

create policy "Account select" on public.accounts for
select using (
        public.can_select_account (accounts.id)
    );

create policy "Allow admin insert access" on public.accounts for
insert
with
    check (public.is_admin ());

create policy "Allow admin update access" on public.accounts for
update using (
    public.is_account_owner (accounts.id)
);

create policy "Allow admin delete access" on public.accounts for delete using (public.is_admin ());

-- Account Members Table
alter table public.account_members enable row level security;

create policy "Account members select" on public.account_members for
select using (
        public.can_select_account (account_id)
    );

create policy "Account members insert" on public.account_members for
insert
with
    check (
        public.is_account_owner (account_id)
    );

create policy "Account members update" on public.account_members for
update using (
    public.is_account_owner (account_id)
);

create policy "Account members delete" on public.account_members for delete using (
    public.is_account_owner (account_id)
);

-- Cardholders table
alter table public.cardholders enable row level security;

create policy "Cardholder access" on public.cardholders for all using (user_id = auth.uid ())
with
    check (user_id = auth.uid ());

-- Transaction Table
create policy "Transaction read access" on public.transactions for
select using (
        public.has_account_access (transactions.account_id)
    );

create policy "Transaction insert access" on public.transactions for
insert
with
    check (
        public.has_account_write_access (transactions.account_id)
    );

create policy "Transaction update access" on public.transactions for
update using (
    public.has_account_write_access (transactions.account_id)
)
with
    check (
        public.has_account_write_access (transactions.account_id)
    );

create policy "Transaction delete access" on public.transactions for delete using (
    public.has_account_write_access (transactions.account_id)
);

-- Categories
create policy "Allow authenticated read access" on public.categories for
select using (
        auth.role () = 'authenticated'
    );

create policy "Allow authenticated insert access" on public.categories for
insert
with
    check (
        auth.role () = 'authenticated'
    );

create policy "Allow admin update access" on public.categories for
update using (public.is_admin ());

create policy "Allow admin delete access" on public.categories for delete using (public.is_admin ());

-- Tags
create policy "Allow authenticated read access" on public.tags for
select using (
        auth.role () = 'authenticated'
    );

create policy "Allow authenticated insert access" on public.tags for
insert
with
    check (
        auth.role () = 'authenticated'
    );

create policy "Allow admin update access" on public.tags for
update using (public.is_admin ());

create policy "Allow admin delete access" on public.tags for delete using (public.is_admin ());

-- Budgets
create policy "Allow authenticated read access" on public.budgets for
select using (
        auth.role () = 'authenticated'
    );

create policy "Allow admin insert access" on public.budgets for
insert
with
    check (public.is_admin ());

create policy "Allow admin update access" on public.budgets for
update using (public.is_admin ());

create policy "Allow admin delete access" on public.budgets for delete using (public.is_admin ());