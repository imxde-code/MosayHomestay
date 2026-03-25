import { Suspense, lazy, useEffect, useState } from 'react'
import {
  ArrowRight,
  Bath,
  BedDouble,
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
  galleryImages,
  getSiteData,
} from './data/siteData'
import BookingCalendarSection from './components/BookingCalendarSection'
import LokasiKamiSection from './components/LokasiKamiSection'
import {
  defaultLanguage,
  normalizeLanguage,
  supportedLanguages,
} from './lib/language'

const AdminBookingPage = lazy(() => import('./components/AdminBookingPage'))
const languageStorageKey = 'mosay-language'

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

function normalizePathname(pathname = '/') {
  const trimmedPath = pathname.replace(/\/+$/, '')

  if (!trimmedPath) {
    return '/'
  }

  return trimmedPath.toLowerCase()
}

function getSectionIdFromHash(hash) {
  if (!hash || hash === '#' || hash.startsWith('#/')) {
    return ''
  }

  return decodeURIComponent(hash.slice(1))
}

function isAdminRouteHash() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.location.hash.startsWith('#/admin') ||
    normalizePathname(window.location.pathname) === '/admin'
  )
}

function upsertMetaTag(attributeName, attributeValue, content) {
  let tag = document.head.querySelector(
    `meta[${attributeName}="${attributeValue}"]`,
  )

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attributeName, attributeValue)
    document.head.append(tag)
  }

  tag.setAttribute('content', content)
}

function upsertLinkTag(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)

  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.append(tag)
  }

  tag.setAttribute('href', href)
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

function LanguageToggle({ language, onChange, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#d8c8b4] bg-white/80 p-1 text-[#2f221a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
      <span className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b4a] sm:block">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {supportedLanguages.map((option) => {
          const isActive = option.code === language

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onChange(option.code)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                isActive
                  ? 'bg-[#2f221a] text-[#f8f2ea]'
                  : 'text-[#6a584c] hover:bg-[#f4ecdf]'
              }`}
              aria-pressed={isActive}
              title={option.name}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BrandLogo({ href, siteMeta, variant = 'header' }) {
  const sizeClass =
    variant === 'header'
      ? 'h-11 w-auto sm:h-12 lg:h-14'
      : 'h-14 w-auto sm:h-16'

  return (
    <a
      href={href}
      aria-label={siteMeta.name}
      className={`inline-flex items-center ${variant === 'header' ? 'shrink-0' : ''}`}
    >
      <img
        src={resolveAssetPath(siteMeta.logoPath)}
        alt={`${siteMeta.name} logo`}
        className={`${sizeClass} h-auto drop-shadow-[0_14px_34px_rgba(47,34,26,0.08)]`}
      />
    </a>
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

function GalleryCard({ image, details, isMissing, onError, onOpen, fallbackCopy }) {
  const cardDetails = details ?? {
    title: fallbackCopy.title,
    description: fallbackCopy.description,
    tag: fallbackCopy.tag,
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
            {fallbackCopy.actionLabel}
          </span>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b6b4a]">
              {cardDetails.tag}
            </p>
            <h3 className="text-2xl font-semibold text-[#2f221a]">{cardDetails.title}</h3>
            <p className="max-w-sm text-sm leading-7 text-[#6a584c]">
              {fallbackCopy.lead}
            </p>
            <p className="text-sm leading-7 text-[#6a584c]">{cardDetails.description}</p>
          </div>
        </div>
      ) : (
        <>
          <img
            src={imageSrc}
            alt={cardDetails.title}
            loading="lazy"
            onError={() => onError(image)}
            className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b211b] via-[#2b211b]/30 to-transparent opacity-90 transition duration-500 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1dfc7]">
              {cardDetails.tag}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{cardDetails.title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">{cardDetails.description}</p>
          </div>
        </>
      )}
    </button>
  )
}

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(isAdminRouteHash)
  const [activeImage, setActiveImage] = useState(null)
  const [failedImages, setFailedImages] = useState({})
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultLanguage
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey)

    if (storedLanguage) {
      return normalizeLanguage(storedLanguage)
    }

    return window.navigator.language?.toLowerCase().startsWith('en')
      ? 'en'
      : defaultLanguage
  })

  useEffect(() => {
    const syncRoute = () => {
      const isAdmin = isAdminRouteHash()
      setIsAdminRoute(isAdmin)

      if (isAdmin) {
        return
      }

      const sectionId = getSectionIdFromHash(window.location.hash)

      if (!sectionId) {
        return
      }

      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ block: 'start' })
      })
    }

    syncRoute()
    window.addEventListener('hashchange', syncRoute)

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(languageStorageKey, language)
    document.documentElement.lang = language
  }, [language])

  const {
    amenities,
    appContent,
    galleryDetails,
    highlights,
    houseFeatures,
    mapSection,
    navigationItems,
    nearbyPlaces,
    bookingSection,
    siteMeta,
  } = getSiteData(language)

  const activeImageDetails = activeImage ? galleryDetails[activeImage] : null

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const titleTag = document.querySelector('title')

    if (titleTag) {
      titleTag.textContent = siteMeta.pageTitle
    }

    const descriptionTag = document.querySelector('meta[name="description"]')

    if (descriptionTag) {
      descriptionTag.setAttribute('content', siteMeta.pageDescription)
    }

    upsertLinkTag('canonical', siteMeta.siteUrl)
    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:site_name', siteMeta.name)
    upsertMetaTag('property', 'og:url', siteMeta.siteUrl)
    upsertMetaTag('property', 'og:title', siteMeta.pageTitle)
    upsertMetaTag('property', 'og:description', siteMeta.pageDescription)
    upsertMetaTag('property', 'og:image', siteMeta.ogImageUrl)
    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', siteMeta.pageTitle)
    upsertMetaTag('name', 'twitter:description', siteMeta.pageDescription)
    upsertMetaTag('name', 'twitter:image', siteMeta.ogImageUrl)
  }, [
    siteMeta.name,
    siteMeta.ogImageUrl,
    siteMeta.pageDescription,
    siteMeta.pageTitle,
    siteMeta.siteUrl,
  ])

  function handleImageError(imagePath) {
    setFailedImages((current) => ({
      ...current,
      [imagePath]: true,
    }))
  }

  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[linear-gradient(180deg,_#fbf6f0_0%,_#f7f0e8_38%,_#f5eee4_100%)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(80,58,35,0.08)] sm:p-10">
              <p className="inline-flex items-center gap-3 rounded-full border border-[#d8c8b4] bg-[#f8f2ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6b4a]">
                {appContent.loadingAdmin.title}
              </p>
              <p className="mt-5 text-sm leading-7 text-[#665548]">
                {appContent.loadingAdmin.description}
              </p>
            </div>
          </div>
        }
      >
        <AdminBookingPage />
      </Suspense>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(243,234,223,0.65)_42%,_transparent_78%)]" />
      <div className="pointer-events-none absolute right-[-12rem] top-24 -z-10 size-[24rem] rounded-full bg-[#e9d6bf]/40 blur-3xl" />
      <div className="pointer-events-none absolute left-[-10rem] top-[48rem] -z-10 size-[22rem] rounded-full bg-[#f6e9d9]/70 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f9f4ed]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo href="#utama" siteMeta={siteMeta} />

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

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <LanguageToggle
              language={language}
              onChange={setLanguage}
              label={appContent.languageSwitcherLabel}
            />
            <a
              href={siteMeta.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f221a] px-5 py-3 text-sm font-semibold text-[#f8f2ea] shadow-[0_18px_40px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
            >
              {appContent.hero.primaryCta}
              <ArrowRight className="size-4" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section id="utama" className="mx-auto max-w-7xl px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="animate-fade-up">
              <p className="inline-flex items-center rounded-full border border-[#d8c8b4] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#8b6b4a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
                {appContent.hero.eyebrow}
              </p>
              <h1 className="text-balance mt-6 max-w-3xl font-display text-5xl leading-none text-[#2f221a] sm:text-6xl lg:text-7xl">
                {appContent.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#665548] sm:text-xl">
                {appContent.hero.description}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#tempahan"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3a2b22]"
                >
                  {appContent.hero.primaryCta}
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href="#galeri"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-[#d8c8b4] bg-white/75 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] shadow-[0_12px_35px_rgba(80,58,35,0.08)] transition hover:-translate-y-0.5 hover:border-[#c7b39b]"
                >
                  {appContent.hero.secondaryCta}
                  <ChevronRight className="size-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#5d4b3f]">
                {appContent.hero.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/80 bg-white/70 px-4 py-2"
                  >
                    {badge}
                  </span>
                ))}
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
                      {appContent.featurePanel.eyebrow}
                    </p>
                    <h2 className="mt-4 font-display text-4xl leading-none">
                      {appContent.featurePanel.title}
                    </h2>
                  </div>
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10 text-[#f5dfc3]">
                    <Home className="size-7" strokeWidth={1.75} />
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <BedDouble className="size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <p className="mt-4 text-lg font-semibold">
                      {appContent.featurePanel.cards[0].title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      {appContent.featurePanel.cards[0].description}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <Bath className="size-5 text-[#e8ccb0]" strokeWidth={1.75} />
                    <p className="mt-4 text-lg font-semibold">
                      {appContent.featurePanel.cards[1].title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#dbc8b7]">
                      {appContent.featurePanel.cards[1].description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#d7bea2]">
                      {appContent.featurePanel.contactLabel}
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{siteMeta.phoneDisplay}</p>
                  </div>
                  <a
                    href={siteMeta.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f8f2ea] px-5 py-3 text-sm font-semibold text-[#2f221a] transition hover:-translate-y-0.5"
                  >
                    {appContent.featurePanel.whatsappLabel}
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <article className="animate-float rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <MapPin className="size-6 text-[#8b6b4a]" strokeWidth={1.75} />
                  <p className="mt-5 text-lg font-semibold text-[#2f221a]">
                    {appContent.quickCards[0].title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    {appContent.quickCards[0].description}
                  </p>
                </article>
                <article className="animate-float-delay rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
                  <Wind className="size-6 text-[#8b6b4a]" strokeWidth={1.75} />
                  <p className="mt-5 text-lg font-semibold text-[#2f221a]">
                    {appContent.quickCards[1].title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#665548]">
                    {appContent.quickCards[1].description}
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
                eyebrow={appContent.sections.about.eyebrow}
                title={appContent.sections.about.title}
                description={appContent.sections.about.description}
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
            eyebrow={appContent.sections.amenities.eyebrow}
            title={appContent.sections.amenities.title}
            description={appContent.sections.amenities.description}
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
            eyebrow={appContent.sections.gallery.eyebrow}
            title={appContent.sections.gallery.title}
            description={appContent.sections.gallery.description}
          />

          <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#d8c8b4] bg-white/65 px-5 py-4 text-sm leading-7 text-[#665548] shadow-[0_18px_50px_rgba(80,58,35,0.05)]">
            {appContent.sections.gallery.hint}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleryImages.map((image) => (
              <GalleryCard
                key={image}
                image={image}
                details={galleryDetails[image]}
                isMissing={Boolean(failedImages[image])}
                onError={handleImageError}
                onOpen={setActiveImage}
                fallbackCopy={appContent.sections.gallery.fallback}
              />
            ))}
          </div>
        </section>

        <section id="lokasi" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading
              eyebrow={appContent.sections.location.eyebrow}
              title={appContent.sections.location.title}
              description={appContent.sections.location.description}
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

        <LokasiKamiSection siteMeta={siteMeta} copy={mapSection} />

        <BookingCalendarSection
          language={language}
          siteMeta={siteMeta}
          copy={bookingSection}
        />

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.09)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b6b4a]">
                  {appContent.sections.cta.eyebrow}
                </p>
                <h2 className="mt-5 text-balance font-display text-4xl leading-none text-[#2f221a] sm:text-5xl">
                  {appContent.sections.cta.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#665548] sm:text-lg">
                  {appContent.sections.cta.description}
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#f8f2ea] p-6 shadow-[0_20px_70px_rgba(80,58,35,0.08)] sm:p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4a]">
                  {appContent.sections.cta.addressLabel}
                </p>
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
                  {appContent.sections.cta.whatsappCta}
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="hubungi" className="border-t border-white/60 bg-[#f6efe6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <BrandLogo href="#utama" siteMeta={siteMeta} variant="footer" />
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
              {appContent.sections.footer.whatsappLabel}
            </a>
          </div>
        </div>

        <div className="border-t border-[#e7dacb] px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
            <p className="signature-shadow text-xs font-semibold uppercase tracking-[0.32em] text-[#8b6b4a]">
              {appContent.sections.footer.builtByLabel}
            </p>
            <a
              href="#/admin"
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b4a] transition hover:text-[#2f221a]"
            >
              {appContent.sections.footer.adminAccessLabel}
            </a>
          </div>
        </div>
      </footer>

      <a
        href={siteMeta.whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label={appContent.sections.footer.floatingWhatsAppAria}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#1f7a4c] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(31,122,76,0.3)] transition hover:-translate-y-1 hover:bg-[#228653]"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">
          {appContent.sections.footer.floatingWhatsAppLabel}
        </span>
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
                    aria-label={appContent.sections.footer.modalCloseAria}
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
                  {appContent.sections.footer.modalCta}
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
