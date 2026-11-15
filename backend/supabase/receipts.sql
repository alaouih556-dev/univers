-- Luxor Création — reception notes (bons de réception).
-- INTERNAL document made by Luxor when goods arrive from a SUPPLIER, after a physical check:
-- supplier + its delivery note (BL fournisseur), quantity received and condition of each line,
-- prices without VAT. A compliant note ("validated") allows paying the supplier; a dispute blocks it.
-- Each reception note belongs to a client (the goods are received for that client), optionally to one of its purchase orders.
-- Run in Supabase → SQL Editor (safe to run again).
begin;

-- the first version (client reception, linked to a client delivery note) is replaced; it never held data
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'receipts' and column_name = 'delivery_id') then
    drop table public.receipt_items;
    drop table public.receipts;
  end if;
end $$;

create table if not exists public.receipts (
  id               uuid primary key default gen_random_uuid(),
  number           text not null unique,                                   -- set by trigger: BR-2026-001
  client_id        uuid not null references public.clients(id) on delete cascade,   -- client the goods are for
  date             date not null default current_date,                     -- reception date
  supplier_name    text not null check (length(supplier_name) between 1 and 120),
  supplier_phone   text not null default '' check (length(supplier_phone) <= 40),
  supplier_ice     text not null default '' check (length(supplier_ice) <= 40),
  supplier_bl      text not null default '' check (length(supplier_bl) <= 60),   -- supplier delivery note number
  supplier_bl_date date,
  order_id         uuid references public.orders(id) on delete set null,   -- client purchase order the goods are for (optional)
  received_by      text not null default '' check (length(received_by) <= 120),
  status           text not null default 'draft' check (status in ('draft','validated','dispute')),
  notes            text not null default '' check (length(notes) <= 1200),
  created_at       timestamptz not null default now()
);
create index if not exists receipts_order_idx on public.receipts(order_id);

-- receipts created before reception notes were per client: add the client column
alter table public.receipts add column if not exists client_id uuid references public.clients(id) on delete cascade;
update public.receipts r set client_id = o.client_id from public.orders o where r.client_id is null and r.order_id = o.id;
delete from public.receipt_items where receipt_id in (select id from public.receipts where client_id is null);
delete from public.receipts where client_id is null;   -- a note without any client cannot be kept (none existed)
alter table public.receipts alter column client_id set not null;
create index if not exists receipts_client_idx on public.receipts(client_id);

create table if not exists public.receipt_items (
  id          uuid primary key default gen_random_uuid(),
  receipt_id  uuid not null references public.receipts(id) on delete cascade,
  label       text not null check (length(label) between 1 and 200),
  reference   text not null default '' check (length(reference) <= 80),         -- supplier / product reference
  qty_ordered numeric(10,2) check (qty_ordered is null or qty_ordered > 0),
  qty         numeric(10,2) not null check (qty >= 0),                         -- quantity actually received
  condition   text not null default 'ok' check (condition in ('ok','damaged','missing')),
  unit        integer not null default 0 check (unit >= 0),                    -- unit price, MAD, without VAT
  sort        integer not null default 0
);
create index if not exists receipt_items_receipt_idx on public.receipt_items(receipt_id, sort);

-- reception note number BR-YYYY-NNN
create or replace function public.receipts_set_number() returns trigger language plpgsql set search_path = public as $$
declare y text := to_char(coalesce(new.date, current_date), 'YYYY'); n integer;
begin
  if new.number is null or new.number = '' then
    perform pg_advisory_xact_lock(hashtext('receipt_number_' || y));
    select coalesce(max(substring(number from '^BR-\d{4}-(\d+)$')::int), 0) + 1 into n from public.receipts where number like 'BR-' || y || '-%';
    new.number := 'BR-' || y || '-' || lpad(n::text, 3, '0');
  end if;
  return new;
end $$;
drop trigger if exists receipts_number on public.receipts;
create trigger receipts_number before insert on public.receipts for each row execute function public.receipts_set_number();

-- admins only
do $$
declare t text;
begin
  foreach t in array array['receipts','receipt_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
