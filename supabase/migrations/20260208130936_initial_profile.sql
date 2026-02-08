-- =====================================
-- Profiles Table
-- =====================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  role text not null default 'user',
  invited_at timestamptz,
  created_at timestamptz default now()
);

-- =====================================
-- Allow Admins to see the users 
-- table/profiles combined
-- =====================================
create or replace function public.admin_users()
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  is_banned boolean,
  ban_duration_seconds bigint
)
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    u.id::uuid,
    u.email::text,
    p.first_name::text,
    p.last_name::text,
    p.role::text,
    trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))::text as full_name,
    u.created_at::timestamptz,
    u.last_sign_in_at::timestamptz,
    u.banned_until::timestamptz,
    (u.banned_until is not null and u.banned_until > now()) as is_banned,
    case
      when u.banned_until is not null and u.banned_until > now()
      then extract(epoch from (u.banned_until - now()))::bigint
      else 0
    end as ban_duration_seconds
  from auth.users u
  join public.profiles p on p.id = u.id;
end;
$$;

revoke all on function public.admin_users() from public;
grant execute on function public.admin_users() to authenticated;

-- =====================================
-- Ban Users or un ban them
-- =====================================
create or replace function public.admin_set_ban(user_id uuid, seconds bigint)
returns void
language plpgsql
security definer
as $$
begin
  update auth.users
  set banned_until = now() + make_interval(secs => seconds)
  where id = user_id;
end;
$$;

-- =====================================
-- Automatic profile creation on new user
-- =====================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, invited_at)
  values (new.id, new.email, 'user', now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =====================================
-- 3. Sync display name to auth.users
-- =====================================
create or replace function public.sync_display_name()
returns trigger as $$
begin
  if old.first_name is distinct from new.first_name
     or old.last_name is distinct from new.last_name then

    update auth.users
    set raw_user_meta_data = jsonb_set(
        coalesce(raw_user_meta_data, '{}'::jsonb),
        '{display_name}',
        to_jsonb(trim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, '')))
    )
    where id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_name_change on profiles;

create trigger on_profile_name_change
after update of first_name, last_name on profiles
for each row execute procedure public.sync_display_name();

-- =====================================
-- Determine if a user is admin
-- =====================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql stable security definer;

-- =====================================
-- RLS / SECURITY
-- =====================================
alter table profiles enable row level security;

-- Prevent regular users from updating role directly
revoke update(role) on profiles from authenticated;

-- Users can read their own profile
create policy "Users can read own profile"
on profiles
for select
using (auth.uid() = id);

-- Users can update their own profile fields (not role)
create policy "Users can update own profile fields"
on profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =====================================
-- ADMIN POLICIES
-- =====================================

-- Admins can read all profiles
create policy "Admins can read all profiles"
on profiles
for select
using (public.is_admin());

-- Admins can update all profiles (including role)
create policy "Admins can update profiles"
on profiles
for update
using (public.is_admin());

-- Service role can insert profiles
create policy "Service role can insert profiles"
on profiles
for insert
with check (true);
