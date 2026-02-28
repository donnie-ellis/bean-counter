-- supabase/seed.sql

-- ============================================
-- Users & Profiles
-- ============================================

DO $$
DECLARE
  admin_id uuid;
  user_id  uuid;
BEGIN
  -- Create admin user (trigger will create the profile row)
  admin_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@bean-counter.local',
    crypt('password123', gen_salt('bf')),
    NOW(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(), NOW(), NOW(), NOW(), NOW()
  );

  UPDATE public.profiles
  SET role = 'admin', first_name = 'Admin', last_name = 'User'
  WHERE id = admin_id;

  -- Create regular user
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'user@bean-counter.local',
    crypt('password123', gen_salt('bf')),
    NOW(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(), NOW(), NOW(), NOW(), NOW()
  );

  UPDATE public.profiles
  SET role = 'user', first_name = 'Regular', last_name = 'User'
  WHERE id = user_id;

END $$;


-- ============================================
-- Accounts, Categories, Transactions
-- ============================================

DO $$
DECLARE
  admin_id    uuid;
  user_id     uuid;

  checking_id uuid;
  savings_id  uuid;

  food_id     uuid;
  dining_id   uuid;
  grocery_id  uuid;
  fun_id      uuid;

  month1 date := date_trunc('month', current_date)::date;
  month2 date := (date_trunc('month', current_date) - interval '1 month')::date;
BEGIN
  -- Resolve seeded users
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO user_id  FROM public.profiles WHERE role = 'user'  LIMIT 1;

  -- ==================
  -- Accounts
  -- NOTE: Inserted via service role to bypass RLS (no owner exists yet at insert time).
  -- The account_members inserts below immediately establish ownership.
  -- ==================

  INSERT INTO public.accounts (name, type, institution)
  VALUES ('Checking', 'checking', 'Chase')
  RETURNING id INTO checking_id;

  INSERT INTO public.accounts (name, type, institution)
  VALUES ('Savings', 'savings', 'Chase')
  RETURNING id INTO savings_id;

  -- Account Members
  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES
    (checking_id, admin_id, 'owner'),
    (checking_id, user_id,  'editor'),
    (savings_id,  admin_id, 'owner'),
    (savings_id,  user_id,  'viewer');

  -- ==================
  -- Categories (domain-wide, admin-managed)
  -- ==================

  INSERT INTO public.categories (name)
  VALUES ('Food')
  RETURNING id INTO food_id;

  INSERT INTO public.categories (name, parent_id, budget_amount)
  VALUES
    ('Dining Out', food_id, 200),
    ('Grocery',    food_id, 400);

  SELECT id INTO dining_id  FROM public.categories WHERE name = 'Dining Out';
  SELECT id INTO grocery_id FROM public.categories WHERE name = 'Grocery';

  INSERT INTO public.categories (name)
  VALUES ('Fun')
  RETURNING id INTO fun_id;

  -- ============================================================
  -- MONTH 1 (Current Month)
  -- Dining Out target: ~243 (over 200 budget)
  -- Grocery target:    ~391 (near 400 budget)
  -- ============================================================

  INSERT INTO public.transactions
    (user_id, account_id, direction, amount, description, merchant, category_id, occurred_at)
  VALUES
    -- Dining Out
    (admin_id, checking_id, 'debit',  92, 'Date night',  'Steakhouse',  dining_id,  month1 +  3),
    (user_id,  checking_id, 'debit',  48, 'Lunch',       'Chipotle',    dining_id,  month1 +  5),
    (admin_id, checking_id, 'debit',  65, 'Dinner',      'Olive Garden', dining_id, month1 + 10),
    (user_id,  checking_id, 'debit',  38, 'Coffee run',  'Starbucks',   dining_id,  month1 + 15),

    -- Grocery
    (user_id,  checking_id, 'debit', 135, 'Weekly groceries', 'Kroger',       grocery_id, month1 +  2),
    (admin_id, checking_id, 'debit', 118, 'Weekly groceries', 'Kroger',       grocery_id, month1 +  8),
    (user_id,  checking_id, 'debit',  96, 'Trader Joes trip', 'Trader Joes',  grocery_id, month1 + 14),
    (admin_id, checking_id, 'debit',  42, 'Quick grocery',    'Target',       grocery_id, month1 + 20),

    -- Fun
    (user_id,  checking_id, 'debit',  75, 'Concert',         'Ticketmaster', fun_id,     month1 +  7),

    -- Uncategorized
    (user_id,  checking_id, 'debit',  55, 'Amazon purchase', 'Amazon', NULL, month1 + 12),
    (admin_id, checking_id, 'debit',  29, 'Gas',             'Shell',  NULL, month1 + 18);

  -- Savings deposit (owner only — user is viewer and cannot write to savings)
  INSERT INTO public.transactions
    (user_id, account_id, direction, amount, description, merchant, occurred_at)
  VALUES
    (admin_id, savings_id, 'credit', 500, 'Monthly transfer', 'Internal Transfer', month1 + 1);

  -- ============================================================
  -- MONTH 2 (Previous Month)
  -- Dining Out target: ~165 (under 200 budget)
  -- Grocery target:    ~425 (over 400 budget)
  -- ============================================================

  INSERT INTO public.transactions
    (user_id, account_id, direction, amount, description, merchant, category_id, occurred_at)
  VALUES
    -- Dining Out (under budget)
    (user_id,  checking_id, 'debit',  45, 'Lunch',   'Panera',        dining_id, month2 +  4),
    (admin_id, checking_id, 'debit',  72, 'Dinner',  'Mexican Grill', dining_id, month2 + 11),
    (user_id,  checking_id, 'debit',  48, 'Brunch',  'Cafe Local',    dining_id, month2 + 18),

    -- Grocery (over budget)
    (admin_id, checking_id, 'debit', 155, 'Costco run',    'Costco',      grocery_id, month2 +  3),
    (user_id,  checking_id, 'debit', 132, 'Groceries',     'Kroger',      grocery_id, month2 +  9),
    (admin_id, checking_id, 'debit',  96, 'Trader Joes',   'Trader Joes', grocery_id, month2 + 16),
    (user_id,  checking_id, 'debit',  42, 'Extra grocery', 'Target',      grocery_id, month2 + 21),

    -- Fun
    (user_id,  checking_id, 'debit',  60, 'Bowling night', 'Bowlero', fun_id, month2 + 13),

    -- Uncategorized
    (admin_id, checking_id, 'debit',  80, 'Home Depot', 'Home Depot', NULL, month2 + 6);

  -- Savings deposit
  INSERT INTO public.transactions
    (user_id, account_id, direction, amount, description, merchant, occurred_at)
  VALUES
    (admin_id, savings_id, 'credit', 450, 'Transfer to savings', 'Internal Transfer', month2 + 2);

END $$;