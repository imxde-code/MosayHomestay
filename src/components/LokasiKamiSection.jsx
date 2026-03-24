import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Navigation,
} from 'lucide-react'
import { siteMeta } from '../data/siteData'

const googleMapsQuery =
  'No.%2048,%20Jalan%20Kristal%207/65,%2040000%20Shah%20Alam,%20Selangor'

// 👉 GANTIKAN LINK GOOGLE MAPS DI SINI jika mahu lokasi lebih tepat
// 👉 Boleh tukar kepada embed API jika mahu guna API key
const googleMapsEmbedLink = `https://www.google.com/maps?q=${googleMapsQuery}&z=15&output=embed`
const googleMapsOpenLink = `https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`

function LokasiKamiSection() {
  return (
    <section
      id="lokasi-kami"
      className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(80,58,35,0.09)] sm:p-10 lg:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f9f2ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6b4a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
            <MapPin className="size-4" strokeWidth={1.75} />
            Lokasi Kami
          </p>

          <h2 className="mt-6 text-balance font-display text-4xl leading-none text-[#2f221a] sm:text-5xl">
            Mudah dicari dan strategik untuk setiap urusan anda.
          </h2>

          <p className="mt-5 text-base leading-8 text-[#665548] sm:text-lg">
            Lokasi homestay kami sangat strategik di Seksyen 7 Shah Alam,
            berhampiran pelbagai kemudahan seperti UiTM, hospital dan pusat
            bandar.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-[#eadccf] bg-[#f8f2ea] p-6 text-center shadow-[0_20px_70px_rgba(80,58,35,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6b4a]">
            Alamat
          </p>
          <p className="mt-4 text-lg font-semibold leading-8 text-[#2f221a]">
            {siteMeta.addressLines[0]}
            <br />
            {siteMeta.addressLines[1]}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#eadccf] bg-[#f8f2ea] p-3 shadow-[0_28px_90px_rgba(80,58,35,0.12)]">
          <iframe
            title="Peta lokasi Mosay Homestay"
            src={googleMapsEmbedLink}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full rounded-[1.5rem] border-0 sm:h-[420px] lg:h-[520px]"
          />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={googleMapsOpenLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#d8c8b4] bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f221a] shadow-[0_16px_40px_rgba(80,58,35,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c7b39b] hover:shadow-[0_22px_50px_rgba(80,58,35,0.12)] sm:w-auto"
          >
            <Navigation className="size-4" strokeWidth={1.75} />
            Buka di Google Maps
          </a>

          <a
            href={siteMeta.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2f221a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f8f2ea] shadow-[0_18px_45px_rgba(47,34,26,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#3a2b22] hover:shadow-[0_24px_55px_rgba(47,34,26,0.24)] sm:w-auto"
          >
            <MessageCircle className="size-4" strokeWidth={1.75} />
            Tempah Sekarang (WhatsApp)
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default LokasiKamiSection
