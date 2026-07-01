create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_display_name_length_check check (
    display_name is null or char_length(display_name) <= 100
  )
);

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_length_check check (char_length(name) between 2 and 100),
  constraint projects_description_length_check check (
    description is null or char_length(description) <= 1000
  ),
  constraint projects_status_check check (status in ('active', 'archived'))
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id),
  constraint project_members_role_check check (role in ('owner', 'member'))
);

create table public.time_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null,
  duration_minutes integer not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_entries_duration_minutes_check check (
    duration_minutes between 1 and 1440
  ),
  constraint time_entries_description_length_check check (
    description is null or char_length(description) <= 500
  )
);

create unique index project_members_one_owner_per_project_idx
  on public.project_members (project_id)
  where role = 'owner';

create index projects_owner_id_idx on public.projects (owner_id);
create index project_members_user_id_idx on public.project_members (user_id);
create index time_entries_user_id_idx on public.time_entries (user_id);
create index time_entries_project_id_idx on public.time_entries (project_id);
create index time_entries_entry_date_idx on public.time_entries (entry_date);
create index time_entries_user_entry_date_idx
  on public.time_entries (user_id, entry_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger time_entries_set_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role = 'admin'
  );
$$;

create or replace function public.is_project_member(
  p_project_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.project_members
    where project_members.project_id = p_project_id
      and project_members.user_id = p_user_id
  );
$$;

create or replace function public.is_project_owner(
  p_project_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.project_members
    where project_members.project_id = p_project_id
      and project_members.user_id = p_user_id
      and role = 'owner'
  );
$$;

create or replace function public.is_project_active(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.projects
    where projects.id = p_project_id
      and status = 'active'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
revoke all on function public.is_project_member(uuid, uuid) from public;
revoke all on function public.is_project_owner(uuid, uuid) from public;
revoke all on function public.is_project_active(uuid) from public;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_project_member(uuid, uuid) to authenticated;
grant execute on function public.is_project_owner(uuid, uuid) to authenticated;
grant execute on function public.is_project_active(uuid) to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, email),
    display_name = coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      display_name
    )
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_from_auth_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    raise exception 'Users cannot change their own role.';
  end if;

  if auth.uid() = old.id and new.email is distinct from old.email then
    raise exception 'Profile email is managed by Supabase Auth.';
  end if;

  if auth.uid() = old.id and new.created_at is distinct from old.created_at then
    raise exception 'Profile creation timestamp cannot be changed.';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create or replace function public.create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  return new;
end;
$$;

create trigger projects_create_owner_membership
  after insert on public.projects
  for each row execute function public.create_owner_membership();

create or replace function public.prevent_project_owner_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Project ownership transfer is not supported by this MVP.';
  end if;

  return new;
end;
$$;

create trigger projects_prevent_owner_change
  before update on public.projects
  for each row execute function public.prevent_project_owner_change();

create or replace function public.protect_project_owner_membership()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  project_owner_id uuid;
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' then
      raise exception 'Owner membership cannot be removed.';
    end if;

    return old;
  end if;

  select owner_id
  into project_owner_id
  from public.projects
  where id = new.project_id;

  if new.role = 'owner' and new.user_id <> project_owner_id then
    raise exception 'Only the project owner can have owner membership.';
  end if;

  if tg_op = 'UPDATE' and (
    old.role = 'owner'
    or new.role = 'owner'
    or new.project_id is distinct from old.project_id
    or new.user_id is distinct from old.user_id
  ) then
    raise exception 'Project owner membership cannot be changed.';
  end if;

  return new;
end;
$$;

create trigger project_members_protect_owner_insert_update
  before insert or update on public.project_members
  for each row execute function public.protect_project_owner_membership();

create trigger project_members_protect_owner_delete
  before delete on public.project_members
  for each row execute function public.protect_project_owner_membership();

create or replace function public.enforce_time_entry_user()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required for time entries.';
  end if;

  if tg_op = 'INSERT' then
    new.user_id = auth.uid();
    return new;
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'Time entry ownership cannot be changed.';
  end if;

  return new;
end;
$$;

create trigger time_entries_enforce_user
  before insert or update on public.time_entries
  for each row execute function public.enforce_time_entry_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.time_entries enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "profiles_update_own_safe_fields"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "projects_select_members"
  on public.projects
  for select
  to authenticated
  using (
    public.is_project_member(id, auth.uid())
    or public.is_admin(auth.uid())
  );

create policy "projects_insert_own"
  on public.projects
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "projects_update_owner"
  on public.projects
  for update
  to authenticated
  using (
    public.is_project_owner(id, auth.uid())
    or public.is_admin(auth.uid())
  )
  with check (
    public.is_project_owner(id, auth.uid())
    or public.is_admin(auth.uid())
  );

create policy "project_members_select_project_members"
  on public.project_members
  for select
  to authenticated
  using (
    public.is_project_member(project_id, auth.uid())
    or public.is_admin(auth.uid())
  );

create policy "project_members_insert_by_owner"
  on public.project_members
  for insert
  to authenticated
  with check (
    role = 'member'
    and (
      public.is_project_owner(project_id, auth.uid())
      or public.is_admin(auth.uid())
    )
  );

create policy "project_members_delete_by_owner"
  on public.project_members
  for delete
  to authenticated
  using (
    role = 'member'
    and (
      public.is_project_owner(project_id, auth.uid())
      or public.is_admin(auth.uid())
    )
  );

create policy "time_entries_select_own_or_project_owner"
  on public.time_entries
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_project_owner(project_id, auth.uid())
    or public.is_admin(auth.uid())
  );

create policy "time_entries_insert_own_member_entries"
  on public.time_entries
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_project_member(project_id, auth.uid())
    and public.is_project_active(project_id)
  );

create policy "time_entries_update_own_entries"
  on public.time_entries
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.is_project_member(project_id, auth.uid())
    and public.is_project_active(project_id)
  );

create policy "time_entries_delete_own_entries"
  on public.time_entries
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.projects to authenticated;
grant select, insert, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.time_entries to authenticated;
