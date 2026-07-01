create or replace function public.get_my_project_summaries()
returns table (
  project_id uuid,
  name text,
  description text,
  owner_id uuid,
  owner_email text,
  owner_display_name text,
  status text,
  user_role text,
  member_count bigint,
  current_user_minutes bigint,
  total_minutes bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id as project_id,
    p.name,
    p.description,
    p.owner_id,
    owner_profile.email as owner_email,
    owner_profile.display_name as owner_display_name,
    p.status,
    current_member.role as user_role,
    member_stats.member_count,
    user_time.current_user_minutes,
    case
      when current_member.role = 'owner' or public.is_admin(auth.uid()) then
        project_time.total_minutes
      else null
    end as total_minutes
  from public.projects p
  join public.project_members current_member
    on current_member.project_id = p.id
   and current_member.user_id = auth.uid()
  join public.profiles owner_profile
    on owner_profile.id = p.owner_id
  cross join lateral (
    select count(*)::bigint as member_count
    from public.project_members pm
    where pm.project_id = p.id
  ) member_stats
  cross join lateral (
    select coalesce(sum(duration_minutes), 0)::bigint as current_user_minutes
    from public.time_entries te
    where te.project_id = p.id
      and te.user_id = auth.uid()
  ) user_time
  cross join lateral (
    select coalesce(sum(duration_minutes), 0)::bigint as total_minutes
    from public.time_entries te
    where te.project_id = p.id
  ) project_time;
$$;

create or replace function public.get_project_detail(p_project_id uuid)
returns table (
  project_id uuid,
  name text,
  description text,
  owner_id uuid,
  owner_email text,
  owner_display_name text,
  status text,
  user_role text,
  member_count bigint,
  current_user_minutes bigint,
  total_minutes bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select *
  from public.get_my_project_summaries()
  where project_id = p_project_id;
$$;

create or replace function public.get_project_members(p_project_id uuid)
returns table (
  user_id uuid,
  email text,
  display_name text,
  role text,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    pm.user_id,
    p.email,
    p.display_name,
    pm.role,
    pm.joined_at
  from public.project_members pm
  join public.profiles p
    on p.id = pm.user_id
  where pm.project_id = p_project_id
    and (
      public.is_project_member(p_project_id, auth.uid())
      or public.is_admin(auth.uid())
    )
  order by
    case pm.role when 'owner' then 0 else 1 end,
    p.display_name nulls last,
    p.email;
$$;

create or replace function public.add_project_member_by_email(
  p_project_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_user_id uuid;
  normalized_email text;
begin
  if not (
    public.is_project_owner(p_project_id, auth.uid())
    or public.is_admin(auth.uid())
  ) then
    return 'not_allowed';
  end if;

  normalized_email := lower(trim(p_email));

  select id
  into target_user_id
  from public.profiles
  where lower(email) = normalized_email
  limit 1;

  if target_user_id is null then
    return 'not_found';
  end if;

  if exists (
    select 1
    from public.project_members
    where project_id = p_project_id
      and user_id = target_user_id
  ) then
    return 'already_member';
  end if;

  insert into public.project_members (project_id, user_id, role)
  values (p_project_id, target_user_id, 'member');

  return 'added';
end;
$$;

create or replace function public.remove_project_member(
  p_project_id uuid,
  p_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_role text;
begin
  if not (
    public.is_project_owner(p_project_id, auth.uid())
    or public.is_admin(auth.uid())
  ) then
    return 'not_allowed';
  end if;

  select role
  into target_role
  from public.project_members
  where project_id = p_project_id
    and user_id = p_user_id;

  if target_role is null then
    return 'not_found';
  end if;

  if target_role = 'owner' then
    return 'owner_not_removed';
  end if;

  delete from public.project_members
  where project_id = p_project_id
    and user_id = p_user_id
    and role = 'member';

  return 'removed';
end;
$$;

revoke all on function public.get_my_project_summaries() from public;
revoke all on function public.get_project_detail(uuid) from public;
revoke all on function public.get_project_members(uuid) from public;
revoke all on function public.add_project_member_by_email(uuid, text) from public;
revoke all on function public.remove_project_member(uuid, uuid) from public;

grant execute on function public.get_my_project_summaries() to authenticated;
grant execute on function public.get_project_detail(uuid) to authenticated;
grant execute on function public.get_project_members(uuid) to authenticated;
grant execute on function public.add_project_member_by_email(uuid, text) to authenticated;
grant execute on function public.remove_project_member(uuid, uuid) to authenticated;
