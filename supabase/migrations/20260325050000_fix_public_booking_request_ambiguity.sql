create or replace function public.create_public_booking_request(
  guest_name_input text,
  guest_phone_input text,
  guest_email_input text default null,
  guest_count_input integer default 1,
  start_date_input date default null,
  end_date_input date default null,
  notes_input text default null
)
returns table (
  id uuid,
  start_date date,
  end_date date,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_booking public.bookings;
begin
  if guest_name_input is null or btrim(guest_name_input) = '' then
    raise exception 'Nama tetamu diperlukan.';
  end if;

  if guest_phone_input is null or btrim(guest_phone_input) = '' then
    raise exception 'Nombor telefon diperlukan.';
  end if;

  if guest_count_input is null or guest_count_input <= 0 then
    raise exception 'Jumlah tetamu tidak sah.';
  end if;

  if start_date_input is null or end_date_input is null or end_date_input <= start_date_input then
    raise exception 'Tarikh masuk dan keluar tidak sah.';
  end if;

  if exists (
    select 1
    from public.bookings as bookings
    where bookings.status in ('confirmed', 'blocked')
      and daterange(bookings.start_date, bookings.end_date, '[)') &&
        daterange(start_date_input, end_date_input, '[)')
  ) then
    raise exception 'Tarikh ini sudah tidak tersedia.';
  end if;

  insert into public.bookings (
    guest_name,
    guest_phone,
    guest_email,
    guest_count,
    start_date,
    end_date,
    status,
    source,
    notes
  )
  values (
    btrim(guest_name_input),
    btrim(guest_phone_input),
    nullif(btrim(coalesce(guest_email_input, '')), ''),
    guest_count_input,
    start_date_input,
    end_date_input,
    'inquiry',
    'website',
    nullif(btrim(coalesce(notes_input, '')), '')
  )
  returning * into inserted_booking;

  return query
  select
    inserted_booking.id,
    inserted_booking.start_date,
    inserted_booking.end_date,
    inserted_booking.status;
end;
$$;

revoke all on function public.create_public_booking_request(text, text, text, integer, date, date, text) from public;
grant execute on function public.create_public_booking_request(text, text, text, integer, date, date, text) to anon, authenticated;
