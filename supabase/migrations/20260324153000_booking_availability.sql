create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text,
  guest_phone text,
  guest_email text,
  guest_count integer not null default 1 check (guest_count > 0),
  start_date date not null,
  end_date date not null,
  status text not null default 'inquiry'
    check (status in ('inquiry', 'confirmed', 'blocked', 'cancelled')),
  source text not null default 'whatsapp'
    check (source in ('whatsapp', 'manual', 'website')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_date_order check (end_date > start_date)
);

create index if not exists bookings_active_range_idx
  on public.bookings (start_date, end_date)
  where status in ('confirmed', 'blocked');

alter table public.bookings
  drop constraint if exists bookings_no_overlapping_active_dates;

alter table public.bookings
  add constraint bookings_no_overlapping_active_dates
  exclude using gist (
    daterange(start_date, end_date, '[)') with &&
  )
  where (status in ('confirmed', 'blocked'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_bookings_updated_at on public.bookings;

create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.bookings enable row level security;

create or replace function public.get_public_booking_blocks(
  start_from date default current_date,
  end_before date default null
)
returns table (
  start_date date,
  end_date date,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    bookings.start_date,
    bookings.end_date,
    bookings.status
  from public.bookings
  where bookings.status in ('confirmed', 'blocked')
    and bookings.end_date >= coalesce(start_from, current_date)
    and (end_before is null or bookings.start_date <= end_before)
  order by bookings.start_date asc;
$$;

revoke all on function public.get_public_booking_blocks(date, date) from public;
grant execute on function public.get_public_booking_blocks(date, date) to anon, authenticated;
