-- 0001_init.sql — Bakery schema
create extension if not exists "pgcrypto";

-- ───────── Tables ─────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_kobo integer not null check (price_kobo >= 0),
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 20),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create type public.order_status as enum ('pending','confirmed','ready','completed','cancelled');
create type public.fulfillment_type as enum ('pickup','delivery');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  status public.order_status not null default 'pending',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  fulfillment public.fulfillment_type not null,
  delivery_address text,
  requested_for timestamptz not null,
  notes text,
  subtotal_kobo integer not null,
  delivery_fee_kobo integer not null default 0,
  total_kobo integer not null,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  check (fulfillment = 'pickup' or delivery_address is not null)
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_kobo integer not null,
  quantity integer not null check (quantity > 0),
  line_total_kobo integer not null
);
create index order_items_order_idx on public.order_items(order_id);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  to_email text not null,
  subject text not null,
  provider text not null default 'mailgun',
  provider_message_id text,
  status text not null check (status in ('sent','failed')),
  error text,
  created_at timestamptz not null default now()
);

-- ───────── Profile auto-creation on Google sign-in ─────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── Atomic order creation ─────────
-- Called ONLY by the server with the service role key.
create or replace function public.create_order(
  p_user_id uuid,
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_fulfillment public.fulfillment_type,
  p_delivery_address text,
  p_requested_for timestamptz,
  p_notes text,
  p_delivery_fee_kobo integer,
  p_items jsonb  -- [{ "product_id": "...", "quantity": 2 }]
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_subtotal integer := 0;
  v_number text;
  v_item record;
  v_prod public.products;
begin
  -- idempotent replay
  select * into v_order from public.orders
   where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then return v_order; end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  -- compute subtotal from authoritative prices
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int) loop
    select * into v_prod from public.products where id = v_item.product_id and is_available;
    if not found then raise exception 'PRODUCT_UNAVAILABLE:%', v_item.product_id; end if;
    v_subtotal := v_subtotal + v_prod.price_kobo * v_item.quantity;
  end loop;

  v_number := 'GC-' || to_char(now() at time zone 'Africa/Lagos','YYMMDD') || '-' ||
              upper(substr(encode(gen_random_bytes(3),'hex'),1,4));

  insert into public.orders (
    order_number, user_id, idempotency_key, customer_name, customer_email, customer_phone,
    fulfillment, delivery_address, requested_for, notes,
    subtotal_kobo, delivery_fee_kobo, total_kobo
  ) values (
    v_number, p_user_id, p_idempotency_key, p_customer_name, p_customer_email, p_customer_phone,
    p_fulfillment, p_delivery_address, p_requested_for, p_notes,
    v_subtotal, p_delivery_fee_kobo, v_subtotal + p_delivery_fee_kobo
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, unit_price_kobo, quantity, line_total_kobo)
  select v_order.id, p.id, p.name, p.price_kobo, x.quantity, p.price_kobo * x.quantity
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  join public.products p on p.id = x.product_id;

  delete from public.cart_items where user_id = p_user_id;
  return v_order;
end $$;

revoke all on function public.create_order from public, anon, authenticated;
grant execute on function public.create_order to service_role;

-- ───────── Row Level Security ─────────
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.email_logs  enable row level security;

create policy "categories readable" on public.categories for select using (true);
create policy "products readable"   on public.products   for select using (is_available);

create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "own cart select" on public.cart_items for select using (auth.uid() = user_id);
create policy "own cart insert" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "own cart update" on public.cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart delete" on public.cart_items for delete using (auth.uid() = user_id);

create policy "own orders select" on public.orders for select using (auth.uid() = user_id);
create policy "own order items select" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
-- email_logs: no policies => no client access (service role bypasses RLS)
