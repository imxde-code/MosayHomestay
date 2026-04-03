import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { addMonths, startOfToday } from 'date-fns'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  buildWhatsAppBookingLink,
  formatBookingReference,
  formatDateKey,
  formatDisplayDate,
  formatDisplayShortDate,
  findConflictingAvailabilityBlock,
  getBlockedStayRange,
  getDisabledDateRanges,
  getSelectedStay,
} from '../lib/bookingCalendar'
import {
  MAX_GUESTS,
  PUBLIC_GUEST_OPTIONS,
  isGuestCountWithinLimit,
} from '../lib/bookingGuests'
import { getDateFnsLocale } from '../lib/language'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { useAccessibleDialog } from '../lib/useAccessibleDialog'

const today = startOfToday()
const AVAILABILITY_REFRESH_INTERVAL_MS = 30000
const loadBookingDayPicker = () => import('./BookingDayPicker')
const BookingDayPicker = lazy(loadBookingDayPicker)

function getInitialInquiryForm() {
  return {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    notes: '',
  }
}

function isValidGuestPhone(value) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  if (!/^[+\d()\-\s]+$/.test(trimmedValue)) {
    return false
  }

  const digitsOnly = trimmedValue.replace(/\D/g, '')

  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

function getFriendlyPublicRequestError(error, requestMessages) {
  const message = error?.message ?? ''

  if (
    message.includes('Tarikh ini sudah tidak tersedia') ||
    message.includes('bookings_no_overlapping_active_dates') ||
    message.includes('conflicting key value violates exclusion constraint')
  ) {
    return requestMessages.unavailableDates
  }

  if (message.includes('Nama tetamu diperlukan')) {
    return requestMessages.missingName
  }

  if (message.includes('Nombor telefon diperlukan')) {
    return requestMessages.missingPhone
  }

  if (message.includes('Jumlah tetamu tidak sah')) {
    return requestMessages.invalidGuests
  }

  if (message.includes('Tarikh masuk dan keluar tidak sah')) {
    return requestMessages.invalidDates
  }

  return message || requestMessages.fallbackError
}

function AvailabilityPill({ label, tone = 'default' }) {
  const styles = {
    default: 'border-[#eadccf] bg-white text-[#5d4b3f]',
    blocked: 'border-[#e7c3bc] bg-[#fff2ef] text-[#9a4b3c]',
    active: 'border-[#cfdccf] bg-[#eef7ef] text-[#2e6a44]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles[tone]}`}
    >
      {label}
    </span>
  )
}

function BookingCalendarSection({ language, siteMeta, copy }) {
  const [selectedRange, setSelectedRange] = useState()
  const [guests, setGuests] = useState(String(MAX_GUESTS))
  const [monthsToShow, setMonthsToShow] = useState(2)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [inquiryForm, setInquiryForm] = useState(getInitialInquiryForm)
  const [availabilityBlocks, setAvailabilityBlocks] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(
    hasSupabaseConfig,
  )
  const [availabilityError, setAvailabilityError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [submittedRequest, setSubmittedRequest] = useState(null)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const isMountedRef = useRef(false)
  const availabilityRequestIdRef = useRef(0)
  const availabilityBlocksRef = useRef([])
  const selectedRangeRef = useRef()
  const calendarDialogRef = useRef(null)
  const calendarCloseButtonRef = useRef(null)
  const calendarTriggerRef = useRef(null)
  const calendarDialogTitleId = useId()
  const calendarDialogDescriptionId = useId()
  const dayPickerLocale = getDateFnsLocale(language)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    availabilityBlocksRef.current = availabilityBlocks
  }, [availabilityBlocks])

  useEffect(() => {
    selectedRangeRef.current = selectedRange
  }, [selectedRange])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 960px)')
    const syncMonths = () => setMonthsToShow(mediaQuery.matches ? 2 : 1)

    syncMonths()
    mediaQuery.addEventListener('change', syncMonths)

    return () => mediaQuery.removeEventListener('change', syncMonths)
  }, [])

  const refreshAvailability = useCallback(
    async ({ background = false } = {}) => {
      if (!supabase) {
        return
      }

      const requestId = availabilityRequestIdRef.current + 1
      availabilityRequestIdRef.current = requestId

      if (!background || availabilityBlocksRef.current.length === 0) {
        setIsLoadingAvailability(true)
      }

      const { data, error } = await supabase.rpc('get_public_booking_blocks', {
        start_from: formatDateKey(today),
        end_before: formatDateKey(addMonths(today, 18)),
      })

      if (
        !isMountedRef.current ||
        requestId !== availabilityRequestIdRef.current
      ) {
        return
      }

      if (error) {
        setAvailabilityError(copy.loadError)

        if (availabilityBlocksRef.current.length === 0) {
          setAvailabilityBlocks([])
        }

        setIsLoadingAvailability(false)
        return
      }

      const nextBlocks = data ?? []

      setAvailabilityError('')
      setAvailabilityBlocks(nextBlocks)
      setIsLoadingAvailability(false)

      if (
        findConflictingAvailabilityBlock(nextBlocks, selectedRangeRef.current)
      ) {
        setSelectedRange(undefined)
        setRequestSuccess('')
        setSubmittedRequest(null)
        setRequestError(copy.requestMessages.selectionExpired)
      }
    },
    [copy.loadError, copy.requestMessages.selectionExpired],
  )

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshAvailability({ background: true })
      }
    }

    const initialRefreshId = window.setTimeout(() => {
      refreshAvailability()
    }, 0)
    const intervalId = window.setInterval(
      refreshIfVisible,
      AVAILABILITY_REFRESH_INTERVAL_MS,
    )

    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)

    return () => {
      window.clearTimeout(initialRefreshId)
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [refreshAvailability])

  const disabledDays = [
    { before: today },
    ...getDisabledDateRanges(availabilityBlocks),
  ]
  const selectedStay = getSelectedStay(selectedRange)
  const whatsappLink = selectedStay
    ? buildWhatsAppBookingLink({
        checkIn: selectedStay.checkIn,
        checkOut: selectedStay.checkOut,
        guests,
        nights: selectedStay.nights,
        language,
      })
    : siteMeta.whatsappLink
  const visibleBlocks = availabilityBlocks.slice(0, 4)
  const visibleBlocksWithRanges = visibleBlocks
    .map((block) => ({
      ...block,
      stayRange: getBlockedStayRange(block),
    }))
    .filter((block) => block.stayRange)
  const hasLiveAvailability = hasSupabaseConfig && !availabilityError

  const closeCalendarDialog = useCallback(() => {
    setIsCalendarOpen(false)
  }, [])

  useAccessibleDialog({
    isOpen: isCalendarOpen,
    dialogRef: calendarDialogRef,
    onClose: closeCalendarDialog,
    initialFocusRef: calendarCloseButtonRef,
    returnFocusRef: calendarTriggerRef,
  })

  function handleOpenCalendar(event) {
    if (event?.currentTarget instanceof HTMLElement) {
      calendarTriggerRef.current = event.currentTarget
    }

    loadBookingDayPicker()
    setIsCalendarOpen(true)

    if (supabase) {
      refreshAvailability({
        background: availabilityBlocks.length > 0,
      })
    }
  }

  function handleCalendarRangeSelect(nextRange) {
    setSelectedRange(nextRange)
    setRequestError('')
    setRequestSuccess('')
    setSubmittedRequest(null)
  }

  function clearSelectedDates() {
    setSelectedRange(undefined)
    setRequestError('')
    setRequestSuccess('')
    setSubmittedRequest(null)
  }

  function handleGuestsChange(event) {
    setGuests(event.target.value)
    setRequestError('')
    setRequestSuccess('')
    setSubmittedRequest(null)
  }

  function handleInquiryFormChange(event) {
    const { name, value } = event.target

    setInquiryForm((current) => ({
      ...current,
      [name]: value,
    }))

    setRequestError('')
    setRequestSuccess('')
    setSubmittedRequest(null)
  }

  function handleStartNewInquiry() {
    setRequestError('')
    setRequestSuccess('')
    setSubmittedRequest(null)
  }

  async function handleSubmitInquiry(event) {
    event.preventDefault()

    if (!selectedStay) {
      setRequestError(copy.requestMessages.noDates)
      return
    }

    if (!supabase) {
      setRequestError(copy.requestMessages.noAutomation)
      return
    }

    if (!inquiryForm.guestName.trim()) {
      setRequestError(copy.requestMessages.missingName)
      return
    }

    if (!inquiryForm.guestPhone.trim()) {
      setRequestError(copy.requestMessages.missingPhone)
      return
    }

    if (!isValidGuestPhone(inquiryForm.guestPhone)) {
      setRequestError(copy.requestMessages.invalidPhone)
      return
    }

    if (!isGuestCountWithinLimit(guests)) {
      setRequestError(copy.requestMessages.invalidGuests)
      return
    }

    if (findConflictingAvailabilityBlock(availabilityBlocks, selectedRange)) {
      setSelectedRange(undefined)
      setRequestError(copy.requestMessages.selectionExpired)
      return
    }

    setIsSubmittingRequest(true)
    setRequestError('')
    setRequestSuccess('')

    const { data, error } = await supabase.rpc('create_public_booking_request', {
      guest_name_input: inquiryForm.guestName.trim(),
      guest_phone_input: inquiryForm.guestPhone.trim(),
      guest_email_input: inquiryForm.guestEmail.trim() || null,
      guest_count_input: Number(guests),
      start_date_input: formatDateKey(selectedStay.checkIn),
      end_date_input: formatDateKey(selectedStay.checkOut),
      notes_input: inquiryForm.notes.trim() || null,
    })

    if (error) {
      const friendlyError = getFriendlyPublicRequestError(
        error,
        copy.requestMessages,
      )

      if (friendlyError === copy.requestMessages.unavailableDates) {
        setSelectedRange(undefined)
        setRequestError(copy.requestMessages.unavailableDates)
        refreshAvailability({ background: true })
      } else {
        setRequestError(friendlyError)
      }

      setIsSubmittingRequest(false)
      return
    }

    const savedRequest = Array.isArray(data) ? data[0] : data
    const requestReference = formatBookingReference(savedRequest?.id)
    const nextWhatsappLink = buildWhatsAppBookingLink({
      checkIn: selectedStay.checkIn,
      checkOut: selectedStay.checkOut,
      guests,
      nights: selectedStay.nights,
      guestName: inquiryForm.guestName.trim(),
      requestReference,
      language,
    })

    setRequestSuccess(
      `${copy.requestMessages.successPrefix} ${requestReference}${copy.requestMessages.successSuffix}`,
    )
    setSubmittedRequest({
      guests,
      checkIn: selectedStay.checkIn,
      checkOut: selectedStay.checkOut,
      nights: selectedStay.nights,
      reference: requestReference,
      whatsappLink: nextWhatsappLink,
    })

    setInquiryForm(getInitialInquiryForm())
    setSelectedRange(undefined)
    setGuests(String(MAX_GUESTS))
    setIsSubmittingRequest(false)
  }

  return (
    <section
      id="tempahan"
      className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2.5rem] border border-[#443327] bg-[#2f221a] text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)] p-8 sm:p-10 lg:p-12">
            <p className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#d7bea2]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-6 text-balance font-display text-4xl leading-none text-[#f8f2ea] sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#dbc8b7] sm:text-lg">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AvailabilityPill label={copy.pills.availableDates} tone="active" />
              <AvailabilityPill label={copy.pills.blockedDates} tone="blocked" />
              <AvailabilityPill label={copy.pills.liveCheck} />
            </div>

            <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <CalendarDays
                  className="mt-1 size-5 text-[#e8ccb0]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-semibold">{copy.featureList[0].title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    {copy.featureList[0].description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck
                  className="mt-1 size-5 text-[#e8ccb0]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-semibold">{copy.featureList[1].title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    {copy.featureList[1].description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="mt-1 size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                <div>
                  <p className="font-semibold">{copy.featureList[2].title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    {copy.featureList[2].description}
                  </p>
                </div>
              </div>
            </div>

            {availabilityError ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#a66a5e]/40 bg-[#5a3d35]/45 p-4 text-sm leading-7 text-[#f3ded6]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-1 size-4 shrink-0" />
                  <p>{availabilityError}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-[#f8f2ea] p-8 text-[#2f221a] sm:p-10 lg:p-12">
            <div className="rounded-[2rem] border border-[#eadccf] bg-white p-6 shadow-[0_24px_80px_rgba(80,58,35,0.1)] sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {copy.panel.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    {copy.panel.description}
                  </p>
                </div>

                {isLoadingAvailability ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe5] px-4 py-2 text-sm font-medium text-[#6b5848]">
                    <LoaderCircle className="size-4 animate-spin" />
                    {copy.panel.loadingAvailability}
                  </span>
                ) : hasLiveAvailability ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eef7ef] px-4 py-2 text-sm font-medium text-[#2e6a44]">
                    <ShieldCheck className="size-4" />
                    {copy.panel.liveAvailability}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe5] px-4 py-2 text-sm font-medium text-[#6b5848]">
                    <AlertCircle className="size-4" />
                    {copy.panel.manualMode}
                  </span>
                )}
              </div>

              <div className="mt-8 rounded-[2rem] border border-[#eadccf] bg-[linear-gradient(135deg,#fdf8f1_0%,#f7efe5_100%)] p-5 shadow-[0_18px_50px_rgba(80,58,35,0.08)] sm:p-6">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
                  <button
                    type="button"
                    onClick={handleOpenCalendar}
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition hover:-translate-y-0.5 ${
                      selectedRange?.from
                        ? 'border-[#d5c1a8] bg-white text-[#2f221a] shadow-[0_14px_34px_rgba(80,58,35,0.08)]'
                        : 'border-[#eadccf] bg-white/80 text-[#5d4b3f]'
                    }`}
                  >
                    <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8b6b4a]">
                      {copy.dateBar.checkInLabel}
                    </span>
                    <span className="mt-2 block text-lg font-semibold sm:text-[1.35rem]">
                      {selectedRange?.from
                        ? formatDisplayDate(selectedRange.from, language)
                        : copy.dateBar.checkInPlaceholder}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCalendar}
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition hover:-translate-y-0.5 ${
                      selectedRange?.to
                        ? 'border-[#d5c1a8] bg-white text-[#2f221a] shadow-[0_14px_34px_rgba(80,58,35,0.08)]'
                        : 'border-[#eadccf] bg-white/80 text-[#5d4b3f]'
                    }`}
                  >
                    <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8b6b4a]">
                      {copy.dateBar.checkOutLabel}
                    </span>
                    <span className="mt-2 block text-lg font-semibold sm:text-[1.35rem]">
                      {selectedRange?.to
                        ? formatDisplayDate(selectedRange.to, language)
                        : copy.dateBar.checkOutPlaceholder}
                    </span>
                  </button>

                  <div className="rounded-[1.5rem] border border-[#eadccf] bg-white/80 px-5 py-4 text-[#2f221a]">
                    <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8b6b4a]">
                      {copy.dateBar.stayLabel}
                    </span>
                    <span className="mt-2 block text-lg font-semibold sm:text-[1.35rem]">
                      {selectedStay
                        ? `${selectedStay.nights} ${copy.summary.nightsSuffix}`
                        : copy.dateBar.stayEmpty}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-2xl text-sm leading-7 text-[#665548]">
                    {copy.dateBar.helper}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {selectedRange?.from ? (
                      <button
                        type="button"
                        onClick={clearSelectedDates}
                        className="inline-flex items-center rounded-full border border-[#dcc8b6] bg-white px-4 py-2 text-sm font-semibold text-[#7a624b] transition hover:border-[#c9b096] hover:text-[#5f4b39]"
                      >
                        {copy.dateBar.clearDatesLabel}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleOpenCalendar}
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2f221a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                    >
                      {selectedStay
                        ? copy.dateBar.changeDatesLabel
                        : copy.dateBar.openCalendarLabel}
                      <CalendarDays className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AvailabilityPill label={copy.pills.availableDays} tone="active" />
                <AvailabilityPill label={copy.pills.blockedDays} tone="blocked" />
                <AvailabilityPill label={copy.pills.minNight} />
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                <label className="block rounded-[1.5rem] border border-[#eadccf] bg-[#fcfaf7] p-5">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    {copy.guestsLabel}
                  </span>
                  <select
                    value={guests}
                    onChange={handleGuestsChange}
                    className="w-full rounded-2xl border border-[#eadccf] bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                  >
                    {PUBLIC_GUEST_OPTIONS.map((option) => (
                      <option key={option} value={String(option)}>
                        {option} {copy.guestsSuffix}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[1.5rem] bg-[#f7efe5] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    {copy.requestSummaryTitle}
                  </p>

                  {selectedStay ? (
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4d3d33] sm:grid-cols-2">
                      <p>
                        {copy.summary.checkIn}:{' '}
                        <span className="font-semibold">
                          {formatDisplayDate(selectedStay.checkIn, language)}
                        </span>
                      </p>
                      <p>
                        {copy.summary.checkOut}:{' '}
                        <span className="font-semibold">
                          {formatDisplayDate(selectedStay.checkOut, language)}
                        </span>
                      </p>
                      <p>
                        {copy.summary.nights}:{' '}
                        <span className="font-semibold">
                          {selectedStay.nights} {copy.summary.nightsSuffix}
                        </span>
                      </p>
                      <p>
                        {copy.summary.guests}:{' '}
                        <span className="font-semibold">
                          {guests} {copy.guestsSuffix}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[#665548]">
                      {copy.summary.empty}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[#eadccf] bg-[#fcfaf7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  {copy.upcomingUnavailableTitle}
                </p>

                {visibleBlocksWithRanges.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {visibleBlocksWithRanges.map((block) => (
                      <div
                        key={`${block.start_date}-${block.end_date}`}
                        className="flex flex-col gap-2 rounded-[1.25rem] border border-[#eadccf] bg-white px-4 py-3 text-sm text-[#4d3d33] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-[#2f221a]">
                            {formatDisplayShortDate(block.stayRange.from, language)} -{' '}
                            {formatDisplayShortDate(block.stayRange.to, language)}
                          </p>
                          <p className="text-[#665548]">
                            {copy.unavailableBlockDescription}
                          </p>
                        </div>
                        <AvailabilityPill
                          label={copy.pills.unavailable}
                          tone="blocked"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[#665548]">
                    {hasLiveAvailability
                      ? copy.noBlockedDatesLive
                      : copy.noBlockedDatesManual}
                  </p>
                )}
              </div>

              {submittedRequest ? (
                <div
                  className="mt-7 rounded-[1.75rem] border border-[#cfdccf] bg-[#eef7ef] p-5 sm:p-6"
                  role="status"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 size-5 shrink-0 text-[#2e6a44]" />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2e6a44]">
                        {copy.requestMessages.successTitle}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#2e6a44]">
                        {requestSuccess}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-[#d4e5d4] bg-white/85 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7d69]">
                      {copy.requestMessages.referenceLabel}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#1f3d2c]">
                      {submittedRequest.reference}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm leading-7 text-[#385341] sm:grid-cols-2">
                      <p>
                        {copy.summary.checkIn}:{' '}
                        <span className="font-semibold">
                          {formatDisplayDate(submittedRequest.checkIn, language)}
                        </span>
                      </p>
                      <p>
                        {copy.summary.checkOut}:{' '}
                        <span className="font-semibold">
                          {formatDisplayDate(submittedRequest.checkOut, language)}
                        </span>
                      </p>
                      <p>
                        {copy.summary.nights}:{' '}
                        <span className="font-semibold">
                          {submittedRequest.nights} {copy.summary.nightsSuffix}
                        </span>
                      </p>
                      <p>
                        {copy.summary.guests}:{' '}
                        <span className="font-semibold">
                          {submittedRequest.guests} {copy.guestsSuffix}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#385341]">
                    {copy.requestMessages.successWhatsappHelp}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={submittedRequest.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                    >
                      {copy.form.continueWhatsappLabel}
                      <MessageCircle className="size-4" />
                      <ArrowRight className="size-4" />
                    </a>

                    <button
                      type="button"
                      onClick={handleStartNewInquiry}
                      className="inline-flex items-center justify-center rounded-full border border-[#cbdacb] bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#b8cbb8]"
                    >
                      {copy.requestMessages.newRequestLabel}
                    </button>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#385341]">
                    {copy.requestMessages.whatsappFallback}{' '}
                    <a
                      href={siteMeta.phoneHref}
                      className="font-semibold text-[#1f3d2c] underline decoration-[#b8cbb8] underline-offset-4"
                    >
                      {siteMeta.phoneDisplay}
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <form className="mt-7 space-y-5" onSubmit={handleSubmitInquiry}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                        {copy.form.guestNameLabel}
                      </span>
                      <input
                        type="text"
                        name="guestName"
                        value={inquiryForm.guestName}
                        onChange={handleInquiryFormChange}
                        autoComplete="name"
                        enterKeyHint="next"
                        className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                        placeholder={copy.form.guestNamePlaceholder}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                        {copy.form.guestPhoneLabel}
                      </span>
                      <input
                        type="tel"
                        name="guestPhone"
                        value={inquiryForm.guestPhone}
                        onChange={handleInquiryFormChange}
                        inputMode="tel"
                        autoComplete="tel"
                        enterKeyHint="next"
                        pattern="[+0-9()\\-\\s]*"
                        maxLength={24}
                        className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                        placeholder={copy.form.guestPhonePlaceholder}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                      {copy.form.guestEmailLabel}
                    </span>
                    <input
                      type="email"
                      name="guestEmail"
                      value={inquiryForm.guestEmail}
                      onChange={handleInquiryFormChange}
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      enterKeyHint="next"
                      className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                      placeholder={copy.form.guestEmailPlaceholder}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                      {copy.form.notesLabel}
                    </span>
                    <textarea
                      name="notes"
                      value={inquiryForm.notes}
                      onChange={handleInquiryFormChange}
                      autoComplete="off"
                      enterKeyHint="done"
                      rows="3"
                      className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                      placeholder={copy.form.notesPlaceholder}
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-[#eadccf] bg-[#fcfaf7] p-5 text-sm leading-7 text-[#665548]">
                    {copy.form.statusNotePrefix}
                    <span className="font-semibold text-[#2f221a]">
                      {copy.form.statusKeyword}
                    </span>
                    {copy.form.statusNoteSuffix}
                  </div>

                  {requestError ? (
                    <div className="rounded-[1.5rem] border border-[#e7c3bc] bg-[#fff2ef] px-4 py-4 text-sm leading-7 text-[#9a4b3c]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-1 size-4 shrink-0" />
                        <p>{requestError}</p>
                      </div>
                    </div>
                  ) : null}

                  {hasSupabaseConfig ? (
                    selectedStay ? (
                      <button
                        type="submit"
                        disabled={isSubmittingRequest}
                        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmittingRequest ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" />
                            {copy.form.submittingLabel}
                          </>
                        ) : (
                          <>
                            {copy.form.submitLabel}
                            <MessageCircle className="size-4" />
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#d7c8bb] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6f5f53]"
                      >
                        {copy.form.selectDatesFirstLabel}
                        <CalendarDays className="size-4" />
                      </button>
                    )
                  ) : selectedStay ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                    >
                      {copy.form.continueWhatsappLabel}
                      <MessageCircle className="size-4" />
                      <ArrowRight className="size-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#d7c8bb] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6f5f53]"
                    >
                      {copy.form.selectDatesFirstLabel}
                      <CalendarDays className="size-4" />
                    </button>
                  )}
                </form>
              )}

              {!hasSupabaseConfig && import.meta.env.DEV ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d8c8b4] bg-white px-4 py-4 text-sm leading-7 text-[#665548]">
                  {copy.devHint}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isCalendarOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#1d140e]/55 p-4 backdrop-blur-[6px]"
          onClick={closeCalendarDialog}
        >
          <div
            ref={calendarDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={calendarDialogTitleId}
            aria-describedby={calendarDialogDescriptionId}
            tabIndex={-1}
            className="mx-auto my-4 w-full max-w-4xl rounded-[2rem] border border-[#e4d6c8] bg-[#fcfaf7] p-5 text-[#2f221a] shadow-[0_32px_120px_rgba(29,20,14,0.28)] outline-none sm:my-8 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-[#eadccf] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6b4a]">
                  {copy.modal.eyebrow}
                </p>
                <h4
                  id={calendarDialogTitleId}
                  className="mt-3 text-2xl font-semibold sm:text-[2rem]"
                >
                  {copy.modal.title}
                </h4>
                <p
                  id={calendarDialogDescriptionId}
                  className="mt-3 max-w-2xl text-sm leading-7 text-[#665548] sm:text-base"
                >
                  {copy.modal.description}
                </p>
              </div>

              <button
                ref={calendarCloseButtonRef}
                type="button"
                onClick={closeCalendarDialog}
                className="inline-flex items-center justify-center rounded-full border border-[#eadccf] bg-white p-3 text-[#7a624b] transition hover:border-[#d6c2b0] hover:text-[#2f221a]"
                aria-label={copy.modal.closeLabel}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="booking-calendar mt-6 rounded-[2rem] border border-[#eadccf] bg-white p-4 shadow-[0_20px_60px_rgba(80,58,35,0.08)] sm:p-5">
              <Suspense
                fallback={
                  <div className="flex min-h-[22rem] items-center justify-center rounded-[1.5rem] bg-[#fcfaf7] text-center text-sm font-medium text-[#665548] sm:min-h-[26rem]">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe5] px-4 py-2">
                      <LoaderCircle className="size-4 animate-spin" />
                      {copy.panel.loadingAvailability}
                    </span>
                  </div>
                }
              >
                <BookingDayPicker
                  mode="range"
                  locale={dayPickerLocale}
                  min={1}
                  numberOfMonths={monthsToShow}
                  selected={selectedRange}
                  onSelect={handleCalendarRangeSelect}
                  disabled={disabledDays}
                  excludeDisabled
                  fixedWeeks
                  showOutsideDays
                  startMonth={today}
                  endMonth={addMonths(today, 18)}
                />
              </Suspense>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <AvailabilityPill label={copy.pills.availableDays} tone="active" />
              <AvailabilityPill label={copy.pills.blockedDays} tone="blocked" />
              <AvailabilityPill label={copy.pills.minNight} />
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] bg-[#f7efe5] p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  {copy.requestSummaryTitle}
                </p>
                {selectedStay ? (
                  <div className="mt-3 grid gap-2 text-sm leading-7 text-[#4d3d33] sm:grid-cols-2">
                    <p>
                      {copy.summary.checkIn}:{' '}
                      <span className="font-semibold">
                        {formatDisplayDate(selectedStay.checkIn, language)}
                      </span>
                    </p>
                    <p>
                      {copy.summary.checkOut}:{' '}
                      <span className="font-semibold">
                        {formatDisplayDate(selectedStay.checkOut, language)}
                      </span>
                    </p>
                    <p>
                      {copy.summary.nights}:{' '}
                      <span className="font-semibold">
                        {selectedStay.nights} {copy.summary.nightsSuffix}
                      </span>
                    </p>
                    <p>
                      {copy.summary.guests}:{' '}
                      <span className="font-semibold">
                        {guests} {copy.guestsSuffix}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    {copy.summary.empty}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedRange?.from ? (
                  <button
                    type="button"
                    onClick={clearSelectedDates}
                    className="inline-flex items-center rounded-full border border-[#dcc8b6] bg-white px-4 py-2 text-sm font-semibold text-[#7a624b] transition hover:border-[#c9b096] hover:text-[#5f4b39]"
                  >
                    {copy.dateBar.clearDatesLabel}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={closeCalendarDialog}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f221a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                >
                  {copy.modal.doneLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BookingCalendarSection
