alter table public.bookings
  add column if not exists confirmed_at timestamptz,
  add column if not exists hold_expires_at timestamptz;

update public.bookings
set confirmed_at = coalesce(confirmed_at, created_at)
where status = 'confirmed'
  and confirmed_at is null;

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  drop constraint if exists bookings_status_check1;

alter table public.bookings
  add constraint bookings_status_check
  check (
    status in (
      'inquiry',
      'pending_payment',
      'confirmed',
      'blocked',
      'expired',
      'completed',
      'cancelled'
    )
  );

create or replace function public.set_booking_lifecycle_fields()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'confirmed'
    and (tg_op = 'INSERT' or old.status is distinct from 'confirmed')
    and new.confirmed_at is null then
    new.confirmed_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists set_booking_lifecycle_fields on public.bookings;

create trigger set_booking_lifecycle_fields
before insert or update on public.bookings
for each row
execute function public.set_booking_lifecycle_fields();
