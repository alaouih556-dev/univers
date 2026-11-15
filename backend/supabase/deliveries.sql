-- Luxor Création — delivery notes (bons de livraison).
-- A delivery note records what was actually delivered to the client, usually from a purchase order.
-- One order can be delivered in several times (partial deliveries). No prices on the note.
-- Run once in Supabase → SQL Editor, after orders.sql (safe to run again).
begin;

create table if not exists public.deliveries (
  id               uuid primary key default gen_random_uuid(),
  number           text not null unique,                                   -- set by trigger: BL-2026-001
  client_id        uuid not null references public.clients(id) on delete cascade,
  order_id         uuid references public.orders(id) on delete set null,   -- the purchase order it delivers, if any
  date             date not null default current_date,
  status           text not null default 'draft' check (status in ('draft','delivered')),   -- delivered = signed by the client
  delivery_address text not null default '' check (length(delivery_address) <= 300),
  carrier          text not null default '' check (length(carrier) <= 120),                 -- driver / transporter
  notes            text not null default '' check (length(notes) <= 1200),                  -- remarks, client reservations
  created_at       timestamptz not null default now()
);
create index if not exists deliveries_client_idx on public.deliveries(client_id);
create index if not exists deliveries_order_idx on public.deliveries(order_id);

create table if not exists public.delivery_items (
  id          uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  label       text not null check (length(label) between 1 and 200),
  qty         numeric(10,2) not null check (qty > 0),               -- quantity delivered
  qty_ordered numeric(10,2) check (qty_ordered is null or qty_ordered > 0),
  sort        integer not null default 0,
  image       text not null default '' check (length(image) <= 500),
  description text not null default '' check (length(description) <= 1000),
  material    text not null default '' check (length(material) <= 200),
  dimensions  text not null default '' check (length(dimensions) <= 200),
  color       text not null default '' check (length(color) <= 200)
);
create index if not exists delivery_items_delivery_idx on public.delivery_items(delivery_id, sort);

-- delivery note number BL-YYYY-NNN
create or replace function public.deliveries_set_number() returns trigger language plpgsql set search_path = public as $$
declare y text := to_char(coalesce(new.date, current_date), 'YYYY'); n integer;
begin
  if new.number is null or new.number = '' then
    perform pg_advisory_xact_lock(hashtext('delivery_number_' || y));
    select coalesce(max(substring(number from '^BL-\d{4}-(\d+)$')::int), 0) + 1 into n from public.deliveries where number like 'BL-' || y || '-%';
    new.number := 'BL-' || y || '-' || lpad(n::text, 3, '0');
  end if;
  return new;
end $$;
drop trigger if exists deliveries_number on public.deliveries;
create trigger deliveries_number before insert on public.deliveries for each row execute function public.deliveries_set_number();

-- admins only
do $$
declare t text;
begin
  foreach t in array array['deliveries','delivery_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
