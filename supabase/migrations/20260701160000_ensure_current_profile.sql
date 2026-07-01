create or replace function public.ensure_current_profile()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  current_email text;
  current_display_name text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  current_email := coalesce(auth.jwt() ->> 'email', '');
  current_display_name := nullif(auth.jwt() -> 'user_metadata' ->> 'display_name', '');

  insert into public.profiles (id, email, display_name)
  values (current_user_id, current_email, current_display_name)
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return current_user_id;
end;
$$;

revoke all on function public.ensure_current_profile() from public;
grant execute on function public.ensure_current_profile() to authenticated;
