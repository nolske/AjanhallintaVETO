drop policy if exists "projects_update_owner" on public.projects;

create policy "projects_update_owner"
  on public.projects
  for update
  to authenticated
  using (public.is_project_owner(id, auth.uid()))
  with check (public.is_project_owner(id, auth.uid()));

drop policy if exists "project_members_insert_by_owner" on public.project_members;

create policy "project_members_insert_by_owner"
  on public.project_members
  for insert
  to authenticated
  with check (
    role = 'member'
    and public.is_project_owner(project_id, auth.uid())
  );

drop policy if exists "project_members_delete_by_owner" on public.project_members;

create policy "project_members_delete_by_owner"
  on public.project_members
  for delete
  to authenticated
  using (
    role = 'member'
    and public.is_project_owner(project_id, auth.uid())
  );

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
  if not public.is_project_owner(p_project_id, auth.uid()) then
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
  if not public.is_project_owner(p_project_id, auth.uid()) then
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
