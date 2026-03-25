import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import { ms } from 'date-fns/locale'

export function normalizeDate(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return startOfDay(value)
  }

  return startOfDay(parseISO(value))
}

export function formatDateKey(value) {
  const date = normalizeDate(value)

  return date ? format(date, 'yyyy-MM-dd') : ''
}

export function formatMalayDate(value) {
  const date = normalizeDate(value)

  return date ? format(date, 'd MMMM yyyy', { locale: ms }) : '-'
}

export function formatMalayShortDate(value) {
  const date = normalizeDate(value)

  return date ? format(date, 'd MMM', { locale: ms }) : '-'
}

export function formatBookingReference(value) {
  if (!value) {
    return '-'
  }

  const normalizedValue = String(value).trim()

  if (!normalizedValue) {
    return '-'
  }

  return `MOSAY-${normalizedValue.split('-')[0].toUpperCase()}`
}

export function getDisabledDateRanges(blocks) {
  return blocks
    .map(getBlockedStayRange)
    .filter(Boolean)
    .map(({ from, to }) => ({ from, to }))
}

export function getBlockedStayRange(block) {
  const from = normalizeDate(block?.start_date)
  const checkoutDate = normalizeDate(block?.end_date)

  if (!from || !checkoutDate) {
    return null
  }

  const nights = differenceInCalendarDays(checkoutDate, from)

  if (nights <= 0) {
    return null
  }

  return {
    from,
    to: addDays(checkoutDate, -1),
    nights,
  }
}

export function getSelectedStay(range) {
  if (!range?.from || !range?.to) {
    return null
  }

  const checkIn = normalizeDate(range.from)
  const checkOut = normalizeDate(range.to)
  const nights = differenceInCalendarDays(checkOut, checkIn)

  if (!checkIn || !checkOut || nights <= 0) {
    return null
  }

  return {
    checkIn,
    checkOut,
    nights,
  }
}

export function buildWhatsAppBookingLink({
  checkIn,
  checkOut,
  guests,
  nights,
  guestName,
  requestReference,
}) {
  const message = [
    guestName
      ? `Salam Mosay Homestay, saya ${guestName} dan saya berminat untuk semak ketersediaan tarikh.`
      : 'Salam Mosay Homestay, saya berminat untuk semak ketersediaan tarikh.',
    requestReference ? `Rujukan permintaan: ${requestReference}` : null,
    `Tarikh masuk: ${formatMalayDate(checkIn)}`,
    `Tarikh keluar: ${formatMalayDate(checkOut)}`,
    `Jumlah malam: ${nights} malam`,
    `Jumlah tetamu: ${guests} orang`,
    'Mohon sahkan sama ada tarikh ini masih tersedia. Terima kasih.',
  ]
    .filter(Boolean)
    .join('\n')

  return `https://wa.me/60192683116?text=${encodeURIComponent(message)}`
}
