create or replace function public.validate_time_entry_rules()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.entry_date > current_date then
    raise exception 'Time entry date cannot be in the future.';
  end if;

  if tg_op = 'INSERT' or new.project_id is distinct from old.project_id then
    if not public.is_project_active(new.project_id) then
      raise exception 'Archived projects cannot accept new time entries.';
    end if;
  end if;

  return new;
end;
$$;

create trigger time_entries_validate_rules
  before insert or update on public.time_entries
  for each row execute function public.validate_time_entry_rules();

drop policy if exists "time_entries_update_own_entries" on public.time_entries;

create policy "time_entries_update_own_entries"
  on public.time_entries
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.is_project_member(project_id, auth.uid())
  );

create or replace function public.get_time_entry_projects()
returns table (
  project_id uuid,
  name text,
  status text,
  user_role text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id as project_id,
    p.name,
    p.status,
    pm.role as user_role
  from public.projects p
  join public.project_members pm
    on pm.project_id = p.id
   and pm.user_id = auth.uid()
  order by p.status, p.name;
$$;

create or replace function public.get_my_time_entries(p_project_id uuid default null)
returns table (
  entry_id uuid,
  project_id uuid,
  project_name text,
  project_status text,
  user_id uuid,
  entry_date date,
  duration_minutes integer,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    te.id as entry_id,
    te.project_id,
    p.name as project_name,
    p.status as project_status,
    te.user_id,
    te.entry_date,
    te.duration_minutes,
    te.description,
    te.created_at,
    te.updated_at
  from public.time_entries te
  join public.projects p
    on p.id = te.project_id
  where te.user_id = auth.uid()
    and (p_project_id is null or te.project_id = p_project_id)
  order by te.entry_date desc, te.created_at desc;
$$;

create or replace function public.get_project_time_entries(p_project_id uuid)
returns table (
  entry_id uuid,
  project_id uuid,
  project_name text,
  project_status text,
  user_id uuid,
  user_email text,
  user_display_name text,
  entry_date date,
  duration_minutes integer,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    te.id as entry_id,
    te.project_id,
    p.name as project_name,
    p.status as project_status,
    te.user_id,
    profile.email as user_email,
    profile.display_name as user_display_name,
    te.entry_date,
    te.duration_minutes,
    te.description,
    te.created_at,
    te.updated_at
  from public.time_entries te
  join public.projects p
    on p.id = te.project_id
  join public.profiles profile
    on profile.id = te.user_id
  where te.project_id = p_project_id
    and (
      te.user_id = auth.uid()
      or public.is_project_owner(p_project_id, auth.uid())
      or public.is_admin(auth.uid())
    )
    and public.is_project_member(p_project_id, auth.uid())
  order by te.entry_date desc, te.created_at desc;
$$;

create or replace function public.get_time_entry_for_edit(p_entry_id uuid)
returns table (
  entry_id uuid,
  project_id uuid,
  project_name text,
  project_status text,
  entry_date date,
  duration_minutes integer,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    te.id as entry_id,
    te.project_id,
    p.name as project_name,
    p.status as project_status,
    te.entry_date,
    te.duration_minutes,
    te.description,
    te.created_at,
    te.updated_at
  from public.time_entries te
  join public.projects p
    on p.id = te.project_id
  where te.id = p_entry_id
    and te.user_id = auth.uid();
$$;

revoke all on function public.validate_time_entry_rules() from public;
revoke all on function public.get_time_entry_projects() from public;
revoke all on function public.get_my_time_entries(uuid) from public;
revoke all on function public.get_project_time_entries(uuid) from public;
revoke all on function public.get_time_entry_for_edit(uuid) from public;

grant execute on function public.get_time_entry_projects() to authenticated;
grant execute on function public.get_my_time_entries(uuid) to authenticated;
grant execute on function public.get_project_time_entries(uuid) to authenticated;
grant execute on function public.get_time_entry_for_edit(uuid) to authenticated;
