-- Luxor Création — purchase orders (bons de commande).
-- A purchase order confirms what the client actually orders. It can start from a quote and be
-- changed freely (e.g. 4 tables on the quote → 3 black + 1 white on the order).
-- Run once in Supabase → SQL Editor, after admin_schema.sql (safe to run again).
begin;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  number           text not null unique,                                  -- set by trigger: BC-2026-001
  client_id        uuid not null references public.clients(id) on delete cascade,
  quote_id         uuid references public.quotes(id) on delete set null,  -- the quote it comes from, if any
  date             date not null default current_date,
  title            text not null default 'Order' check (length(title) between 1 and 140),
  type             text not null default 'custom' check (type in ('catalog','custom','interior')),
  status           text not null default 'draft' check (status in ('draft','confirmed','delivered','cancelled')),
  discount         numeric(5,2) not null default 0 check (discount between 0 and 100),   -- %
  vat              boolean not null default true,                                       -- TVA 20 %
  deposit_pct      integer not null default 40 check (deposit_pct between 0 and 100),   -- acompte %
  payment_method   text not null default 'Bank transfer' check (payment_method in ('Bank transfer','Cheque','Card','Cash')),
  delivery_address text not null default '' check (length(delivery_address) <= 300),
  delivery_date    date,
  client_ice       text not null default '' check (length(client_ice) <= 40),           -- ICE of a company client
  notes            text not null default '' check (length(notes) <= 1200),
  created_at       timestamptz not null default now()
);
create index if not exists orders_client_idx on public.orders(client_id);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  label        text not null check (length(label) between 1 and 200),
  qty          numeric(10,2) not null check (qty > 0),
  unit         integer not null check (unit >= 0),          -- unit price, MAD (HT)
  sort         integer not null default 0,
  product_slug text not null default '' check (length(product_slug) <= 120),
  image        text not null default '' check (length(image) <= 500),
  description  text not null default '' check (length(description) <= 1000),
  material     text not null default '' check (length(material) <= 200),
  dimensions   text not null default '' check (length(dimensions) <= 200),
  color        text not null default '' check (length(color) <= 200)
);
create index if not exists order_items_order_idx on public.order_items(order_id, sort);

-- order number BC-YYYY-NNN
create or replace function public.orders_set_number() returns trigger language plpgsql set search_path = public as $$
declare y text := to_char(coalesce(new.date, current_date), 'YYYY'); n integer;
begin
  if new.number is null or new.number = '' then
    perform pg_advisory_xact_lock(hashtext('order_number_' || y));
    select coalesce(max(substring(number from '^BC-\d{4}-(\d+)$')::int), 0) + 1 into n from public.orders where number like 'BC-' || y || '-%';
    new.number := 'BC-' || y || '-' || lpad(n::text, 3, '0');
  end if;
  return new;
end $$;
drop trigger if exists orders_number on public.orders;
create trigger orders_number before insert on public.orders for each row execute function public.orders_set_number();

-- admins only
do $$
declare t text;
begin
  foreach t in array array['orders','order_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
