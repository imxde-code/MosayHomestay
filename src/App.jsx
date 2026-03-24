import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  ChefHat,
  ChevronRight,
  Droplets,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Refrigerator,
  Sofa,
  Sparkles,
  Tv,
  UtensilsCrossed,
  Wifi,
  WashingMachine,
  Wind,
  X,
} from 'lucide-react'
import {
  amenities,
  galleryDetails,
  galleryImages,
  highlights,
  houseFeatures,
  navigationItems,
  nearbyPlaces,
  siteMeta,
} from './data/siteData'

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  sparkles: Sparkles,
  sofa: Sofa,
  utensils: UtensilsCrossed,
  droplets: Droplets,
  fridge: Refrigerator,
  chef: ChefHat,
  washer: WashingMachine,
  home: Home,
}

function resolveAssetPath(assetPath) {
  return `${import.meta.env.BASE_URL}${assetPath.replace(/^\/+/, '')}`
}

function getTodayString() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function getNextDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`))
}

function buildWhatsAppLink({ checkIn, checkOut, guests }) {
  const message = [
    'Salam Mosay Homestay, saya berminat untuk membuat tempahan.',
    `Tarikh masuk: ${formatDate(checkIn)}`,
    `Tarikh keluar: ${formatDate(checkOut)}`,
    `Jumlah tetamu: ${guests} orang`,
    'Mohon maklumkan ketersediaan tarikh. Terima kasih.',
  ].join('\n')

  return `https://wa.me/60192683116?text=${encodeURIComponent(message)}`
}

function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignment =
    align === 'center'
      ? 'mx-auto max-w-3xl text-center'
      : 'max-w-3xl text-left'

  return (
    <div className={alignment}>
      <p className="mb-4 inline-flex items-center rounded-full border border-[#d8c8b4] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#8b6b4a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
        {eyebrow}
      </p>
      <h2 className="text-balance font-display text-4xl leading-none text-[#2f221a] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-[#645347] sm:text-lg">
        {description}
      </p>
    </div>
  )
}

function AmenityCard({ amenity }) {
  const Icon = amenityIcons[amenity.icon] ?? Home

  return (
    <article className="group rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(80,58,35,0.08)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_100px_rgba(80,58,35,0.14)]">
      <span className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-[#f5ebdf] text-[#8b6b4a] transition duration-500 group-hover:bg-[#2f221a] group-hover:text-[#f8f2ea]">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="text-xl font-semibold text-[#2f221a]">{amenity.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6a584c]">{amenity.description}</p>
    </article>
  )
}

function GalleryCard({ image, isMissing, onError, onOpen }) {
  const details = galleryDetails[image] ?? {
    title: 'Gambar homestay',
    description: 'Kemaskini butiran galeri untuk paparan yang lebih lengkap.',
    tag: 'Galeri',
  }
  const imageSrc = resolveAssetPath(image)

  return (
    <button
      type="button"
      disabled={isMissing}
      onClick={() => onOpen(image)}
      className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#f4ecdf] text-left shadow-[0_24px_80px_rgba(80,58,35,0.08)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_100px_rgba(80,58,35,0.16)] disabled:cursor-default disabled:hover:translate-y-0"
    >
      {isMissing ? (
        <div className="flex aspect-[4/3] flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(244,236,223,0.95))] p-6">
          <span className="inline-flex w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b4a]">
            Tambah gambar
          </span>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b6b4a]">
              {details.tag}
            </p>
            <h3 className="text-2xl font-semibold text-[#2f221a]">{details.title}</h3>
            <p className="max-w-sm text-sm leading-7 text-[#6a584c]">
              Galeri ini sedia untuk foto sebenar homestay anda supaya tetamu dapat melihat ruang dengan lebih jelas dan meyakinkan.
            </p>
            <p className="text-sm leading-7 text-[#6a584c]">{details.description}</p>
          </div>
        </div>
      ) : (
        <>
          <img
            src={imageSrc}
            alt={details.title}
            loading="lazy"
            onError={() => onError(image)}
            className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b211b] via-[#2b211b]/30 to-transparent opacity-90 transition duration-500 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1dfc7]">
              {details.tag}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{details.title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">{details.description}</p>
          </div>
        </>
      )}
    </button>
  )
}

function App() {
  const today = getTodayString()
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(getNextDate(today))
  const [guests, setGuests] = useState('8')
  const [activeImage, setActiveImage] = useState(null)
  const [failedImages, setFailedImages] = useState({})

  useEffect(() => {
    if (!activeImage) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveImage(null)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [activeImage])

  const checkOutMin = checkIn ? getNextDate(checkIn) : getNextDate(today)
  const whatsappBookingLink = buildWhatsAppLink({ checkIn, checkOut, guests })
  const activeImageDetails = activeImage ? galleryDetails[activeImage] : null

  function handleCheckInChange(event) {
    const nextCheckIn = event.target.value
    setCheckIn(nextCheckIn)

    if (!checkOut || checkOut <= nextCheckIn) {
      setCheckOut(getNextDate(nextCheckIn))
    }
  }

  function handleImageError(imagePath) {
    setFailedImages((current) => ({
      ...current,
      [imagePath]: true,
    }))
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(243,234,223,0.65)_42%,_transparent_78%)]" />
      <div className="pointer-events-none absolute right-[-12rem] top-24 -z-10 size-[24rem] rounded-full bg-[#e9d6bf]/40 blur-3xl" />
      <div className="pointer-events-none absolute left-[-10rem] top-[48rem] -z-10 size-[22rem] rounded-full bg-[#f6e9d9]/70 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f9f4ed]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#utama" className="flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#2f221a] text-lg font-semibold text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.22)]">
              M
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6b4a]">
                {siteMeta.familyName}
              </p>
              <p className="font-display text-2xl leading-none text-[#2f221a]">
                {siteMeta.name}
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#5e4b3e] transition hover:text-[#2f221a]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href={siteMeta.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f221a] px-5 py-3 text-sm font-semibold text-[#f8f2ea] shadow-[0_18px_40px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
          >
            Tempah Sekarang
            <ArrowRight className="size-4" />
          </a>
        </nav>
      </header>

      <main>
        <section id="utama" className="mx-auto max-w-7xl px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="animate-fade-up">
              <p className="inline-flex items-center rounded-full border border-[#d8c8b4] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#8b6b4a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
                Homestay keluarga di Shah Alam
              </p>
              <h1 className="text-balance mt-6 max-w-3xl font-display text-5xl leading-none text-[#2f221a] sm:text-6xl lg:text-7xl">
                Selesa untuk keluarga, strategik untuk setiap urusan anda.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#665548] sm:text-xl">
                Mosay Homestay menawarkan rumah teres 2 tingkat yang luas, lengkap dan mesra keluarga. Sesuai untuk penginapan berkumpulan, urusan kampus, acara di Shah Alam atau percutian singkat yang lebih tenang.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#tempahan"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                >
                  Tempah Sekarang
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href="#galeri"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-[#d8c8b4] bg-white/75 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] shadow-[0_12px_35px_rgba(80,58,35,0.08)] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                >
                  Lihat Galeri
                  <ChevronRight className="size-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#5d4b3f]">
                <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2">
                  4 bilik + 1 bilik tambahan
                </span>
                <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2">
                  Penghawa dingin semua bilik utama
                </span>
                <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2">
                  Berhampiran UiTM, IDCC & hospital
                </span>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((item) => (
                  <article
                    key={item.value}
                    className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(80,58,35,0.07)]"
                  >
                    <p className="text-lg font-semibold text-[#2f221a]">{item.value}</p>
                    <p className="mt-3 text-sm leading-7 text-[#665548]">{item.label}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="animate-fade-up-delay space-y-5">
              <div className="rounded-[2rem] border border-white/70 bg-[#2f221a] p-7 text-[#f8f2ea] shadow-[0_30px_90px_rgba(47,34,26,0.22)]">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7bea2]">
                      Ruang yang dibuat untuk keluarga
                    </p>
                    <h2 className="mt-4 font-display text-4xl leading-none">
                      Rehat dengan lebih tenang dan praktikal.
                    </h2>
                  </div>
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10 text-[#f5dfc3]">
                    <Home className="size-7" strokeWidth={1.75} />
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <BedDouble className="size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <p className="mt-4 text-lg font-semibold">Katil queen setiap bilik utama</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      Sesuai untuk keluarga yang perlukan tidur lebih selesa tanpa rasa sempit.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <Bath className="size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <p className="mt-4 text-lg font-semibold">Pemanas air setiap bilik air</p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      Lebih selesa untuk orang dewasa, warga emas dan anak kecil.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#d7bea2]">
                      Hubungi terus
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{siteMeta.phoneDisplay}</p>
                  </div>
                  <a
                    href={siteMeta.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f8f2ea] px-5 py-3 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5"
                  >
                    WhatsApp
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <article className="animate-float rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <MapPin className="size-6 text-[#8b6b4a]" strokeWidth={1.75} />
                  <p className="mt-5 text-lg font-semibold text-[#2f221a]">Lokasi strategik</p>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    Mudah bergerak ke UiTM Shah Alam, Hospital Shah Alam, IDCC, Jakel dan Masjid Negeri.
                  </p>
                </article>
                <article className="animate-float-delay rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <Wind className="size-6 text-[#8b6b4a]" strokeWidth={1.75} />
                  <p className="mt-5 text-lg font-semibold text-[#2f221a]">Penginapan lebih selesa</p>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    Penghawa dingin pada semua bilik utama serta ruang yang sesuai untuk keluarga besar dan kumpulan.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="tentang" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div className="rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
              <SectionHeading
                eyebrow="Tentang Homestay"
                title="Penginapan yang terasa seperti rumah sendiri."
                description="Di Mosay Homestay, kami percaya pengalaman menginap yang baik bermula dengan rasa tenang, ruang yang cukup dan lokasi yang memudahkan urusan harian. Sebab itu setiap ruang dirancang untuk keluarga dan kumpulan yang mahu berehat dengan selesa tanpa mengorbankan akses ke tempat penting di Shah Alam."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {houseFeatures.map((feature) => (
                  <article
                    key={feature}
                    className="rounded-[2rem] border border-white/70 bg-[#f9f2ea] p-6 shadow-[0_20px_70px_rgba(80,58,35,0.07)]"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-[#8b6b4a] shadow-[0_14px_34px_rgba(111,88,63,0.08)]">
                      <Home className="size-5" strokeWidth={1.75} />
                    </span>
                    <p className="mt-5 text-base font-medium leading-8 text-[#2f221a]">{feature}</p>
                  </article>
                ))}
            </div>
          </div>
        </section>

        <section id="kemudahan" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Kemudahan"
            title="Lengkap untuk penginapan yang santai, kemas dan praktikal."
            description="Daripada hiburan seisi keluarga hinggalah keperluan memasak dan mencuci, kemudahan di Mosay Homestay disusun untuk memudahkan penginapan anda dari hari pertama hingga hari terakhir."
            align="center"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {amenities.map((amenity) => (
              <AmenityCard key={amenity.title} amenity={amenity} />
            ))}
          </div>
        </section>

        <section id="galeri" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Galeri"
            title="Lihat suasana homestay yang selesa, lapang dan mesra keluarga."
            description="Klik mana-mana gambar untuk melihat paparan yang lebih besar dan dapatkan gambaran lebih jelas tentang ruang penginapan anda."
          />

          <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#d8c8b4] bg-white/65 px-5 py-4 text-sm leading-7 text-[#665548] shadow-[0_18px_50px_rgba(80,58,35,0.05)]">
            Sentuh atau klik gambar untuk membuka paparan yang lebih besar.
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleryImages.map((image) => (
              <GalleryCard
                key={image}
                image={image}
                isMissing={Boolean(failedImages[image])}
                onError={handleImageError}
                onOpen={setActiveImage}
              />
            ))}
          </div>
        </section>

        <section id="lokasi" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading
              eyebrow="Lokasi Strategik"
              title="Mudah untuk urusan kampus, keluarga, acara dan rawatan."
              description="Kedudukan Mosay Homestay memudahkan pergerakan anda ke lokasi penting sekitar Shah Alam. Sesuai untuk tetamu yang datang bersama keluarga, kumpulan kecil atau rombongan."
            />

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {nearbyPlaces.map((place) => (
                <article
                  key={place.title}
                  className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(80,58,35,0.08)] transition duration-500 hover:-translate-y-1.5"
                >
                  <MapPin className="size-6 text-[#8b6b4a]" strokeWidth={1.75} />
                  <h3 className="mt-5 text-xl font-semibold text-[#2f221a]">{place.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">{place.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="tempahan" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-[#443327] bg-[#2f221a] text-[#f8f2ea] shadow-[0_32px_120px_rgba(47,34,26,0.22)]">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)] p-8 sm:p-10 lg:p-12">
                <p className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#d7bea2]">
                  Kalendar Tempahan
                </p>
                <h2 className="mt-6 text-balance font-display text-4xl leading-none text-[#f8f2ea] sm:text-5xl">
                  Pilih tarikh anda dan teruskan pertanyaan melalui WhatsApp.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#dbc8b7] sm:text-lg">
                  Pilih tarikh masuk, tarikh keluar dan jumlah tetamu. Kami akan bantu semak ketersediaan dan respon dengan lebih pantas melalui WhatsApp.
                </p>

                <div className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start gap-4">
                    <CalendarDays className="mt-1 size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <div>
                      <p className="font-semibold">Paparan kalendar yang ringkas dan jelas</p>
                      <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                        Pilihan tarikh di bawah membantu anda merancang penginapan dengan lebih mudah. Pengesahan akhir dibuat melalui WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="mt-1 size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <div>
                      <p className="font-semibold">Hubungi kami terus</p>
                      <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                        {siteMeta.phoneDisplay}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f2ea] p-8 text-[#2f221a] sm:p-10 lg:p-12">
                <div className="rounded-[2rem] border border-[#eadccf] bg-white p-6 shadow-[0_24px_80px_rgba(80,58,35,0.1)] sm:p-8">
                  <h3 className="text-2xl font-semibold">Semak tarikh penginapan anda</h3>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    Pilih tarikh dan jumlah tetamu. Butang WhatsApp akan terus membawa mesej tempahan yang lebih tersusun.
                  </p>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                        Tarikh masuk
                      </span>
                      <input
                        type="date"
                        min={today}
                        value={checkIn}
                        onChange={handleCheckInChange}
                        className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6b4a]">
                        Tarikh keluar
                      </span>
                      <input
                        type="date"
                        min={checkOutMin}
                        value={checkOut}
                        onChange={(event) => setCheckOut(event.target.value)}
                        className="w-full rounded-2xl border border-[#eadccf] bg-[#fcfaf7] px-4 py-3.5 text-base outline-none transition focus:border-[#8b6b4a] focus:ring-4 focus:ring-[#e9d7bf]"
                      />
                    </label>
                  </div>

                  <label className="mt-5 block">
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
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4d3d33]">
                      <p>Tarikh masuk: <span className="font-semibold">{formatDate(checkIn)}</span></p>
                      <p>Tarikh keluar: <span className="font-semibold">{formatDate(checkOut)}</span></p>
                      <p>Jumlah tetamu: <span className="font-semibold">{guests} orang</span></p>
                    </div>
                  </div>

                  <a
                    href={whatsappBookingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                  >
                    Klik WhatsApp untuk tempahan sekarang
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.09)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b6b4a]">
                  Tempah dengan lebih mudah
                </p>
                <h2 className="mt-5 text-balance font-display text-4xl leading-none text-[#2f221a] sm:text-5xl">
                  Klik WhatsApp untuk tempahan sekarang.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#665548] sm:text-lg">
                  Jika anda mencari homestay yang selesa untuk keluarga atau kumpulan di Shah Alam, Mosay Homestay sedia membantu. Hubungi kami terus untuk semak ketersediaan tarikh dan dapatkan respon dengan lebih pantas.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#f8f2ea] p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)] sm:p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4a]">Alamat</p>
                <p className="mt-4 text-lg font-semibold leading-8 text-[#2f221a]">
                  {siteMeta.addressLines[0]}
                  <br />
                  {siteMeta.addressLines[1]}
                </p>
                <a
                  href={siteMeta.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                >
                  WhatsApp Sekarang
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-[#f6efe6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b6b4a]">
              {siteMeta.familyName}
            </p>
            <p className="mt-3 font-display text-3xl text-[#2f221a]">{siteMeta.name}</p>
            <p className="mt-4 text-sm leading-7 text-[#665548]">
              {siteMeta.addressLines[0]}
              <br />
              {siteMeta.addressLines[1]}
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-[#665548]">
            <a
              href={siteMeta.phoneHref}
              className="inline-flex items-center gap-3 text-[#665548] transition hover:text-[#2f221a]"
            >
              <Phone className="size-4" strokeWidth={1.75} />
              {siteMeta.phoneDisplay}
            </a>
            <a
              href={siteMeta.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 text-[#665548] transition hover:text-[#2f221a]"
            >
              <MessageCircle className="size-4" strokeWidth={1.75} />
              Tempahan melalui WhatsApp
            </a>
          </div>
        </div>
      </footer>

      <a
        href={siteMeta.whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Hubungi Mosay Homestay melalui WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#1f7a4c] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(31,122,76,0.3)] transition hover:-translate-y-1 hover:bg-[#228653]"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">WhatsApp Kami</span>
      </a>

      {activeImage && activeImageDetails ? (
        <div className="fixed inset-0 z-[70] bg-[#1f1712]/88 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
            <div className="grid w-full gap-4 lg:grid-cols-[1.15fr_0.55fr]">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#120e0b] shadow-[0_32px_120px_rgba(0,0,0,0.35)]">
                <img
                  src={resolveAssetPath(activeImage)}
                  alt={activeImageDetails.title}
                  className="max-h-[78vh] w-full object-cover"
                />
              </div>

              <aside className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 text-[#f8f2ea] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveImage(null)}
                    className="ml-auto inline-flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/[0.16]"
                    aria-label="Tutup galeri"
                  >
                    <X className="size-5" />
                  </button>

                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-[#e0c4a6]">
                    {activeImageDetails.tag}
                  </p>
                  <h3 className="mt-4 font-display text-4xl leading-none">
                    {activeImageDetails.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[#dbc8b7]">
                    {activeImageDetails.description}
                  </p>
                </div>

                <a
                  href={siteMeta.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#f8f2ea] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] transition hover:-translate-y-0.5"
                >
                  Tempah Melalui WhatsApp
                  <ArrowRight className="size-4" />
                </a>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
