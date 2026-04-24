import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Lock,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import {
  formatBookingReference,
  formatDisplayDate,
} from '../lib/bookingCalendar'
import { MAX_GUESTS, isGuestCountWithinLimit } from '../lib/bookingGuests'
import LanguageToggle from './LanguageToggle'
import { getAdminContent } from '../data/adminContent'
import { getIntlLocale, normalizeLanguage } from '../lib/language'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

function getInitialFormState() {
  return {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestCount: String(MAX_GUESTS),
    startDate: '',
    endDate: '',
    holdExpiresAt: '',
    status: 'confirmed',
    source: 'manual',
    notes: '',
  }
}

function getStatusClasses(status) {
  if (status === 'pending_payment') {
    return 'border-[#e8d9b8] bg-[#fff8e8] text-[#8a6437]'
  }

  if (status === 'confirmed') {
    return 'border-[#cfdccf] bg-[#eef7ef] text-[#2e6a44]'
  }

  if (status === 'blocked') {
    return 'border-[#e7c3bc] bg-[#fff2ef] text-[#9a4b3c]'
  }

  if (status === 'completed') {
    return 'border-[#cfd9ea] bg-[#eef3fb] text-[#435c87]'
  }

  if (status === 'expired') {
    return 'border-[#eadccf] bg-[#f8f2ea] text-[#8b6b4a]'
  }

  if (status === 'cancelled') {
    return 'border-[#ddd3c7] bg-[#f5f1ea] text-[#7b6d61]'
  }

  return 'border-[#eadccf] bg-[#f8f2ea] text-[#6b5848]'
}

function StatusBadge({ status, labels }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(status)}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

function toFormState(booking) {
  return {
    guestName: booking.guest_name ?? '',
    guestPhone: booking.guest_phone ?? '',
    guestEmail: booking.guest_email ?? '',
    guestCount: String(booking.guest_count ?? 1),
    startDate: booking.start_date ?? '',
    endDate: booking.end_date ?? '',
    holdExpiresAt: toDateTimeInputValue(booking.hold_expires_at),
    status: booking.status ?? 'confirmed',
    source: booking.source ?? 'manual',
    notes: booking.notes ?? '',
  }
}

function toDateTimeInputValue(value) {
  if (!value) {
    return ''
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return ''
  }

  const localValue = new Date(
    parsedValue.getTime() - parsedValue.getTimezoneOffset() * 60_000,
  )

  return localValue.toISOString().slice(0, 16)
}

function toUtcDateTimeValue(value) {
  if (!value) {
    return null
  }

  const parsedValue = new Date(value)

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue.toISOString()
}

function getFriendlyBookingError(error, copy) {
  const message = error?.message ?? ''

  if (
    message.includes('bookings_no_overlapping_active_dates') ||
    message.includes('conflicting key value violates exclusion constraint')
  ) {
    return copy.errors.overlappingDates
  }

  if (message.includes('new row violates row-level security policy')) {
    return copy.errors.adminAuthorization
  }

  return message || copy.errors.genericActionFailed
}

function formatAdminDateTime(value, language) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(getIntlLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function normalizePhoneForWhatsApp(value) {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  if (digits.startsWith('00')) {
    return digits.slice(2)
  }

  if (digits.startsWith('60')) {
    return digits
  }

  if (digits.startsWith('0')) {
    return `60${digits.slice(1)}`
  }

  return digits
}

function buildAdminWhatsAppReplyLink(booking, copy, language) {
  const guestPhone = normalizePhoneForWhatsApp(booking?.guest_phone)

  if (!guestPhone) {
    return ''
  }

  const reference = formatBookingReference(booking.id)
  const guestName = booking.guest_name?.trim() || copy.guestSalutation
  const stayRange =
    booking.start_date && booking.end_date
    ? `${formatDisplayDate(booking.start_date, language)} - ${formatDisplayDate(booking.end_date, language)}`
    : '-'

  const lines =
    booking.status === 'inquiry'
      ? copy.whatsapp.inquiryMessageLines({ guestName, reference, stayRange })
      : copy.whatsapp.bookingMessageLines({ guestName, reference, stayRange })

  return `https://wa.me/${guestPhone}?text=${encodeURIComponent(lines.join('\n'))}`
}

function matchesBookingSearch(booking, normalizedSearch, statusLabels, sourceLabels) {
  if (!normalizedSearch) {
    return true
  }

  const searchableFields = [
    booking.guest_name,
    booking.guest_phone,
    booking.guest_email,
    booking.notes,
    booking.start_date,
    booking.end_date,
    booking.confirmed_at,
    booking.hold_expires_at,
    booking.status,
    statusLabels[booking.status],
    booking.source,
    sourceLabels[booking.source],
    formatBookingReference(booking.id),
  ]

  return searchableFields
    .filter(Boolean)
    .some((value) =>
      String(value).toLowerCase().includes(normalizedSearch),
    )
}

function AdminBookingPage({
  language = 'ms',
  onLanguageChange = () => {},
  languageToggleLabel,
}) {
  const resolvedLanguage = normalizeLanguage(language)
  const copy = getAdminContent(resolvedLanguage)
  const statusLabels = copy.statusLabels
  const sourceLabels = copy.sourceLabels
  const adminStatusFilters = copy.statusFilters
  const adminSourceFilters = copy.sourceFilters
  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(hasSupabaseConfig)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isCheckingAdminAccess, setIsCheckingAdminAccess] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [adminAccessError, setAdminAccessError] = useState('')
  const [bookings, setBookings] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [form, setForm] = useState(getInitialFormState)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isCancelled = false

    async function restoreSession() {
      const localizedCopy = getAdminContent(resolvedLanguage)
      const { data, error } = await supabase.auth.getSession()

      if (isCancelled) {
        return
      }

      if (error) {
        setAuthError(localizedCopy.errors.restoreSession)
      }

      setSession(data.session ?? null)
      setIsLoadingSession(false)
    }

    restoreSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setIsLoadingSession(false)
    })

    return () => {
      isCancelled = true
      subscription.unsubscribe()
    }
  }, [resolvedLanguage])

  useEffect(() => {
    let isCancelled = false

    async function syncAdminAccess() {
      const localizedCopy = getAdminContent(resolvedLanguage)

      if (!supabase || !session) {
        if (isCancelled) {
          return
        }

        setIsCheckingAdminAccess(false)
        setIsAdminUser(false)
        setAdminAccessError('')
        setBookings([])
        setIsLoadingBookings(false)
        setBookingsError('')
        setForm(getInitialFormState())
        setEditingId(null)
        setFormError('')
        setActionMessage('')
        return
      }

      setIsCheckingAdminAccess(true)
      setIsAdminUser(false)
      setAdminAccessError('')
      setBookings([])
      setIsLoadingBookings(false)
      setBookingsError('')
      setForm(getInitialFormState())
      setEditingId(null)
      setFormError('')
      setActionMessage('')

      const { data, error } = await supabase.rpc('is_current_user_admin')

      if (isCancelled) {
        return
      }

      if (error) {
        setAdminAccessError(localizedCopy.errors.adminAccessUnavailable)
      } else if (!data) {
        setAdminAccessError(localizedCopy.errors.adminAccessMissing)
      } else {
        setIsAdminUser(true)
      }

      setIsCheckingAdminAccess(false)
    }

    syncAdminAccess()

    return () => {
      isCancelled = true
    }
  }, [resolvedLanguage, session])

  useEffect(() => {
    if (!supabase || !session || !isAdminUser) {
      return undefined
    }

    let isCancelled = false

    async function loadBookings() {
      const localizedCopy = getAdminContent(resolvedLanguage)
      setIsLoadingBookings(true)
      setBookingsError('')

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('start_date', { ascending: true })
        .order('created_at', { ascending: false })

      if (isCancelled) {
        return
      }

      if (error) {
        setBookings([])
        setBookingsError(getFriendlyBookingError(error, localizedCopy))
      } else {
        setBookings(data ?? [])
      }

      setIsLoadingBookings(false)
    }

    loadBookings()

    return () => {
      isCancelled = true
    }
  }, [isAdminUser, refreshToken, resolvedLanguage, session])

  const statusSummaryFilters = adminStatusFilters.filter(
    (filterOption) => filterOption.value !== 'all',
  )

  const bookingCountsByStatus = statusSummaryFilters.reduce(
    (counts, filterOption) => ({
      ...counts,
      [filterOption.value]: 0,
    }),
    {},
  )

  bookings.forEach((booking) => {
    if (bookingCountsByStatus[booking.status] === undefined) {
      return
    }

    bookingCountsByStatus[booking.status] += 1
  })

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false
    }

    if (sourceFilter !== 'all' && booking.source !== sourceFilter) {
      return false
    }

    return matchesBookingSearch(
      booking,
      normalizedSearchQuery,
      statusLabels,
      sourceLabels,
    )
  })

  const inquiryBookings = filteredBookings
    .filter((booking) => booking.status === 'inquiry')
    .sort((left, right) => {
      const leftTime = new Date(left.created_at ?? 0).getTime()
      const rightTime = new Date(right.created_at ?? 0).getTime()

      return rightTime - leftTime
    })

  const managedBookings = filteredBookings.filter(
    (booking) => booking.status !== 'inquiry',
  )
  const hasActiveWorkflowFilters =
    Boolean(normalizedSearchQuery) ||
    statusFilter !== 'all' ||
    sourceFilter !== 'all'

  function resetForm() {
    setForm(getInitialFormState())
    setEditingId(null)
    setFormError('')
  }

  function refreshBookings() {
    setRefreshToken((current) => current + 1)
  }

  function clearWorkflowFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setSourceFilter('all')
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((current) => {
      if (name === 'startDate' && current.endDate && current.endDate <= value) {
        return {
          ...current,
          startDate: value,
          endDate: '',
        }
      }

      return {
        ...current,
        [name]: value,
      }
    })
  }

  async function handleSignIn(event) {
    event.preventDefault()

    if (!supabase) {
      setAuthError(copy.errors.systemUnavailable)
      return
    }

    setIsSigningIn(true)
    setAuthError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setAuthError(copy.errors.signInFailed)
    } else {
      setPassword('')
    }

    setIsSigningIn(false)
  }

  async function handleSignOut() {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    resetForm()
    setActionMessage('')
    setAuthError('')
  }

  function handleEditBooking(booking) {
    setEditingId(booking.id)
    setForm(toFormState(booking))
    setFormError('')
    setActionMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleUpdateBookingStatus(booking, nextStatus, successMessage) {
    if (!supabase) {
      return
    }

    setBookingsError('')
    setActionMessage('')

    const { error } = await supabase
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', booking.id)

    if (error) {
      setBookingsError(getFriendlyBookingError(error, copy))
      return
    }

    if (editingId === booking.id) {
      resetForm()
    }

    setActionMessage(successMessage)
    refreshBookings()
  }

  async function handleConfirmBooking(booking) {
    await handleUpdateBookingStatus(
      booking,
      'confirmed',
      booking.status === 'inquiry'
        ? copy.messages.requestConfirmed
        : copy.messages.bookingConfirmed,
    )
  }

  async function handleCancelBooking(booking) {
    await handleUpdateBookingStatus(
      booking,
      'cancelled',
      booking.status === 'inquiry'
        ? copy.messages.requestCancelled
        : copy.messages.bookingCancelled,
    )
  }

  async function handleMarkDone(booking) {
    await handleUpdateBookingStatus(
      booking,
      'completed',
      copy.messages.bookingCompleted,
    )
  }

  async function handleDeleteBooking(booking) {
    if (!supabase) {
      return
    }

    const shouldDelete = window.confirm(
      copy.messages.deleteConfirmation(booking.guest_name),
    )

    if (!shouldDelete) {
      return
    }

    setBookingsError('')
    setActionMessage('')

    const { error } = await supabase.from('bookings').delete().eq('id', booking.id)

    if (error) {
      setBookingsError(getFriendlyBookingError(error, copy))
      return
    }

    if (editingId === booking.id) {
      resetForm()
    }

    setActionMessage(copy.messages.bookingDeleted)
    refreshBookings()
  }

  async function handleSaveBooking(event) {
    event.preventDefault()

    if (!supabase) {
      setFormError(copy.errors.systemUnavailable)
      return
    }

    if (!form.startDate || !form.endDate) {
      setFormError(copy.errors.selectDates)
      return
    }

    if (form.endDate <= form.startDate) {
      setFormError(copy.errors.invalidDateRange)
      return
    }

    if (!isGuestCountWithinLimit(form.guestCount)) {
      setFormError(copy.errors.invalidGuestCount)
      return
    }

    const payload = {
      guest_name: form.guestName.trim() || null,
      guest_phone: form.guestPhone.trim() || null,
      guest_email: form.guestEmail.trim() || null,
      guest_count: Number(form.guestCount),
      start_date: form.startDate,
      end_date: form.endDate,
      hold_expires_at: toUtcDateTimeValue(form.holdExpiresAt),
      status: form.status,
      source: form.source,
      notes: form.notes.trim() || null,
    }

    setIsSaving(true)
    setFormError('')
    setActionMessage('')

    const { error } = editingId
      ? await supabase.from('bookings').update(payload).eq('id', editingId)
      : await supabase.from('bookings').insert(payload)

    if (error) {
      setFormError(getFriendlyBookingError(error, copy))
      setIsSaving(false)
      return
    }

    setActionMessage(
      editingId
        ? copy.messages.bookingUpdated
        : copy.messages.bookingCreated,
    )
    resetForm()
    refreshBookings()
    setIsSaving(false)
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fbf6f0_0%,_#f7f0e8_38%,_#f5eee4_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
          <a
            href={`${import.meta.env.BASE_URL}#utama`}
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#6b5848] transition hover:text-[#2f221a]"
          >
            <ArrowLeft className="size-4" />
            {copy.backToHome}
          </a>
          <h1 className="mt-8 font-display text-5xl leading-none text-[#2f221a]">
            {copy.missingConfig.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-[#665548]">
            {copy.missingConfig.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fbf6f0_0%,_#f7f0e8_38%,_#f5eee4_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[2.5rem] border border-white/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-4xl">
              <a
                href={`${import.meta.env.BASE_URL}#utama`}
                className="inline-flex max-w-full items-center gap-3 text-sm font-semibold text-[#6b5848] transition hover:text-[#2f221a]"
              >
                <ArrowLeft className="size-4" />
                {copy.backToHome}
              </a>

              <p className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f8f2ea] px-4 py-2 text-xs font-semibold uppercase leading-6 tracking-[0.24em] text-[#8b6b4a]">
                <ShieldCheck className="size-4" />
                {copy.headerBadge}
              </p>

              <h1 className="mt-6 max-w-4xl break-words font-display text-5xl leading-none text-[#2f221a] sm:text-6xl">
                {copy.headerTitle}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#665548] sm:text-lg">
                {copy.headerDescription}
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-auto lg:max-w-sm lg:items-end">
              <LanguageToggle
                language={resolvedLanguage}
                onChange={onLanguageChange}
                label={languageToggleLabel ?? copy.languageSwitcherLabel}
              />

              {session?.user ? (
                <div className="w-full max-w-sm rounded-[2rem] border border-[#eadccf] bg-[#f8f2ea] p-5 text-sm leading-7 text-[#5f4d40] shadow-[0_18px_45px_rgba(80,58,35,0.06)] lg:shrink-0">
                  <p className="font-semibold text-[#2f221a]">
                    {copy.signedInAs}
                  </p>
                  <p className="mt-2 break-all">{session.user.email}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                  >
                    <LogOut className="size-4" />
                    {copy.signOut}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {isLoadingSession ? (
          <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/88 p-8 text-center shadow-[0_24px_80px_rgba(80,58,35,0.08)]">
            <LoaderCircle className="mx-auto size-8 animate-spin text-[#8b6b4a]" />
            <p className="mt-4 text-sm font-medium text-[#665548]">
              {copy.loadingSession}
            </p>
          </div>
        ) : !session?.user ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2.5rem] border border-[#443327] bg-[#2f221a] p-8 text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)] sm:p-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7bea2]">
                <Lock className="size-4" />
                {copy.loginIntro.badge}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-none">
                {copy.loginIntro.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#dbc8b7]">
                {copy.loginIntro.description}
              </p>

              <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex items-start gap-4">
                  <UserRound className="mt-1 size-5 text-[#e8ccb0]" />
                  <div>
                    <p className="font-semibold">{copy.loginIntro.accountCardTitle}</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      {copy.loginIntro.accountCardDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 size-5 text-[#e8ccb0]" />
                  <div>
                    <p className="font-semibold">{copy.loginIntro.impactCardTitle}</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      {copy.loginIntro.impactCardDescription}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
              <h2 className="text-3xl font-semibold text-[#2f221a]">
                {copy.loginForm.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#665548]">
                {copy.loginForm.description}
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    {copy.loginForm.emailLabel}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                    placeholder={copy.loginForm.emailPlaceholder}
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    {copy.loginForm.passwordLabel}
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                    placeholder={copy.loginForm.passwordPlaceholder}
                  />
                </label>

                {authError ? (
                  <div className="rounded-[1.5rem] border border-[#e7c3bc] bg-[#fff2ef] px-4 py-4 text-sm leading-7 text-[#9a4b3c]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 size-4 shrink-0" />
                      <p>{authError}</p>
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningIn ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      {copy.loginForm.submitting}
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      {copy.loginForm.submit}
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        ) : isCheckingAdminAccess ? (
          <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/88 p-8 text-center shadow-[0_24px_80px_rgba(80,58,35,0.08)]">
            <LoaderCircle className="mx-auto size-8 animate-spin text-[#8b6b4a]" />
            <p className="mt-4 text-sm font-medium text-[#665548]">
              {copy.loadingAdminAccess}
            </p>
          </div>
        ) : !isAdminUser ? (
          <div className="mt-8 rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e7c3bc] bg-[#fff2ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#9a4b3c]">
              <AlertCircle className="size-4" />
              {copy.accessDenied.badge}
            </p>
            <h2 className="mt-6 text-3xl font-semibold text-[#2f221a] sm:text-4xl">
              {copy.accessDenied.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#665548]">
              {adminAccessError} {copy.accessDenied.descriptionSuffix}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
            >
              <LogOut className="size-4" />
              {copy.signOut}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statusSummaryFilters.map((filterOption) => (
                  <article
                    key={filterOption.value}
                    className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]"
                  >
                    <p className="break-words text-xs uppercase leading-6 tracking-[0.16em] text-[#8b6b4a] sm:text-sm sm:tracking-[0.2em]">
                      {filterOption.label}
                    </p>
                    <p className="mt-4 text-4xl font-semibold text-[#2f221a]">
                      {bookingCountsByStatus[filterOption.value] ?? 0}
                    </p>
                  </article>
                ))}
              </div>

              <div className="rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6b4a]">
                      {copy.recordsSection.eyebrow}
                    </p>
                    <h2 className="mt-4 break-words text-3xl font-semibold text-[#2f221a]">
                      {copy.recordsSection.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665548]">
                      {copy.recordsSection.descriptionBefore}
                      <span className="font-semibold text-[#2f221a]">
                        {copy.recordsSection.descriptionHighlight}
                      </span>
                      {copy.recordsSection.descriptionAfter}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={refreshBookings}
                    className="inline-flex self-start items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f8f2ea] px-4 py-3 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b] sm:shrink-0"
                  >
                    <RefreshCw className="size-4" />
                    {copy.recordsSection.refresh}
                  </button>
                </div>

                <div className="mt-6 rounded-[2rem] border border-[#eadccf] bg-[#fcfaf7] p-5">
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                      <label className="block">
                        <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                          <Search className="size-4" />
                          {copy.recordsSection.searchLabel}
                        </span>
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          className="w-full rounded-2xl border border-[#eadccf] bg-white px-4 py-3.5 text-base outline-none transition placeholder:text-[#a28d7b] focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                          placeholder={copy.recordsSection.searchPlaceholder}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                          <SlidersHorizontal className="size-4" />
                          {copy.recordsSection.sourceLabel}
                        </span>
                        <select
                          value={sourceFilter}
                          onChange={(event) => setSourceFilter(event.target.value)}
                          className="w-full rounded-2xl border border-[#eadccf] bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                        >
                          {adminSourceFilters.map((filterOption) => (
                            <option key={filterOption.value} value={filterOption.value}>
                              {filterOption.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                        {copy.recordsSection.statusFilterLabel}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {adminStatusFilters.map((filterOption) => {
                          const isActive = statusFilter === filterOption.value

                          return (
                            <button
                              key={filterOption.value}
                              type="button"
                              onClick={() => setStatusFilter(filterOption.value)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                                isActive
                                  ? 'border-[#2f221a] bg-[#2f221a] text-[#f8f2ea]'
                                  : 'border-[#d8c8b4] bg-white text-[#2f221a] hover:-translate-y-0.5 hover:border-[#c7b39b]'
                              }`}
                            >
                              {filterOption.label}
                              <span
                                className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                                  isActive
                                    ? 'bg-white/14 text-[#f8f2ea]'
                                    : 'bg-[#f8f2ea] text-[#8b6b4a]'
                                }`}
                              >
                                {filterOption.value === 'all'
                                  ? bookings.length
                                  : bookings.filter(
                                      (booking) =>
                                        booking.status === filterOption.value,
                                    ).length}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm leading-7 text-[#665548]">
                        {copy.recordsSection.resultsSummary(
                          filteredBookings.length,
                          bookings.length,
                        )}
                      </p>

                      {hasActiveWorkflowFilters ? (
                        <button
                          type="button"
                          onClick={clearWorkflowFilters}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                        >
                          <XCircle className="size-4" />
                          {copy.recordsSection.resetFilters}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {bookingsError ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[#e7c3bc] bg-[#fff2ef] px-4 py-4 text-sm leading-7 text-[#9a4b3c]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 size-4 shrink-0" />
                      <p>{bookingsError}</p>
                    </div>
                  </div>
                ) : null}

                {actionMessage ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[#cfdccf] bg-[#eef7ef] px-4 py-4 text-sm leading-7 text-[#2e6a44]">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 size-4 shrink-0" />
                      <p>{actionMessage}</p>
                    </div>
                  </div>
                ) : null}

                {isLoadingBookings ? (
                  <div className="mt-8 rounded-[2rem] bg-[#f8f2ea] px-6 py-10 text-center">
                    <LoaderCircle className="mx-auto size-7 animate-spin text-[#8b6b4a]" />
                    <p className="mt-4 text-sm font-medium text-[#665548]">
                      {copy.loadingBookings}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-8 rounded-[2rem] border border-[#eadccf] bg-[#f8f2ea] p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6b4a]">
                            {copy.inquirySection.eyebrow}
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-[#2f221a]">
                            {copy.inquirySection.title}
                          </h3>
                        </div>
                        <StatusBadge status="inquiry" labels={statusLabels} />
                      </div>

                      {inquiryBookings.length > 0 ? (
                        <div className="mt-6 grid gap-4">
                          {inquiryBookings.map((booking) => (
                            <article
                              key={booking.id}
                              className="rounded-[2rem] border border-[#eadccf] bg-white p-5 shadow-[0_16px_40px_rgba(80,58,35,0.05)]"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xl font-semibold text-[#2f221a]">
                                    {booking.guest_name || copy.unnamedGuest}
                                  </p>
                                  <p className="mt-2 text-sm leading-7 text-[#665548]">
                                    {formatDisplayDate(booking.start_date, resolvedLanguage)} -{' '}
                                    {formatDisplayDate(booking.end_date, resolvedLanguage)}
                                  </p>
                                </div>

                                <StatusBadge status={booking.status} labels={statusLabels} />
                              </div>

                              <div className="mt-5 grid gap-3 break-words text-sm leading-7 text-[#5f4d40] sm:grid-cols-2">
                                <p>
                                  {copy.bookingDetails.reference}:{' '}
                                  <span className="font-semibold">
                                    {formatBookingReference(booking.id)}
                                  </span>
                                </p>
                                <p>
                                  {copy.bookingDetails.received}:{' '}
                                  <span className="font-semibold">
                                    {formatAdminDateTime(
                                      booking.created_at,
                                      resolvedLanguage,
                                    )}
                                  </span>
                                </p>
                                <p>
                                  {copy.bookingDetails.phone}:{' '}
                                  <span className="font-semibold">
                                    {booking.guest_phone || '-'}
                                  </span>
                                </p>
                                <p>
                                  {copy.bookingDetails.email}:{' '}
                                  <span className="font-semibold">
                                    {booking.guest_email || '-'}
                                  </span>
                                </p>
                                <p>
                                  {copy.bookingDetails.guests}:{' '}
                                  <span className="font-semibold">
                                    {booking.guest_count} {copy.bookingDetails.guestsSuffix}
                                  </span>
                                </p>
                                <p>
                                  {copy.bookingDetails.source}:{' '}
                                  <span className="font-semibold">
                                    {sourceLabels[booking.source] ?? booking.source}
                                  </span>
                                </p>
                                {booking.confirmed_at ? (
                                  <p>
                                    {copy.bookingDetails.confirmedAt}:{' '}
                                    <span className="font-semibold">
                                      {formatAdminDateTime(
                                        booking.confirmed_at,
                                        resolvedLanguage,
                                      )}
                                    </span>
                                  </p>
                                ) : null}
                                {booking.hold_expires_at ? (
                                  <p>
                                    {copy.bookingDetails.holdExpiresAt}:{' '}
                                    <span className="font-semibold">
                                      {formatAdminDateTime(
                                        booking.hold_expires_at,
                                        resolvedLanguage,
                                      )}
                                    </span>
                                  </p>
                                ) : null}
                              </div>

                              {booking.notes ? (
                                <div className="mt-4 rounded-[1.25rem] bg-[#fcfaf7] px-4 py-3 text-sm leading-7 text-[#665548] [overflow-wrap:anywhere]">
                                  {booking.notes}
                                </div>
                              ) : null}

                              <div className="mt-5 flex flex-wrap gap-3">
                                {buildAdminWhatsAppReplyLink(
                                  booking,
                                  copy,
                                  resolvedLanguage,
                                ) ? (
                                  <a
                                    href={buildAdminWhatsAppReplyLink(
                                      booking,
                                      copy,
                                      resolvedLanguage,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d6e3d6] bg-[#f3faf3] px-4 py-2.5 text-sm font-semibold text-[#2e6a44] transition hover:-translate-y-0.5 hover:border-[#bdd1bf]"
                                  >
                                    <MessageCircle className="size-4" />
                                    {copy.actions.replyWhatsApp}
                                  </a>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => handleConfirmBooking(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#cfdccf] bg-[#eef7ef] px-4 py-2.5 text-sm font-semibold text-[#2e6a44] transition hover:-translate-y-0.5 hover:border-[#b5cdb8]"
                                >
                                  <ShieldCheck className="size-4" />
                                  {copy.actions.confirmInquiry}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditBooking(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2.5 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                                >
                                  <Pencil className="size-4" />
                                  {copy.actions.reviewEdit}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#eadccf] bg-[#fff6ef] px-4 py-2.5 text-sm font-semibold text-[#8b6b4a] transition hover:-translate-y-0.5 hover:border-[#d8c8b4]"
                                >
                                  <XCircle className="size-4" />
                                  {copy.actions.cancelInquiry}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-6 rounded-[1.5rem] bg-white px-5 py-6 text-sm leading-7 text-[#665548]">
                          {hasActiveWorkflowFilters
                            ? copy.inquirySection.emptyFiltered
                            : copy.inquirySection.empty}
                        </div>
                      )}
                    </div>

                    {managedBookings.length > 0 ? (
                      <div className="mt-8 grid gap-4">
                        {managedBookings.map((booking) => (
                          <article
                            key={booking.id}
                            className="rounded-[2rem] border border-[#eadccf] bg-[#fcfaf7] p-5 shadow-[0_16px_40px_rgba(80,58,35,0.05)]"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xl font-semibold text-[#2f221a]">
                                  {booking.guest_name || copy.unnamedGuest}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[#665548]">
                                  {formatDisplayDate(booking.start_date, resolvedLanguage)} -{' '}
                                  {formatDisplayDate(booking.end_date, resolvedLanguage)}
                                </p>
                              </div>

                              <StatusBadge status={booking.status} labels={statusLabels} />
                            </div>

                            <div className="mt-5 grid gap-3 break-words text-sm leading-7 text-[#5f4d40] sm:grid-cols-2">
                              <p>
                                {copy.bookingDetails.reference}:{' '}
                                <span className="font-semibold">
                                  {formatBookingReference(booking.id)}
                                </span>
                              </p>
                              <p>
                                {copy.bookingDetails.received}:{' '}
                                <span className="font-semibold">
                                  {formatAdminDateTime(
                                    booking.created_at,
                                    resolvedLanguage,
                                  )}
                                </span>
                              </p>
                              <p>
                                {copy.bookingDetails.phone}:{' '}
                                <span className="font-semibold">
                                  {booking.guest_phone || '-'}
                                </span>
                              </p>
                              <p>
                                {copy.bookingDetails.email}:{' '}
                                <span className="font-semibold">
                                  {booking.guest_email || '-'}
                                </span>
                              </p>
                              <p>
                                {copy.bookingDetails.guests}:{' '}
                                <span className="font-semibold">
                                  {booking.guest_count} {copy.bookingDetails.guestsSuffix}
                                </span>
                              </p>
                              <p>
                                {copy.bookingDetails.source}:{' '}
                                <span className="font-semibold">
                                  {sourceLabels[booking.source] ?? booking.source}
                                </span>
                              </p>
                              {booking.confirmed_at ? (
                                <p>
                                  {copy.bookingDetails.confirmedAt}:{' '}
                                  <span className="font-semibold">
                                    {formatAdminDateTime(
                                      booking.confirmed_at,
                                      resolvedLanguage,
                                    )}
                                  </span>
                                </p>
                              ) : null}
                              {booking.hold_expires_at ? (
                                <p>
                                  {copy.bookingDetails.holdExpiresAt}:{' '}
                                  <span className="font-semibold">
                                    {formatAdminDateTime(
                                      booking.hold_expires_at,
                                      resolvedLanguage,
                                    )}
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            {booking.notes ? (
                              <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-3 text-sm leading-7 text-[#665548] [overflow-wrap:anywhere]">
                                {booking.notes}
                              </div>
                            ) : null}

                            <div className="mt-5 flex flex-wrap gap-3">
                              {buildAdminWhatsAppReplyLink(
                                booking,
                                copy,
                                resolvedLanguage,
                              ) ? (
                                <a
                                  href={buildAdminWhatsAppReplyLink(
                                    booking,
                                    copy,
                                    resolvedLanguage,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-[#d6e3d6] bg-[#f3faf3] px-4 py-2.5 text-sm font-semibold text-[#2e6a44] transition hover:-translate-y-0.5 hover:border-[#bdd1bf]"
                                >
                                  <MessageCircle className="size-4" />
                                  {copy.actions.openWhatsApp}
                                </a>
                              ) : null}

                              {booking.status !== 'confirmed' ? (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmBooking(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#cfdccf] bg-[#eef7ef] px-4 py-2.5 text-sm font-semibold text-[#2e6a44] transition hover:-translate-y-0.5 hover:border-[#b5cdb8]"
                                >
                                  <ShieldCheck className="size-4" />
                                  {copy.actions.confirm}
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleEditBooking(booking)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2.5 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                              >
                                <Pencil className="size-4" />
                                {copy.actions.edit}
                              </button>

                              {booking.status === 'confirmed' &&
                              new Date(booking.end_date) < new Date() ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkDone(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#c3d9c3] bg-[#eaf4ea] px-4 py-2.5 text-sm font-semibold text-[#2e6a44] transition hover:-translate-y-0.5 hover:border-[#a8c9a8]"
                                >
                                  <CheckCircle2 className="size-4" />
                                  {copy.actions.markDone}
                                </button>
                              ) : null}

                              {booking.status !== 'cancelled' ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(booking)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#eadccf] bg-[#f8f2ea] px-4 py-2.5 text-sm font-semibold text-[#8b6b4a] transition hover:-translate-y-0.5 hover:border-[#d8c8b4]"
                                >
                                  <XCircle className="size-4" />
                                  {copy.actions.markCancelled}
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(booking)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#e7c3bc] bg-[#fff2ef] px-4 py-2.5 text-sm font-semibold text-[#9a4b3c] transition hover:-translate-y-0.5 hover:border-[#d3a9a0]"
                              >
                                <Trash2 className="size-4" />
                                {copy.actions.delete}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="mt-8 rounded-[2rem] bg-[#f8f2ea] px-6 py-10 text-center">
                        <CalendarDays className="mx-auto size-8 text-[#8b6b4a]" />
                        <p className="mt-4 text-lg font-semibold text-[#2f221a]">
                          {copy.managedSection.emptyFilteredTitle}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#665548]">
                          {copy.managedSection.emptyFilteredDescription}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-8 rounded-[2rem] bg-[#f8f2ea] px-6 py-10 text-center">
                        <CalendarDays className="mx-auto size-8 text-[#8b6b4a]" />
                        <p className="mt-4 text-lg font-semibold text-[#2f221a]">
                          {bookings.length > 0
                            ? copy.managedSection.noSearchResultsTitle
                            : copy.managedSection.emptyTitle}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#665548]">
                          {bookings.length > 0
                            ? copy.managedSection.noSearchResultsDescription
                            : copy.managedSection.emptyDescription}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="min-w-0 rounded-[2.5rem] border border-[#443327] bg-[#2f221a] p-8 text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)] sm:p-10">
              <p className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase leading-6 tracking-[0.24em] text-[#d7bea2]">
                {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                {editingId ? copy.actions.editBooking : copy.actions.addBooking}
              </p>

              <h2 className="mt-6 max-w-xl break-words font-display text-4xl leading-none">
                {editingId
                  ? copy.form.titleEdit
                  : copy.form.titleAdd}
              </h2>

              <p className="mt-5 text-base leading-8 text-[#dbc8b7]">
                {copy.form.descriptionBefore}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.descriptionFirst}</span>{' '}
                {copy.form.descriptionBetween}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.descriptionSecond}</span>{' '}
                {copy.form.descriptionAfter}
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSaveBooking}>
                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                    {copy.form.guestNameLabel}
                  </span>
                  <input
                    type="text"
                    name="guestName"
                    value={form.guestName}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    placeholder={copy.form.guestNamePlaceholder}
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.guestPhoneLabel}
                    </span>
                    <input
                      type="text"
                      name="guestPhone"
                      value={form.guestPhone}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                      placeholder={copy.form.guestPhonePlaceholder}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.guestEmailLabel}
                    </span>
                    <input
                      type="email"
                      name="guestEmail"
                      value={form.guestEmail}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                      placeholder={copy.form.guestEmailPlaceholder}
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.startDateLabel}
                    </span>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.endDateLabel}
                    </span>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleFormChange}
                      min={form.startDate || undefined}
                      required
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.holdExpiresAtLabel}
                    </span>
                    <input
                      type="datetime-local"
                      name="holdExpiresAt"
                      value={form.holdExpiresAt}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.guestCountLabel}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={String(MAX_GUESTS)}
                      name="guestCount"
                      value={form.guestCount}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.statusLabel}
                    </span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    >
                      {adminStatusFilters
                        .filter((filterOption) => filterOption.value !== 'all')
                        .map((filterOption) => (
                          <option key={filterOption.value} value={filterOption.value}>
                            {filterOption.label}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      {copy.form.sourceLabel}
                    </span>
                    <select
                      name="source"
                      value={form.source}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    >
                      {adminSourceFilters
                        .filter((filterOption) => filterOption.value !== 'all')
                        .map((filterOption) => (
                          <option key={filterOption.value} value={filterOption.value}>
                            {filterOption.label}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                    {copy.form.notesLabel}
                  </span>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    placeholder={copy.form.notesPlaceholder}
                  />
                </label>

                {formError ? (
                  <div className="rounded-[1.5rem] border border-[#e7c3bc]/50 bg-[#5a3d35]/50 px-4 py-4 text-sm leading-7 text-[#f3ded6]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 size-4 shrink-0" />
                      <p>{formError}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-[#f8f2ea] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        {copy.actions.saving}
                      </>
                    ) : (
                      <>
                        {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                        {editingId ? copy.actions.saveChanges : copy.actions.addBooking}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] transition hover:-translate-y-0.5 hover:bg-white/12"
                  >
                    {copy.actions.resetForm}
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-[#dbc8b7]">
                {copy.form.footerBefore}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.footerFirst}</span>{' '}
                {copy.form.footerBetween}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.footerSecond}</span>{' '}
                {copy.form.footerMiddle}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.footerThird}</span>{' '}
                {copy.form.footerBetweenSecond}
                <span className="font-semibold text-[#f8f2ea]">{copy.form.footerFourth}</span>{' '}
                {copy.form.footerAfter}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookingPage
