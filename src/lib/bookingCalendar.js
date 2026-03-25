import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import { getDateFnsLocale, normalizeLanguage } from './language'

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
  return formatDisplayDate(value, 'ms')
}

export function formatMalayShortDate(value) {
  return formatDisplayShortDate(value, 'ms')
}

export function formatDisplayDate(value, language = 'ms') {
  const date = normalizeDate(value)

  return date
    ? format(date, 'd MMMM yyyy', {
        locale: getDateFnsLocale(language),
      })
    : '-'
}

export function formatDisplayShortDate(value, language = 'ms') {
  const date = normalizeDate(value)

  return date
    ? format(date, 'd MMM', {
        locale: getDateFnsLocale(language),
      })
    : '-'
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

export function findConflictingAvailabilityBlock(blocks, selection) {
  const partialCheckIn = normalizeDate(
    selection?.from ?? selection?.checkIn ?? null,
  )
  const partialCheckOut = normalizeDate(
    selection?.to ?? selection?.checkOut ?? null,
  )

  return (
    blocks.find((block) => {
      const blockedCheckIn = normalizeDate(block?.start_date)
      const blockedCheckOut = normalizeDate(block?.end_date)

      if (!blockedCheckIn || !blockedCheckOut || !partialCheckIn) {
        return false
      }

      if (!partialCheckOut) {
        return (
          partialCheckIn >= blockedCheckIn && partialCheckIn < blockedCheckOut
        )
      }

      return (
        partialCheckIn < blockedCheckOut && partialCheckOut > blockedCheckIn
      )
    }) ?? null
  )
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
  language = 'ms',
}) {
  const resolvedLanguage = normalizeLanguage(language)
  const isEnglish = resolvedLanguage === 'en'
  const message = [
    guestName
      ? isEnglish
        ? `Hello Mosay Homestay, my name is ${guestName} and I would like to check date availability.`
        : `Salam Mosay Homestay, saya ${guestName} dan saya berminat untuk semak ketersediaan tarikh.`
      : isEnglish
        ? 'Hello Mosay Homestay, I would like to check date availability.'
        : 'Salam Mosay Homestay, saya berminat untuk semak ketersediaan tarikh.',
    requestReference
      ? isEnglish
        ? `Request reference: ${requestReference}`
        : `Rujukan permintaan: ${requestReference}`
      : null,
    isEnglish
      ? `Check-in date: ${formatDisplayDate(checkIn, resolvedLanguage)}`
      : `Tarikh masuk: ${formatDisplayDate(checkIn, resolvedLanguage)}`,
    isEnglish
      ? `Check-out date: ${formatDisplayDate(checkOut, resolvedLanguage)}`
      : `Tarikh keluar: ${formatDisplayDate(checkOut, resolvedLanguage)}`,
    isEnglish ? `Number of nights: ${nights} nights` : `Jumlah malam: ${nights} malam`,
    isEnglish
      ? `Number of guests: ${guests} guests`
      : `Jumlah tetamu: ${guests} orang`,
    isEnglish
      ? 'Please confirm whether these dates are still available. Thank you.'
      : 'Mohon sahkan sama ada tarikh ini masih tersedia. Terima kasih.',
  ]
    .filter(Boolean)
    .join('\n')

  return `https://wa.me/60192683116?text=${encodeURIComponent(message)}`
}
