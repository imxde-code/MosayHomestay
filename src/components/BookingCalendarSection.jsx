import { useEffect, useState } from 'react'
import { addMonths, startOfToday } from 'date-fns'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  buildWhatsAppBookingLink,
  formatBookingReference,
  formatDateKey,
  formatDisplayDate,
  formatDisplayShortDate,
  getBlockedStayRange,
  getDisabledDateRanges,
  getSelectedStay,
} from '../lib/bookingCalendar'
import { getDateFnsLocale } from '../lib/language'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

const today = startOfToday()

function getInitialInquiryForm() {
  return {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    notes: '',
  }
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
  const [guests, setGuests] = useState('8')
  const [monthsToShow, setMonthsToShow] = useState(2)
  const [inquiryForm, setInquiryForm] = useState(getInitialInquiryForm)
  const [availabilityBlocks, setAvailabilityBlocks] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(
    hasSupabaseConfig,
  )
  const [availabilityError, setAvailabilityError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const dayPickerLocale = getDateFnsLocale(language)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const syncMonths = () => setMonthsToShow(mediaQuery.matches ? 2 : 1)

    syncMonths()
    mediaQuery.addEventListener('change', syncMonths)

    return () => mediaQuery.removeEventListener('change', syncMonths)
  }, [])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isCancelled = false

    async function loadAvailability() {
      setIsLoadingAvailability(true)
      setAvailabilityError('')

      const { data, error } = await supabase.rpc('get_public_booking_blocks', {
        start_from: formatDateKey(today),
        end_before: formatDateKey(addMonths(today, 18)),
      })

      if (isCancelled) {
        return
      }

      if (error) {
        setAvailabilityError(copy.loadError)
        setAvailabilityBlocks([])
      } else {
        setAvailabilityBlocks(data ?? [])
      }

      setIsLoadingAvailability(false)
    }

    loadAvailability()

    return () => {
      isCancelled = true
    }
  }, [copy.loadError])

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

  function handleInquiryFormChange(event) {
    const { name, value } = event.target

    setInquiryForm((current) => ({
      ...current,
      [name]: value,
    }))

    setRequestError('')
    setRequestSuccess('')
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
      setRequestError(
        getFriendlyPublicRequestError(error, copy.requestMessages),
      )
      setIsSubmittingRequest(false)
      return
    }

    const savedRequest = Array.isArray(data) ? data[0] : data
    const requestReference = formatBookingReference(savedRequest?.id)

    setRequestSuccess(
      `${copy.requestMessages.successPrefix} ${requestReference}${copy.requestMessages.successSuffix}`,
    )

    const whatsappLink = buildWhatsAppBookingLink({
      checkIn: selectedStay.checkIn,
      checkOut: selectedStay.checkOut,
      guests,
      nights: selectedStay.nights,
      guestName: inquiryForm.guestName.trim(),
      requestReference,
      language,
    })

    setInquiryForm(getInitialInquiryForm())
    setSelectedRange(undefined)
    setGuests('8')
    setIsSubmittingRequest(false)
    window.location.assign(whatsappLink)
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

              <div className="booking-calendar mt-8 rounded-[2rem] bg-[#fcfaf7] p-4 sm:p-5">
                <DayPicker
                  mode="range"
                  locale={dayPickerLocale}
                  min={1}
                  numberOfMonths={monthsToShow}
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  disabled={disabledDays}
                  excludeDisabled
                  fixedWeeks
                  showOutsideDays
                  startMonth={today}
                  endMonth={addMonths(today, 18)}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AvailabilityPill label={copy.pills.availableDays} tone="active" />
                <AvailabilityPill label={copy.pills.blockedDays} tone="blocked" />
                <AvailabilityPill label={copy.pills.minNight} />
              </div>

              <label className="mt-6 block">
                <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  {copy.guestsLabel}
                </span>
                <select
                  value={guests}
                  onChange={(event) => setGuests(event.target.value)}
                  className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                >
                  {[4, 6, 8, 10, 12].map((option) => (
                    <option key={option} value={String(option)}>
                      {option} {copy.guestsSuffix}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-7 rounded-[1.5rem] bg-[#f7efe5] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  {copy.requestSummaryTitle}
                </p>

                {selectedStay ? (
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4d3d33]">
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
                      className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                      placeholder={copy.form.guestNamePlaceholder}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                      {copy.form.guestPhoneLabel}
                    </span>
                    <input
                      type="text"
                      name="guestPhone"
                      value={inquiryForm.guestPhone}
                      onChange={handleInquiryFormChange}
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

                {requestSuccess ? (
                  <div className="rounded-[1.5rem] border border-[#cfdccf] bg-[#eef7ef] px-4 py-4 text-sm leading-7 text-[#2e6a44]">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 size-4 shrink-0" />
                      <p>{requestSuccess}</p>
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

              {!hasSupabaseConfig && import.meta.env.DEV ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d8c8b4] bg-white px-4 py-4 text-sm leading-7 text-[#665548]">
                  {copy.devHint}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingCalendarSection
