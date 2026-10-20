create table if not exists public.buses (
  id integer primary key,
  bus_no text not null unique,
  route text not null,
  direction text not null,
  departure_time text not null,
  driver text not null,
  seats_available integer not null check (seats_available >= 0),
  total_capacity integer not null check (total_capacity > 0),
  status text not null check (status in ('Active', 'Delayed', 'In-Transit', 'Out of Service')),
  next_stop text not null,
  eta text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buses_available_seats_within_capacity
    check (seats_available <= total_capacity)
);

create table if not exists public.bus_passengers (
  id uuid primary key default gen_random_uuid(),
  bus_id integer not null references public.buses (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  sap_id text not null,
  boarded_at timestamptz not null default now(),
  from_stop text not null,
  to_stop text not null,
  status text not null default 'Boarded' check (status = 'Boarded'),
  created_at timestamptz not null default now(),
  constraint bus_passengers_distinct_stops check (from_stop <> to_stop),
  constraint bus_passengers_name_not_empty check (length(trim(name)) between 1 and 120),
  constraint bus_passengers_sap_id_not_empty check (length(trim(sap_id)) between 1 and 64)
);

create unique index if not exists bus_passengers_active_sap_unique
  on public.bus_passengers (lower(sap_id));
create unique index if not exists bus_passengers_one_active_ride_per_user
  on public.bus_passengers (user_id)
  where user_id is not null;
create index if not exists bus_passengers_bus_id_idx
  on public.bus_passengers (bus_id);

create or replace function public.is_campusride_driver()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'driver'
  );
$$;

revoke all on function public.is_campusride_driver() from public, anon;
grant execute on function public.is_campusride_driver() to authenticated;

alter table public.buses enable row level security;
alter table public.bus_passengers enable row level security;

revoke all on public.buses from anon, authenticated;
revoke all on public.bus_passengers from anon, authenticated;
grant select on public.buses to authenticated;
grant update (seats_available, status, next_stop, eta) on public.buses to authenticated;
grant select, insert, delete on public.bus_passengers to authenticated;

drop policy if exists "campusride_buses_read_authenticated" on public.buses;
create policy "campusride_buses_read_authenticated"
  on public.buses for select to authenticated
  using (true);

drop policy if exists "campusride_drivers_update_buses" on public.buses;
create policy "campusride_drivers_update_buses"
  on public.buses for update to authenticated
  using ((select public.is_campusride_driver()))
  with check ((select public.is_campusride_driver()));

drop policy if exists "campusride_users_read_own_passengers" on public.bus_passengers;
create policy "campusride_users_read_own_passengers"
  on public.bus_passengers for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_campusride_driver())
  );

drop policy if exists "campusride_users_create_own_passenger" on public.bus_passengers;
create policy "campusride_users_create_own_passenger"
  on public.bus_passengers for insert to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'student'
      )
    )
    or (
      user_id is null
      and (select public.is_campusride_driver())
    )
  );

drop policy if exists "campusride_users_remove_own_passenger" on public.bus_passengers;
create policy "campusride_users_remove_own_passenger"
  on public.bus_passengers for delete to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_campusride_driver())
  );

create or replace function public.update_bus_seats_for_passenger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.buses
    set seats_available = seats_available - 1,
        updated_at = now()
    where id = new.bus_id
      and seats_available > 0
      and status <> 'Out of Service';

    if not found then
      raise exception using
        errcode = '23514',
        message = 'This bus has no available seats.';
    end if;
    return new;
  end if;

  update public.buses
  set seats_available = least(total_capacity, seats_available + 1),
      updated_at = now()
  where id = old.bus_id;
  return old;
end;
$$;

revoke all on function public.update_bus_seats_for_passenger() from public, anon, authenticated;

create or replace function public.set_bus_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_bus_updated_at() from public, anon, authenticated;

drop trigger if exists campusride_set_bus_updated_at on public.buses;
create trigger campusride_set_bus_updated_at
  before update on public.buses
  for each row execute function public.set_bus_updated_at();

drop trigger if exists campusride_update_bus_seats_after_passenger_change on public.bus_passengers;
create trigger campusride_update_bus_seats_after_passenger_change
  after insert or delete on public.bus_passengers
  for each row execute function public.update_bus_seats_for_passenger();

insert into public.buses (
  id, bus_no, route, direction, departure_time, driver, seats_available,
  total_capacity, status, next_stop, eta
)
values
  (1, 'BUS-101', 'Kandoli → Bidholi', 'Kandoli → Bidholi', '08:00 AM', 'DRIVER01', 14, 30, 'Active', 'Bidholi', '15 mins'),
  (2, 'BUS-102', 'Kandoli → Bidholi', 'Kandoli → Bidholi', '08:15 AM', 'DRIVER02', 8, 30, 'Delayed', 'Bidholi', '19 mins'),
  (3, 'BUS-103', 'Kandoli → Bidholi', 'Kandoli → Bidholi', '08:30 AM', 'DRIVER03', 22, 30, 'In-Transit', 'Bidholi', '16 mins'),
  (4, 'BUS-104', 'Kandoli → Bidholi', 'Kandoli → Bidholi', '08:45 AM', 'DRIVER04', 5, 30, 'In-Transit', 'Bidholi', '18 mins'),
  (5, 'BUS-105', 'Kandoli → Bidholi', 'Kandoli → Bidholi', '09:00 AM', 'DRIVER05', 0, 30, 'Out of Service', 'Kandoli', '--'),
  (6, 'BUS-201', 'Bidholi → Kandoli', 'Bidholi → Kandoli', '08:00 AM', 'DRIVER06', 11, 30, 'Active', 'Kandoli', '15 mins'),
  (7, 'BUS-202', 'Bidholi → Kandoli', 'Bidholi → Kandoli', '08:15 AM', 'DRIVER07', 19, 30, 'In-Transit', 'Kandoli', '17 mins'),
  (8, 'BUS-203', 'Bidholi → Kandoli', 'Bidholi → Kandoli', '08:30 AM', 'DRIVER08', 26, 30, 'Active', 'Kandoli', '15 mins'),
  (9, 'BUS-204', 'Bidholi → Kandoli', 'Bidholi → Kandoli', '08:45 AM', 'DRIVER09', 14, 30, 'Delayed', 'Kandoli', '22 mins'),
  (10, 'BUS-205', 'Bidholi → Kandoli', 'Bidholi → Kandoli', '09:00 AM', 'DRIVER10', 0, 30, 'Out of Service', 'Bidholi', '--')
on conflict (id) do nothing;
