-- Luxor Création — quote lines with product photo, description and details.
-- Run once in Supabase → SQL Editor (safe to run again). Existing quotes keep working.
begin;

alter table public.quote_items
  add column if not exists product_slug text not null default '' check (length(product_slug) <= 120),
  add column if not exists image        text not null default '' check (length(image) <= 500),
  add column if not exists description  text not null default '' check (length(description) <= 1000),
  add column if not exists material     text not null default '' check (length(material) <= 200),
  add column if not exists dimensions   text not null default '' check (length(dimensions) <= 200),
  add column if not exists color        text not null default '' check (length(color) <= 200);

-- accepted quote -> new project: the furniture pieces now keep the photo and details of each line
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

notify pgrst, 'reload schema';
commit;
