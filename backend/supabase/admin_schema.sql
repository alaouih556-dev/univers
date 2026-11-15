-- Luxor Création — admin data (clients, projects, payments, messages, quotes).
-- Private business data: readable and writable ONLY by admins (public.is_admin(), see schema.sql).
-- Safe to run more than once:  psql "$SUPABASE_DB_URL" -f backend/supabase/admin_schema.sql

begin;

-- ---------- tables ----------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(name) between 1 and 120),
  type       text not null default 'individual' check (type in ('individual','company','hotel','office','riad','clinic','school','restaurant')),
  phone      text not null default '' check (length(phone) <= 40),
  email      text not null default '' check (email = '' or email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  city       text not null default '' check (length(city) <= 80),
  address    text not null default '' check (length(address) <= 200),
  sample     boolean not null default false,          -- demo rows, removable from Settings
  created_at timestamptz not null default now()
);
create unique index if not exists clients_name_uq on public.clients (lower(name));

create sequence if not exists public.project_ref_seq;
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique default ('LUX-P' || lpad(nextval('public.project_ref_seq')::text, 3, '0')),
  title          text not null check (length(title) between 1 and 140),
  client_id      uuid not null references public.clients(id) on delete cascade,
  type           text not null default 'custom' check (type in ('catalog','custom','interior')),
  status         text not null default 'started' check (status in ('started','in_progress','finished')),
  description    text not null default '' check (length(description) <= 4000),
  start_date     date not null default current_date,
  delivery_date  date,
  completed_date date,
  total_price    integer not null default 0 check (total_price >= 0),   -- MAD
  steps          jsonb not null default '{"design":false,"materials":false,"fabrication":false,"finishing":false,"delivery":false}',
  created_at     timestamptz not null default now()
);
create index if not exists projects_client_idx on public.projects(client_id);

create table if not exists public.project_pieces (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name       text not null,
  qty        numeric(10,2) not null default 1 check (qty > 0),
  material   text not null default '',
  finish     text not null default '',
  dimensions text not null default '',
  image      text not null default '',
  sort       integer not null default 0
);
create index if not exists pieces_project_idx on public.project_pieces(project_id, sort);

create table if not exists public.project_events (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date       date not null default current_date,
  type       text not null check (type in ('status','note','payment','step')),
  status     text check (status in ('started','in_progress','finished')),
  text       text not null check (length(text) between 1 and 600),
  created_at timestamptz not null default now()
);
create index if not exists events_project_idx on public.project_events(project_id, date);

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date       date not null default current_date check (date <= current_date),
  amount     integer not null check (amount > 0),
  label      text not null default 'installment' check (label in ('deposit','installment','balance')),
  method     text not null default 'Bank transfer' check (method in ('Bank transfer','Cheque','Card','Cash')),
  created_at timestamptz not null default now()
);
create index if not exists payments_project_idx on public.payments(project_id);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  from_name  text not null,
  email      text not null default '',
  subject    text not null default '',
  body       text not null default '',
  date       date not null default current_date,
  read       boolean not null default false,
  sample     boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,                                 -- set by trigger: DEV-2026-001
  client_id   uuid not null references public.clients(id) on delete cascade,
  date        date not null default current_date,
  valid_days  integer not null default 30 check (valid_days between 1 and 365),
  title       text not null default 'Quote' check (length(title) between 1 and 140),
  type        text not null default 'custom' check (type in ('catalog','custom','interior')),
  status      text not null default 'draft' check (status in ('draft','sent','accepted','refused')),
  discount    numeric(5,2) not null default 0 check (discount between 0 and 100),   -- %
  vat         boolean not null default true,                                       -- TVA 20 %
  deposit_pct integer not null default 40 check (deposit_pct between 0 and 100),   -- avance %
  notes       text not null default '' check (length(notes) <= 1200),
  project_id  uuid references public.projects(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists quotes_client_idx on public.quotes(client_id);

create table if not exists public.quote_items (
  id       uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  label    text not null check (length(label) between 1 and 200),
  qty      numeric(10,2) not null check (qty > 0),
  unit     integer not null check (unit >= 0),          -- unit price, MAD (HT)
  sort     integer not null default 0,
  -- product shown on the quote (filled from the catalogue, editable); see quote_items_details.sql
  product_slug text not null default '' check (length(product_slug) <= 120),
  image        text not null default '' check (length(image) <= 500),
  description  text not null default '' check (length(description) <= 1000),
  material     text not null default '' check (length(material) <= 200),
  dimensions   text not null default '' check (length(dimensions) <= 200),
  color        text not null default '' check (length(color) <= 200)
);
create index if not exists quote_items_quote_idx on public.quote_items(quote_id, sort);

-- revenue booked before this admin existed (for the monthly chart), MAD
create table if not exists public.revenue_history (
  year   integer not null,
  month  integer not null check (month between 1 and 12),
  amount integer not null default 0 check (amount >= 0),
  sample boolean not null default false,
  primary key (year, month)
);

-- ---------- business rules (backend) ----------
-- quote number DEV-YYYY-NNN
create or replace function public.quotes_set_number() returns trigger language plpgsql set search_path = public as $$
declare y text := to_char(coalesce(new.date, current_date), 'YYYY'); n integer;
begin
  if new.number is null or new.number = '' then
    perform pg_advisory_xact_lock(hashtext('quote_number_' || y));
    select coalesce(max(substring(number from '^DEV-\d{4}-(\d+)$')::int), 0) + 1 into n from public.quotes where number like 'DEV-' || y || '-%';
    new.number := 'DEV-' || y || '-' || lpad(n::text, 3, '0');
  end if;
  return new;
end $$;
drop trigger if exists quotes_number on public.quotes;
create trigger quotes_number before insert on public.quotes for each row execute function public.quotes_set_number();

-- quote total (TTC) as computed for the client
create or replace function public.quote_total(q public.quotes) returns integer language sql stable set search_path = public as $$
  with s as (select coalesce(sum(round(qty * unit)), 0)::numeric as sub from public.quote_items where quote_id = q.id),
       n as (select sub - round(sub * q.discount / 100) as net from s)
  select (net + case when q.vat then round(net * 0.2) else 0 end)::int from n;
$$;

-- a payment can never exceed what is still due
create or replace function public.payments_check() returns trigger language plpgsql set search_path = public as $$
declare total integer; paid integer;
begin
  select total_price into total from public.projects where id = new.project_id for update;
  select coalesce(sum(amount), 0) into paid from public.payments where project_id = new.project_id and id <> new.id;
  if paid + new.amount > total then
    raise exception 'The amount is higher than the remaining % MAD.', to_char(total - paid, 'FM999G999G999') using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists payments_guard on public.payments;
create trigger payments_guard before insert or update on public.payments for each row execute function public.payments_check();

-- status changes: completion date, all steps done when finished, timeline entry
create or replace function public.projects_status_change() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'finished' then
      new.completed_date := coalesce(new.completed_date, current_date);
      new.steps := '{"design":true,"materials":true,"fabrication":true,"finishing":true,"delivery":true}';
    else
      new.completed_date := null;
    end if;
    insert into public.project_events(project_id, type, status, text)
    values (new.id, 'status', new.status, 'Status changed to ' || case new.status when 'started' then 'Started' when 'in_progress' then 'In Progress' else 'Finished' end || '.');
  end if;
  return new;
end $$;
drop trigger if exists projects_status on public.projects;
create trigger projects_status before update of status on public.projects for each row execute function public.projects_status_change();

-- accepted quote -> new project (status Started); returns the project id
create or replace function public.convert_quote(quote_id uuid) returns uuid language plpgsql security invoker set search_path = public as $$
declare q public.quotes; pid uuid; total integer;
begin
  if not public.is_admin() then raise exception 'Not allowed' using errcode = '42501'; end if;
  select * into q from public.quotes where id = quote_id for update;
  if not found then raise exception 'Quote not found.'; end if;
  if q.project_id is not null and exists (select 1 from public.projects where id = q.project_id) then return q.project_id; end if;
  if not exists (select 1 from public.quote_items where quote_items.quote_id = q.id) then raise exception 'The quote has no lines.'; end if;
  total := public.quote_total(q);
  insert into public.projects(title, client_id, type, status, description, start_date, delivery_date, total_price)
  values (q.title, q.client_id, q.type, 'started', 'Created from quote ' || q.number || '.' || case when q.notes <> '' then ' ' || q.notes else '' end, current_date, current_date + 45, total)
  returning id into pid;
  insert into public.project_pieces(project_id, name, qty, material, finish, dimensions, image, sort)
  select pid, label, qty, coalesce(nullif(material, ''), '—'), coalesce(nullif(color, ''), '—'), coalesce(nullif(dimensions, ''), '—'), coalesce(nullif(image, ''), 'hero-ivoire.webp'), sort
  from public.quote_items where quote_items.quote_id = q.id;
  insert into public.project_events(project_id, type, status, text)
  values (pid, 'status', 'started', 'Project created from quote ' || q.number || ' (' || to_char(total, 'FM999G999G999') || ' MAD).');
  update public.quotes set status = 'accepted', project_id = pid where id = q.id;
  return pid;
end $$;
revoke all on function public.convert_quote(uuid) from public, anon;
grant execute on function public.convert_quote(uuid) to authenticated;

-- ---------- row level security: admins only ----------
do $$
declare t text;
begin
  foreach t in array array['clients','projects','project_pieces','project_events','payments','messages','quotes','quote_items','revenue_history'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
grant usage on sequence public.project_ref_seq to authenticated;

commit;

-- ---------- company details printed on quotes (single row) ----------
begin;
create table if not exists public.company (
  id         integer primary key default 1 check (id = 1),
  name       text not null default 'Luxor Création' check (length(name) between 1 and 120),
  tagline    text not null default 'Mobilier & agencement sur mesure',
  address    text not null default '',
  city       text not null default 'Marrakech',
  phone      text not null default '',
  email      text not null default '',
  website    text not null default '',
  ice        text not null default '',   -- Identifiant Commun de l'Entreprise
  rc         text not null default '',   -- Registre de Commerce
  if_number  text not null default '',   -- Identifiant Fiscal
  patente    text not null default '',
  bank       text not null default '',   -- RIB shown on quotes
  updated_at timestamptz not null default now()
);
insert into public.company (id) values (1) on conflict do nothing;
alter table public.company enable row level security;
drop policy if exists "admin all" on public.company;
create policy "admin all" on public.company for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.company from anon;
grant select, insert, update on public.company to authenticated;
commit;
