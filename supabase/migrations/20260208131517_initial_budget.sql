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
    id           uuid         primary key default gen_random_uuid(),
    name         text         not null,
    type         account_type not null,
    institution  text,
    credit_limit numeric,
    is_active    boolean      default true,
    created_at   timestamptz  default now()
);

-- ===== Account Members =====
create table public.account_members (
    account_id uuid         not null references public.accounts (id) on delete cascade,
    user_id    uuid         not null references public.profiles (id) on delete cascade,
    role       account_role not null default 'viewer',
    created_at timestamptz  default now(),
    primary key (account_id, user_id)
);

-- ===== Categories =====
-- Shared domain-wide. Only admins can create or modify.
create table public.categories (
    id            uuid        primary key default gen_random_uuid(),
    name          text        not null,
    budget_amount numeric,
    parent_id     uuid        references public.categories (id),
    created_at    timestamptz default now()
);

-- ===== Transactions =====
create table public.transactions (
    id          uuid                     primary key default gen_random_uuid(),
    -- Renamed from member_id to user_id for clarity — semantically this is always a user
    user_id     uuid                     not null,
    account_id  uuid                     not null references public.accounts (id),
    direction   transaction_direction    not null,
    amount      numeric                  not null check (amount > 0),
    description text,
    merchant    text,
    category_id uuid                     references public.categories (id),
    occurred_at date                     not null,
    is_pending  boolean                  default false,
    notes       text,
    raw_data    jsonb,
    created_at  timestamptz              default now(),
    -- Ensures the user_id is a valid member of the account
    constraint fk_transaction_account_member
        foreign key (account_id, user_id)
        references public.account_members (account_id, user_id)
        on delete cascade
);

create index on public.transactions (occurred_at);
create index on public.transactions (category_id);
create index on public.transactions (account_id);
create index on public.transactions (user_id);

-- ===== Account Balances =====
create table public.account_balances (
    account_id uuid    primary key references public.accounts (id) on delete cascade,
    balance    numeric not null default 0,
    updated_at timestamptz     default now()
);


-- ============================
-- HELPER FUNCTIONS
-- ============================

-- Checks if the current user is an admin via the profiles table role column
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

-- Returns true if the current user has any membership on the given account
create or replace function public.has_account_access(acc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.account_members am
        where am.account_id = acc_id
          and am.user_id    = auth.uid()
    );
$$;

-- Returns true if the current user is an owner or editor on the given account
create or replace function public.has_account_write_access(acc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.account_members am
        where am.account_id = acc_id
          and am.user_id    = auth.uid()
          and am.role       in ('owner', 'editor')
    );
$$;

-- Returns true if the current user is an owner of the given account
create or replace function public.is_account_owner(acc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.account_members am
        where am.account_id = acc_id
          and am.user_id    = auth.uid()
          and am.role       = 'owner'
    );
$$;


-- ============================
-- BUSINESS LOGIC FUNCTIONS
-- ============================

-- Returns the signed amount of a transaction relative to account balance.
-- For credit accounts: spending (debit) increases what you owe (+), payments (credit) reduce it (-).
-- For all other accounts: credits increase balance (+), debits reduce it (-).
create or replace function public.get_signed_amount(
    acc_type  account_type,
    direction transaction_direction,
    amt       numeric
)
returns numeric
language plpgsql
as $$
begin
    return case
        when acc_type = 'credit' and direction = 'debit'  then  amt
        when acc_type = 'credit' and direction = 'credit' then -amt
        when acc_type <> 'credit' and direction = 'credit' then  amt
        else -amt
    end;
end;
$$;

-- Totals category spending for a given month.
-- Uses a recursive CTE to support unlimited depth of parent/child categories.
create or replace function public.get_monthly_category_spending(
    target_month date
)
returns table (
    category_id   uuid,
    category_name text,
    parent_id     uuid,
    spent         numeric
)
language sql
as $$
    -- Direct spending per category for the target month
    with recursive month_txns as (
        select
            t.category_id,
            public.get_signed_amount(a.type, t.direction, t.amount) as signed_amount
        from public.transactions t
        join public.accounts     a on a.id = t.account_id
        where date_trunc('month', t.occurred_at) = date_trunc('month', target_month)
    ),
    direct_totals as (
        select
            c.id        as category_id,
            c.name      as category_name,
            c.parent_id,
            coalesce(sum(mt.signed_amount), 0) as direct_spent
        from public.categories c
        left join month_txns   mt on mt.category_id = c.id
        group by c.id, c.name, c.parent_id
    ),
    -- Walk the full category tree so each ancestor accumulates all descendant spending.
    -- Each iteration steps from a child node up to its parent, carrying the original
    -- leaf's direct_spent with it so ancestors accumulate all descendant spending.
    recursive_totals as (
        -- Base: seed one row per category, pointing to itself as the root
        select
            category_id as root_id,
            category_id as node_id,
            parent_id,
            direct_spent
        from direct_totals

        union all

        -- Recurse: walk up one level — find the parent of the current node
        select
            rt.root_id,
            dt.category_id  as node_id,
            dt.parent_id,
            rt.direct_spent
        from recursive_totals  rt
        join direct_totals     dt on dt.category_id = rt.parent_id
    )
    select
        dt.category_id,
        dt.category_name,
        dt.parent_id,
        coalesce(sum(rt.direct_spent), 0) as spent
    from direct_totals    dt
    left join recursive_totals rt on rt.node_id = dt.category_id
    group by dt.category_id, dt.category_name, dt.parent_id;
$$;

-- Combines category spending with budgets for a given month.
-- Uses recursive rollup so parent budget totals include all descendants at any depth.
-- Only returns categories that have a budget set on themselves or any descendant.
create or replace function public.get_monthly_categories_with_budgets(
    target_month date
)
returns table (
    id             uuid,
    name           text,
    parent_id      uuid,
    budget_amount  numeric,
    totaled_budget numeric,
    spent          numeric,
    remaining      numeric
)
language sql
as $$
    with recursive spending as (
        select * from public.get_monthly_category_spending(target_month)
    ),
    category_data as (
        select
            c.id,
            c.name,
            c.parent_id,
            c.budget_amount,
            coalesce(c.budget_amount, 0)    as direct_budget,
            c.budget_amount is not null      as has_budget,
            abs(coalesce(s.spent, 0))        as spent
        from public.categories c
        left join spending      s on s.category_id = c.id
    ),
    -- Recursively sum budgets from all descendants into each ancestor.
    -- Each iteration walks one level up the tree, carrying the leaf's
    -- direct_budget so every ancestor accumulates all descendant budgets.
    recursive_budgets as (
        -- Base: seed one row per category pointing to itself as root
        select
            id        as root_id,
            id        as node_id,
            parent_id,
            direct_budget
        from category_data

        union all

        -- Recurse: step up to the parent of the current node
        select
            rb.root_id,
            cd.id       as node_id,
            cd.parent_id,
            rb.direct_budget
        from recursive_budgets rb
        join category_data     cd on cd.id = rb.parent_id
    ),
    aggregated as (
        select
            cd.id,
            cd.name,
            cd.parent_id,
            cd.budget_amount,
            cd.has_budget,
            sum(rb.direct_budget) as total_budget,
            cd.spent,
            exists(
                select 1 from category_data child
                where child.parent_id = cd.id
            ) as is_parent,
            cd.has_budget or exists(
                select 1 from category_data child
                where child.parent_id = cd.id and child.has_budget
            ) as has_any_budget
        from category_data     cd
        left join recursive_budgets rb on rb.node_id = cd.id
        group by cd.id, cd.name, cd.parent_id, cd.budget_amount,
                 cd.has_budget, cd.spent
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
    where a.has_any_budget
    order by
        coalesce(a.parent_id, a.id),
        a.parent_id nulls first;
$$;


-- ============================
-- TRIGGERS
-- ============================

-- Initializes a zero-balance row in account_balances when an account is created,
-- so balance queries always return a row rather than null before any transactions exist.
create or replace function public.initialize_account_balance()
returns trigger
language plpgsql
as $$
begin
    insert into public.account_balances (account_id, balance)
    values (new.id, 0);
    return new;
end;
$$;

create trigger trg_initialize_account_balance
    after insert on public.accounts
    for each row execute function public.initialize_account_balance();

-- Updates account_balances after any transaction insert, update, or delete.
create or replace function public.update_account_balance()
returns trigger
language plpgsql
as $$
declare
    acc_type account_type;
    delta    numeric;
    acc_id   uuid;
begin
    acc_id := coalesce(new.account_id, old.account_id);

    select type into acc_type
    from public.accounts
    where id = acc_id;

    if tg_op = 'INSERT' then
        delta := public.get_signed_amount(acc_type, new.direction, new.amount);
    elsif tg_op = 'UPDATE' then
        delta := public.get_signed_amount(acc_type, new.direction, new.amount)
               - public.get_signed_amount(acc_type, old.direction, old.amount);
    elsif tg_op = 'DELETE' then
        delta := -public.get_signed_amount(acc_type, old.direction, old.amount);
    end if;

    update public.account_balances
    set balance    = balance + delta,
        updated_at = now()
    where account_id = acc_id;

    return coalesce(new, old);
end;
$$;

create trigger trg_update_account_balance
    after insert or update or delete on public.transactions
    for each row execute function public.update_account_balance();


-- ============================
-- ROW LEVEL SECURITY
-- ============================

-- ===== Accounts =====
-- Admins create accounts. Owners update/delete their own accounts.
-- Any member can read accounts they belong to.
alter table public.accounts enable row level security;

create policy "accounts: members can read"
    on public.accounts for select
    using (public.has_account_access(id));

create policy "accounts: admins can insert"
    on public.accounts for insert
    with check (public.is_admin());

create policy "accounts: owners can update"
    on public.accounts for update
    using (public.is_account_owner(id));

create policy "accounts: owners can delete"
    on public.accounts for delete
    using (public.is_account_owner(id));

-- ===== Account Members =====
-- Any member can see the membership list for their accounts.
-- Only owners manage membership (invite, change role, remove).
alter table public.account_members enable row level security;

create policy "account_members: members can read"
    on public.account_members for select
    using (public.has_account_access(account_id));

create policy "account_members: owners can insert"
    on public.account_members for insert
    with check (public.is_account_owner(account_id));

create policy "account_members: owners can update"
    on public.account_members for update
    using (public.is_account_owner(account_id));

create policy "account_members: owners can delete"
    on public.account_members for delete
    using (public.is_account_owner(account_id));

-- NOTE: Admins need to bootstrap the first owner row after account creation.
-- Because is_account_owner() will return false for a brand-new account with no members,
-- the insert policy above would block even the admin. The recommended pattern is to
-- call account_members inserts from a service-role client or a security definer
-- function during the creation flow, bypassing RLS for that initial membership row.

-- ===== Transactions =====
-- Any account member can read transactions. Owners and editors can write.
alter table public.transactions enable row level security;

create policy "transactions: members can read"
    on public.transactions for select
    using (public.has_account_access(account_id));

create policy "transactions: owners and editors can insert"
    on public.transactions for insert
    with check (public.has_account_write_access(account_id));

create policy "transactions: owners and editors can update"
    on public.transactions for update
    using (public.has_account_write_access(account_id))
    with check (public.has_account_write_access(account_id));

create policy "transactions: owners and editors can delete"
    on public.transactions for delete
    using (public.has_account_write_access(account_id));

-- ===== Account Balances =====
-- Balances are derived data maintained exclusively by the update_account_balance trigger.
-- Users can only read balances for accounts they are members of.
-- No direct insert/update/delete is permitted from the client layer.
alter table public.account_balances enable row level security;

create policy "account_balances: members can read"
    on public.account_balances for select
    using (public.has_account_access(account_id));

-- ===== Categories =====
-- Shared domain-wide. All authenticated users can read.
-- Only admins can create, modify, or delete categories.
alter table public.categories enable row level security;

create policy "categories: authenticated users can read"
    on public.categories for select
    using (auth.role() = 'authenticated');

create policy "categories: admins can insert"
    on public.categories for insert
    with check (public.is_admin());

create policy "categories: admins can update"
    on public.categories for update
    using (public.is_admin());

create policy "categories: admins can delete"
    on public.categories for delete
    using (public.is_admin());