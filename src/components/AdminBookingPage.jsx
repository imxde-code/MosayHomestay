import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import { formatMalayDate } from '../lib/bookingCalendar'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

const statusLabels = {
  inquiry: 'Pertanyaan',
  confirmed: 'Disahkan',
  blocked: 'Diblok',
  cancelled: 'Dibatalkan',
}

const sourceLabels = {
  whatsapp: 'WhatsApp',
  manual: 'Manual',
  website: 'Website',
}

function getInitialFormState() {
  return {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestCount: '8',
    startDate: '',
    endDate: '',
    status: 'confirmed',
    source: 'manual',
    notes: '',
  }
}

function getStatusClasses(status) {
  if (status === 'confirmed') {
    return 'border-[#cfdccf] bg-[#eef7ef] text-[#2e6a44]'
  }

  if (status === 'blocked') {
    return 'border-[#e7c3bc] bg-[#fff2ef] text-[#9a4b3c]'
  }

  if (status === 'cancelled') {
    return 'border-[#ddd3c7] bg-[#f5f1ea] text-[#7b6d61]'
  }

  return 'border-[#eadccf] bg-[#f8f2ea] text-[#6b5848]'
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(status)}`}
    >
      {statusLabels[status] ?? status}
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
    status: booking.status ?? 'confirmed',
    source: booking.source ?? 'manual',
    notes: booking.notes ?? '',
  }
}

function getFriendlyBookingError(error) {
  const message = error?.message ?? ''

  if (
    message.includes('bookings_no_overlapping_active_dates') ||
    message.includes('conflicting key value violates exclusion constraint')
  ) {
    return 'Tarikh ini bertindih dengan booking aktif lain. Sila pilih julat tarikh yang berbeza.'
  }

  if (message.includes('new row violates row-level security policy')) {
    return 'Akses anda untuk mengurus booking belum dibenarkan. Pastikan polisi RLS admin sudah dijalankan di Supabase.'
  }

  return message || 'Tindakan tidak berjaya disimpan. Sila cuba lagi.'
}

function AdminBookingPage() {
  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(hasSupabaseConfig)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [bookings, setBookings] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [form, setForm] = useState(getInitialFormState)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isCancelled = false

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession()

      if (isCancelled) {
        return
      }

      if (error) {
        setAuthError(
          'Sesi admin tidak dapat dipulihkan. Sila log masuk semula untuk teruskan.',
        )
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
  }, [])

  useEffect(() => {
    if (!supabase || !session) {
      return undefined
    }

    let isCancelled = false

    async function loadBookings() {
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
        setBookingsError(getFriendlyBookingError(error))
      } else {
        setBookings(data ?? [])
      }

      setIsLoadingBookings(false)
    }

    loadBookings()

    return () => {
      isCancelled = true
    }
  }, [refreshToken, session])

  let confirmedCount = 0
  let blockedCount = 0
  let cancelledCount = 0

  bookings.forEach((booking) => {
    if (booking.status === 'confirmed') {
      confirmedCount += 1
    } else if (booking.status === 'blocked') {
      blockedCount += 1
    } else if (booking.status === 'cancelled') {
      cancelledCount += 1
    }
  })

  function resetForm() {
    setForm(getInitialFormState())
    setEditingId(null)
    setFormError('')
  }

  function refreshBookings() {
    setRefreshToken((current) => current + 1)
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
      setAuthError(
        'Sambungan Supabase belum tersedia. Semak semula VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    setIsSigningIn(true)
    setAuthError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setAuthError(
        'Log masuk tidak berjaya. Semak email dan kata laluan admin anda.',
      )
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

  async function handleCancelBooking(booking) {
    if (!supabase) {
      return
    }

    setBookingsError('')
    setActionMessage('')

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)

    if (error) {
      setBookingsError(getFriendlyBookingError(error))
      return
    }

    if (editingId === booking.id) {
      resetForm()
    }

    setActionMessage('Booking telah ditandakan sebagai dibatalkan.')
    refreshBookings()
  }

  async function handleDeleteBooking(booking) {
    if (!supabase) {
      return
    }

    const shouldDelete = window.confirm(
      `Padam booking untuk ${booking.guest_name || 'tetamu ini'}? Tindakan ini tidak boleh dipulihkan.`,
    )

    if (!shouldDelete) {
      return
    }

    setBookingsError('')
    setActionMessage('')

    const { error } = await supabase.from('bookings').delete().eq('id', booking.id)

    if (error) {
      setBookingsError(getFriendlyBookingError(error))
      return
    }

    if (editingId === booking.id) {
      resetForm()
    }

    setActionMessage('Booking telah dipadam daripada sistem.')
    refreshBookings()
  }

  async function handleSaveBooking(event) {
    event.preventDefault()

    if (!supabase) {
      setFormError(
        'Sambungan Supabase belum tersedia. Semak semula konfigurasi environment anda.',
      )
      return
    }

    if (!form.startDate || !form.endDate) {
      setFormError('Sila pilih tarikh masuk dan tarikh keluar.')
      return
    }

    if (form.endDate <= form.startDate) {
      setFormError('Tarikh keluar mesti selepas tarikh masuk.')
      return
    }

    if (Number(form.guestCount) <= 0) {
      setFormError('Jumlah tetamu mesti sekurang-kurangnya 1 orang.')
      return
    }

    const payload = {
      guest_name: form.guestName.trim() || null,
      guest_phone: form.guestPhone.trim() || null,
      guest_email: form.guestEmail.trim() || null,
      guest_count: Number(form.guestCount),
      start_date: form.startDate,
      end_date: form.endDate,
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
      setFormError(getFriendlyBookingError(error))
      setIsSaving(false)
      return
    }

    setActionMessage(
      editingId
        ? 'Booking berjaya dikemas kini.'
        : 'Booking baru berjaya ditambah.',
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
            Kembali ke laman utama
          </a>
          <h1 className="mt-8 font-display text-5xl leading-none text-[#2f221a]">
            Panel Admin belum diaktifkan.
          </h1>
          <p className="mt-5 text-base leading-8 text-[#665548]">
            Isikan <span className="font-semibold">VITE_SUPABASE_URL</span> dan{' '}
            <span className="font-semibold">VITE_SUPABASE_ANON_KEY</span> dahulu
            untuk mengurus booking terus dari website ini.
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
            <div>
              <a
                href={`${import.meta.env.BASE_URL}#utama`}
                className="inline-flex items-center gap-3 text-sm font-semibold text-[#6b5848] transition hover:text-[#2f221a]"
              >
                <ArrowLeft className="size-4" />
                Kembali ke laman utama
              </a>

              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f8f2ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6b4a]">
                <ShieldCheck className="size-4" />
                Panel Admin Mosay Homestay
              </p>

              <h1 className="mt-6 font-display text-5xl leading-none text-[#2f221a] sm:text-6xl">
                Urus booking terus dari website.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#665548] sm:text-lg">
                Tambah booking baru, ubah tarikh, tandakan sebagai diblok atau
                dibatalkan, dan pantau semua tempahan dalam satu tempat.
              </p>
            </div>

            {session?.user ? (
              <div className="rounded-[2rem] border border-[#eadccf] bg-[#f8f2ea] p-5 text-sm leading-7 text-[#5f4d40] shadow-[0_18px_45px_rgba(80,58,35,0.06)]">
                <p className="font-semibold text-[#2f221a]">
                  Anda log masuk sebagai
                </p>
                <p className="mt-2 break-all">{session.user.email}</p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                >
                  <LogOut className="size-4" />
                  Log Keluar
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {isLoadingSession ? (
          <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/88 p-8 text-center shadow-[0_24px_80px_rgba(80,58,35,0.08)]">
            <LoaderCircle className="mx-auto size-8 animate-spin text-[#8b6b4a]" />
            <p className="mt-4 text-sm font-medium text-[#665548]">
              Memuatkan sesi admin...
            </p>
          </div>
        ) : !session?.user ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2.5rem] border border-[#443327] bg-[#2f221a] p-8 text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)] sm:p-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7bea2]">
                <Lock className="size-4" />
                Log Masuk Admin
              </p>
              <h2 className="mt-6 font-display text-4xl leading-none">
                Akses khas untuk pengurusan tempahan.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#dbc8b7]">
                Gunakan akaun admin Supabase anda untuk melihat semua booking,
                menambah tempahan baru, atau membatalkan tarikh sedia ada.
              </p>

              <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex items-start gap-4">
                  <UserRound className="mt-1 size-5 text-[#e8ccb0]" />
                  <div>
                    <p className="font-semibold">Guna akaun admin anda sendiri</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      Cipta seorang pengguna admin dalam Supabase Authentication
                      dan gunakan email serta kata laluan itu di sini.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 size-5 text-[#e8ccb0]" />
                  <div>
                    <p className="font-semibold">Data booking kekal di Supabase</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      Semua perubahan yang anda simpan di panel ini akan terus
                      mempengaruhi kalendar ketersediaan di laman utama.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
              <h2 className="text-3xl font-semibold text-[#2f221a]">
                Log masuk untuk teruskan
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#665548]">
                Jika login belum berjaya, semak semula sama ada pengguna admin
                sudah diwujudkan di Supabase Authentication.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    Email admin
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                    placeholder="admin@mosay.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                    Kata laluan
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                    placeholder="Masukkan kata laluan"
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
                      Sedang log masuk
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Masuk ke Panel Admin
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4a]">
                    Disahkan
                  </p>
                  <p className="mt-4 text-4xl font-semibold text-[#2f221a]">
                    {confirmedCount}
                  </p>
                </article>
                <article className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4a]">
                    Diblok
                  </p>
                  <p className="mt-4 text-4xl font-semibold text-[#2f221a]">
                    {blockedCount}
                  </p>
                </article>
                <article className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4a]">
                    Dibatalkan
                  </p>
                  <p className="mt-4 text-4xl font-semibold text-[#2f221a]">
                    {cancelledCount}
                  </p>
                </article>
              </div>

              <div className="rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6b4a]">
                      Senarai Booking
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold text-[#2f221a]">
                      Semua tempahan dan blok tarikh
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={refreshBookings}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f8f2ea] px-4 py-3 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                  >
                    <RefreshCw className="size-4" />
                    Muat Semula
                  </button>
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
                      Memuatkan senarai booking...
                    </p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="mt-8 grid gap-4">
                    {bookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-[2rem] border border-[#eadccf] bg-[#fcfaf7] p-5 shadow-[0_16px_40px_rgba(80,58,35,0.05)]"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xl font-semibold text-[#2f221a]">
                              {booking.guest_name || 'Tetamu tanpa nama'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-[#665548]">
                              {formatMalayDate(booking.start_date)} hingga{' '}
                              {formatMalayDate(booking.end_date)}
                            </p>
                          </div>

                          <StatusBadge status={booking.status} />
                        </div>

                        <div className="mt-5 grid gap-3 text-sm leading-7 text-[#5f4d40] sm:grid-cols-2">
                          <p>
                            Telefon:{' '}
                            <span className="font-semibold">
                              {booking.guest_phone || '-'}
                            </span>
                          </p>
                          <p>
                            Email:{' '}
                            <span className="font-semibold">
                              {booking.guest_email || '-'}
                            </span>
                          </p>
                          <p>
                            Tetamu:{' '}
                            <span className="font-semibold">
                              {booking.guest_count} orang
                            </span>
                          </p>
                          <p>
                            Sumber:{' '}
                            <span className="font-semibold">
                              {sourceLabels[booking.source] ?? booking.source}
                            </span>
                          </p>
                        </div>

                        {booking.notes ? (
                          <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-3 text-sm leading-7 text-[#665548]">
                            {booking.notes}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditBooking(booking)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2.5 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                          >
                            <Pencil className="size-4" />
                            Edit
                          </button>

                          {booking.status !== 'cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(booking)}
                              className="inline-flex items-center gap-2 rounded-full border border-[#eadccf] bg-[#f8f2ea] px-4 py-2.5 text-sm font-semibold text-[#8b6b4a] transition hover:-translate-y-0.5 hover:border-[#d8c8b4]"
                            >
                              <XCircle className="size-4" />
                              Tandakan Batal
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(booking)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#e7c3bc] bg-[#fff2ef] px-4 py-2.5 text-sm font-semibold text-[#9a4b3c] transition hover:-translate-y-0.5 hover:border-[#d3a9a0]"
                          >
                            <Trash2 className="size-4" />
                            Padam
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-[2rem] bg-[#f8f2ea] px-6 py-10 text-center">
                    <CalendarDays className="mx-auto size-8 text-[#8b6b4a]" />
                    <p className="mt-4 text-lg font-semibold text-[#2f221a]">
                      Belum ada booking dalam sistem.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#665548]">
                      Gunakan borang di sebelah untuk tambah tempahan pertama
                      atau blok tarikh tertentu.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-[#443327] bg-[#2f221a] p-8 text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)] sm:p-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7bea2]">
                {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                {editingId ? 'Edit Booking' : 'Tambah Booking'}
              </p>

              <h2 className="mt-6 font-display text-4xl leading-none">
                {editingId
                  ? 'Kemaskini booking sedia ada.'
                  : 'Masukkan booking baru terus di sini.'}
              </h2>

              <p className="mt-5 text-base leading-8 text-[#dbc8b7]">
                Status <span className="font-semibold text-[#f8f2ea]">Disahkan</span>{' '}
                dan <span className="font-semibold text-[#f8f2ea]">Diblok</span>{' '}
                akan terus menutup tarikh tersebut pada kalendar laman utama.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSaveBooking}>
                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                    Nama tetamu
                  </span>
                  <input
                    type="text"
                    name="guestName"
                    value={form.guestName}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    placeholder="Contoh: Keluarga Ahmad"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Telefon
                    </span>
                    <input
                      type="text"
                      name="guestPhone"
                      value={form.guestPhone}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                      placeholder="019-268 3116"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Email
                    </span>
                    <input
                      type="email"
                      name="guestEmail"
                      value={form.guestEmail}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                      placeholder="tetamu@email.com"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Tarikh masuk
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
                      Tarikh keluar
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
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Jumlah tetamu
                    </span>
                    <input
                      type="number"
                      min="1"
                      name="guestCount"
                      value={form.guestCount}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Status
                    </span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    >
                      <option value="inquiry">Pertanyaan</option>
                      <option value="confirmed">Disahkan</option>
                      <option value="blocked">Diblok</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                      Sumber
                    </span>
                    <select
                      name="source"
                      value={form.source}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    >
                      <option value="manual">Manual</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="website">Website</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d7bea2]">
                    Nota
                  </span>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 text-base text-[#f8f2ea] outline-none transition placeholder:text-[#d7bea2]/70 focus:border-[#e5c7a7] focus:ring-4 focus:ring-white/10"
                    placeholder="Contoh: check-in lewat malam atau blok tarikh untuk kegunaan keluarga"
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
                        Menyimpan
                      </>
                    ) : (
                      <>
                        {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                        {editingId ? 'Simpan Perubahan' : 'Tambah Booking'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] transition hover:-translate-y-0.5 hover:bg-white/12"
                  >
                    Reset Borang
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-[#dbc8b7]">
                Status <span className="font-semibold text-[#f8f2ea]">Disahkan</span>{' '}
                dan <span className="font-semibold text-[#f8f2ea]">Diblok</span>{' '}
                akan terus menutup tarikh pada kalendar pelanggan. Status{' '}
                <span className="font-semibold text-[#f8f2ea]">Pertanyaan</span>{' '}
                dan <span className="font-semibold text-[#f8f2ea]">Dibatalkan</span>{' '}
                tidak akan menghalang pilihan tarikh.
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookingPage
