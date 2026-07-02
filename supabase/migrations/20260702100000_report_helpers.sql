create or replace function public.get_my_report_entries(
  p_start_date date default null,
  p_end_date date default null,
  p_project_id uuid default null,
  p_project_status text default null
)
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
  where te.user_id = auth.uid()
    and (p_start_date is null or te.entry_date >= p_start_date)
    and (p_end_date is null or te.entry_date <= p_end_date)
    and (p_project_id is null or te.project_id = p_project_id)
    and (
      p_project_status is null
      or p_project_status = 'all'
      or p.status = p_project_status
    )
  order by te.entry_date desc, te.created_at desc;
$$;

revoke all on function public.get_my_report_entries(date, date, uuid, text) from public;
grant execute on function public.get_my_report_entries(date, date, uuid, text) to authenticated;
