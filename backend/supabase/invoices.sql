-- Luxor Création — invoices (factures).
-- Issued for a project once it is fully paid (remaining = 0). An invoice is a legal document
-- (Morocco, CGI art. 145): sequential number without gaps, and it cannot be changed or deleted —
-- client, company, lines, totals and payments are stored as they were when it was issued.
-- Run once in Supabase → SQL Editor, after admin_schema.sql (safe to run again).
begin;

create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  number         text not null unique,                                   -- set by trigger: FA-2026-0001
  project_id     uuid not null unique references public.projects(id) on delete restrict,   -- one invoice per project
  client_id      uuid not null references public.clients(id) on delete restrict,
  date           date not null default current_date,
  client         jsonb not null,           -- name, address, city, phone, email, ice (as on the invoice day)
  company        jsonb not null,           -- seller identity: name, address, ICE, IF, RC, patente, bank…
  lines          jsonb not null,           -- [{label, description, qty, unit (HT), total (HT)}]
  discount_pct   numeric(5,2) not null default 0,
  subtotal       integer not null,         -- HT before discount, MAD
  discount       integer not null default 0,
  net            integer not null,         -- HT after discount
  vat_rate       integer not null default 20,
  vat            integer not null,
  total          integer not null check (total > 0),   -- TTC
  payments       jsonb not null,           -- [{date, amount, method, label}] — all payments received
  quote_number   text not null default '',
  order_number   text not null default '',
  created_at     timestamptz not null default now()
);
create index if not exists invoices_client_idx on public.invoices(client_id);

-- invoice number FA-YYYY-NNNN, consecutive within the year
create or replace function public.invoices_set_number() returns trigger language plpgsql set search_path = public as $$
declare y text := to_char(coalesce(new.date, current_date), 'YYYY'); n integer;
begin
  perform pg_advisory_xact_lock(hashtext('invoice_number_' || y));
  select coalesce(max(substring(number from '^FA-\d{4}-(\d+)$')::int), 0) + 1 into n from public.invoices where number like 'FA-' || y || '-%';
  new.number := 'FA-' || y || '-' || lpad(n::text, 4, '0');
  return new;
end $$;
drop trigger if exists invoices_number on public.invoices;
create trigger invoices_number before insert on public.invoices for each row execute function public.invoices_set_number();

-- admins can create and read invoices — never change or delete them
alter table public.invoices enable row level security;
drop policy if exists "admin read" on public.invoices;
drop policy if exists "admin insert" on public.invoices;
create policy "admin read" on public.invoices for select to authenticated using (public.is_admin());
create policy "admin insert" on public.invoices for insert to authenticated with check (public.is_admin());
revoke all on public.invoices from anon;
revoke update, delete, truncate, references, trigger on public.invoices from authenticated;
grant select, insert on public.invoices to authenticated;

notify pgrst, 'reload schema';
commit;
