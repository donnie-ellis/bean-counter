-- ============================
-- TYPES
-- ============================

create type account_type as enum ('checking', 'savings', 'credit', 'cash', 'investment');

create type transaction_direction as enum ('debit', 'credit');

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
    user_id uuid not null references profiles (id) on delete cascade,
    role account_role not null default 'viewer',
    created_at timestamptz default now(),
    primary key (account_id, user_id)
);

-- ====== Categories =====
create table public.categories (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    name text not null,
    budget_amount numeric,
    parent_id uuid references public.categories (id),
    created_at timestamptz default now(),
    unique (user_id, name)
);

alter table public.categories enable row level security;

-- ===== Transactions =====
create table public.transactions (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references profiles (id) on delete cascade,
    member_id uuid not null,
    account_id uuid not null references public.accounts (id),
    direction transaction_direction not null,
    amount numeric not null check (amount > 0),
    description text,
    merchant text,
    category_id uuid references public.categories (id),
    occurred_at date not null,
    is_pending boolean default false,
    notes text,
    raw_data jsonb,
    created_at timestamptz default now(),
    constraint fk_transaction_account_member foreign key (account_id, member_id) references public.account_members (account_id, user_id) on delete cascade
);

create index on public.transactions (occurred_at);

create index on public.transactions (category_id);

create index on public.transactions (account_id);

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
returns numeric
language plpgsql
as $$
begin
  return case
    when acc_type = 'credit' and direction = 'debit' then amt
    when acc_type = 'credit' and direction = 'credit' then -amt
    when acc_type <> 'credit' and direction = 'credit' then amt
    else -amt
  end;
end;
$$;

-- Updates account balances after transaction changes
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

-- Totals all cetegory spending for a given month, including parent categories
create or replace function public.get_monthly_category_spending(
    target_month date
)
returns table (
    category_id uuid,
    category_name text,
    parent_id uuid,
    spent numeric
)
language sql
as $$
with month_txns as (
    select
        t.category_id,
        public.get_signed_amount(a.type, t.direction, t.amount) as signed_amount
    from public.transactions t
    join public.accounts a on a.id = t.account_id
    where date_trunc('month', t.occurred_at) =
          date_trunc('month', target_month)
),
category_totals as (
    select
        c.id as category_id,
        c.name,
        c.parent_id,
        coalesce(sum(mt.signed_amount), 0) as direct_spent
    from public.categories c
    left join month_txns mt
        on mt.category_id = c.id
    group by c.id, c.name, c.parent_id
)
select
    ct.category_id,
    ct.name,
    ct.parent_id,
    ct.direct_spent
        + coalesce((
            select sum(child.direct_spent)
            from category_totals child
            where child.parent_id = ct.category_id
        ), 0) as spent
from category_totals ct;
$$;

-- Combines category spending with budgets for a given month, including parent categories. Only returns categories with budgets.
create or replace function public.get_monthly_categories_with_budgets(
    target_month date
)
returns table (
    id uuid,
    name text,
    parent_id uuid,
    budget_amount numeric,
    totaled_budget numeric,
    spent numeric,
    remaining numeric
)
language sql
as $$
with spending as (
    select * from public.get_monthly_category_spending(target_month)
),
category_data as (
    select
        c.id,
        c.name,
        c.parent_id,
        c.budget_amount,
        coalesce(c.budget_amount, 0) as direct_budget,
        c.budget_amount is not null as has_budget,
        abs(coalesce(s.spent, 0)) as spent
    from public.categories c
    left join spending s on s.category_id = c.id
),
aggregated as (
    select
        cd.id,
        cd.name,
        cd.parent_id,
        cd.budget_amount,
        cd.direct_budget + coalesce((
            select sum(child.direct_budget)
            from category_data child
            where child.parent_id = cd.id
        ), 0) as total_budget,
        cd.has_budget or exists(
            select 1 from category_data child
            where child.parent_id = cd.id and child.has_budget
        ) as has_any_budget,
        exists(
            select 1 from category_data child
            where child.parent_id = cd.id
        ) as is_parent,
        cd.spent
    from category_data cd
)
select
    a.id,
    a.name,
    a.parent_id,
    a.budget_amount,
    case when a.is_parent then a.total_budget else null end as totaled_budget,
    a.spent,
    case when a.has_any_budget then a.total_budget - a.spent else null end as remaining
from aggregated a
order by
    coalesce(a.parent_id, a.id),
    a.parent_id nulls first
$$;

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

-- Helper for RLS write access on the transactions table
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

-- Transaction Table
alter table public.transactions enable row level security;

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