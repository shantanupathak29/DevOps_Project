create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  role text not null default 'student' check (role in ('student', 'driver')),
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9_]{3,32}$'
  )
);

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select, update (username) on public.profiles to authenticated;

drop policy if exists "campusride_profiles_select_own" on public.profiles;
create policy "campusride_profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "campusride_profiles_update_own_username" on public.profiles;
create policy "campusride_profiles_update_own_username"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := lower(trim(new.raw_user_meta_data ->> 'username'));

  if requested_username is null
     or requested_username !~ '^[a-z0-9_]{3,32}$' then
    raise exception using
      errcode = '23514',
      message = 'Username must be 3-32 letters, numbers, or underscores';
  end if;

  insert into public.profiles (id, username)
  values (new.id, requested_username);

  return new;
exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'Username is already taken';
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists campusride_create_profile_after_auth_signup on auth.users;
create trigger campusride_create_profile_after_auth_signup
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

insert into public.profiles (id, username)
select
  users.id,
  lower(trim(users.raw_user_meta_data ->> 'username'))
from auth.users as users
where trim(coalesce(users.raw_user_meta_data ->> 'username', '')) ~ '^[a-zA-Z0-9_]{3,32}$'
on conflict do nothing;
