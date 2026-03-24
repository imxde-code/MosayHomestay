revoke all on table public.bookings from anon;
grant select, insert, update, delete on table public.bookings to authenticated;

drop policy if exists "Authenticated users can read bookings" on public.bookings;
drop policy if exists "Authenticated users can insert bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;
drop policy if exists "Authenticated users can delete bookings" on public.bookings;

create policy "Authenticated users can read bookings"
on public.bookings
for select
to authenticated
using (true);

create policy "Authenticated users can insert bookings"
on public.bookings
for insert
to authenticated
with check (true);

create policy "Authenticated users can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete bookings"
on public.bookings
for delete
to authenticated
using (true);
