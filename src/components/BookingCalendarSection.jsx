import { useEffect, useState } from 'react'
import { addMonths, startOfToday } from 'date-fns'
import { ms } from 'date-fns/locale'
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
import { siteMeta } from '../data/siteData'
import {
  buildWhatsAppBookingLink,
  formatDateKey,
  formatMalayDate,
  formatMalayShortDate,
  getBlockedStayRange,
  getDisabledDateRanges,
  getSelectedStay,
} from '../lib/bookingCalendar'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

const today = startOfToday()

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

function BookingCalendarSection() {
  const [selectedRange, setSelectedRange] = useState()
  const [guests, setGuests] = useState('8')
  const [monthsToShow, setMonthsToShow] = useState(2)
  const [availabilityBlocks, setAvailabilityBlocks] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(
    hasSupabaseConfig,
  )
  const [availabilityError, setAvailabilityError] = useState('')

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
        setAvailabilityError(
          'Kalendar ketersediaan belum dapat dimuatkan. Anda masih boleh teruskan pertanyaan melalui WhatsApp.',
        )
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
  }, [])

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

  return (
    <section
      id="tempahan"
      className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2.5rem] border border-[#443327] bg-[#2f221a] text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)] p-8 sm:p-10 lg:p-12">
            <p className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#d7bea2]">
              Kalendar Ketersediaan
            </p>
            <h2 className="mt-6 text-balance font-display text-4xl leading-none text-[#f8f2ea] sm:text-5xl">
              Semak tarikh tersedia secara lebih tepat dengan Supabase.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#dbc8b7] sm:text-lg">
              Tarikh yang telah disahkan atau ditutup akan ditanda sebagai tidak
              tersedia. Pilih tarikh masuk dan keluar, kemudian teruskan
              pertanyaan melalui WhatsApp untuk pengesahan akhir.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AvailabilityPill label="Tarikh tersedia" tone="active" />
              <AvailabilityPill label="Tarikh ditutup" tone="blocked" />
              <AvailabilityPill label="Semakan semasa" />
            </div>

            <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <CalendarDays
                  className="mt-1 size-5 text-[#e8ccb0]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-semibold">Tarikh dikunci secara automatik</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    Kalendar membaca blok tempahan daripada Supabase supaya
                    tarikh yang sudah ditempah tidak dipilih semula.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck
                  className="mt-1 size-5 text-[#e8ccb0]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-semibold">Sesuai untuk urusan pentadbiran</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    Anda boleh urus tarikh yang diblok atau disahkan terus
                    melalui Supabase tanpa perlu ubah kod website setiap kali ada
                    tempahan baru.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="mt-1 size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                <div>
                  <p className="font-semibold">Pengesahan akhir tetap mudah</p>
                  <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                    Tetamu masih boleh teruskan pertanyaan ke WhatsApp di{' '}
                    {siteMeta.phoneDisplay} dengan mesej yang sudah siap diisi.
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
                    Pilih tarikh penginapan anda
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    Pilih julat tarikh terus pada kalendar. Tarikh berwarna akan
                    menandakan ketersediaan semasa.
                  </p>
                </div>

                {isLoadingAvailability ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe5] px-4 py-2 text-sm font-medium text-[#6b5848]">
                    <LoaderCircle className="size-4 animate-spin" />
                    Memuatkan ketersediaan
                  </span>
                ) : hasLiveAvailability ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eef7ef] px-4 py-2 text-sm font-medium text-[#2e6a44]">
                    <ShieldCheck className="size-4" />
                    Ketersediaan semasa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe5] px-4 py-2 text-sm font-medium text-[#6b5848]">
                    <AlertCircle className="size-4" />
                    Mod manual sementara
                  </span>
                )}
              </div>

              <div className="booking-calendar mt-8 rounded-[2rem] bg-[#fcfaf7] p-4 sm:p-5">
                <DayPicker
                  mode="range"
                  locale={ms}
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
                <AvailabilityPill label="Hari tersedia" tone="active" />
                <AvailabilityPill label="Hari tidak tersedia" tone="blocked" />
                <AvailabilityPill label="Pilih sekurang-kurangnya 1 malam" />
              </div>

              <label className="mt-6 block">
                <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  Jumlah tetamu
                </span>
                <select
                  value={guests}
                  onChange={(event) => setGuests(event.target.value)}
                  className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                >
                  {[4, 6, 8, 10, 12].map((option) => (
                    <option key={option} value={String(option)}>
                      {option} orang
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-7 rounded-[1.5rem] bg-[#f7efe5] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  Ringkasan tempahan
                </p>

                {selectedStay ? (
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4d3d33]">
                    <p>
                      Tarikh masuk:{' '}
                      <span className="font-semibold">
                        {formatMalayDate(selectedStay.checkIn)}
                      </span>
                    </p>
                    <p>
                      Tarikh keluar:{' '}
                      <span className="font-semibold">
                        {formatMalayDate(selectedStay.checkOut)}
                      </span>
                    </p>
                    <p>
                      Jumlah malam:{' '}
                      <span className="font-semibold">
                        {selectedStay.nights} malam
                      </span>
                    </p>
                    <p>
                      Jumlah tetamu:{' '}
                      <span className="font-semibold">{guests} orang</span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[#665548]">
                    Pilih tarikh masuk dan tarikh keluar terus pada kalendar
                    untuk melihat ringkasan tempahan anda.
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[#eadccf] bg-[#fcfaf7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                  Tarikh tidak tersedia terdekat
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
                            {formatMalayShortDate(block.stayRange.from)} -{' '}
                            {formatMalayShortDate(block.stayRange.to)}
                          </p>
                          <p className="text-[#665548]">
                            Blok tempahan yang sedang dikunci dalam sistem.
                          </p>
                        </div>
                        <AvailabilityPill label="Tidak tersedia" tone="blocked" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[#665548]">
                    {hasLiveAvailability
                      ? 'Tiada blok tarikh ditemui buat masa ini. Semua tarikh yang dipaparkan masih terbuka untuk pertanyaan baru.'
                      : 'Tiada blok tarikh ditemui buat masa ini. Semua tarikh akan kelihatan terbuka sehingga anda sambungkan data tempahan sebenar.'}
                  </p>
                )}
              </div>

              {selectedStay ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                >
                  Teruskan Pertanyaan di WhatsApp
                  <MessageCircle className="size-4" />
                  <ArrowRight className="size-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#d7c8bb] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6f5f53]"
                >
                  Pilih Tarikh Dahulu
                  <CalendarDays className="size-4" />
                </button>
              )}

              {!hasSupabaseConfig && import.meta.env.DEV ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d8c8b4] bg-white px-4 py-4 text-sm leading-7 text-[#665548]">
                  Sambungkan <span className="font-semibold">VITE_SUPABASE_URL</span>{' '}
                  dan <span className="font-semibold">VITE_SUPABASE_ANON_KEY</span>{' '}
                  untuk aktifkan ketersediaan semasa dari Supabase.
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
