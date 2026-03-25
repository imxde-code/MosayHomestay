create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

revoke all on table public.bookings from anon;
revoke all on table public.bookings from authenticated;
grant select, insert, update, delete on table public.bookings to authenticated;

drop policy if exists "Authenticated users can read bookings" on public.bookings;
drop policy if exists "Authenticated users can insert bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;
drop policy if exists "Authenticated users can delete bookings" on public.bookings;
drop policy if exists "Admin users can read bookings" on public.bookings;
drop policy if exists "Admin users can insert bookings" on public.bookings;
drop policy if exists "Admin users can update bookings" on public.bookings;
drop policy if exists "Admin users can delete bookings" on public.bookings;

create policy "Admin users can read bookings"
on public.bookings
for select
to authenticated
using (public.is_current_user_admin());

create policy "Admin users can insert bookings"
on public.bookings
for insert
to authenticated
with check (public.is_current_user_admin());

create policy "Admin users can update bookings"
on public.bookings
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

create policy "Admin users can delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_current_user_admin());
