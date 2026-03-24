# MosayHomestay

Laman web React + Vite + Tailwind untuk Mosay Homestay di Shah Alam.

## Ciri Utama

- Rekaan responsif dan premium
- Kandungan sepenuhnya dalam Bahasa Melayu
- CTA tempahan terus ke WhatsApp
- Galeri dinamik dengan lightbox
- Kalendar ketersediaan dengan Supabase

## Jalankan Projek

```bash
npm install
npm run dev
```

## Build Production

```bash
npm run build
```

## Setup Supabase Untuk Kalendar Ketersediaan

1. Cipta project Supabase baru.
2. Buka `SQL Editor` dan jalankan fail `supabase/migrations/20260324153000_booking_availability.sql`.
3. Salin `.env.example` kepada `.env`.
4. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan nilai project anda.
5. Untuk GitHub Pages, tambah secret repo dengan nama yang sama:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Jika secret belum disambungkan, laman masih boleh dibuka tetapi seksyen kalendar akan berjalan dalam mod manual sementara.

## Contoh Data Tempahan

```sql
insert into public.bookings (
  guest_name,
  guest_phone,
  guest_count,
  start_date,
  end_date,
  status,
  source,
  notes
) values (
  'Tetamu Mosay',
  '019-268 3116',
  8,
  date '2026-04-10',
  date '2026-04-12',
  'confirmed',
  'manual',
  'Tempahan contoh untuk uji kalendar'
);
```

## Kemaskini Gambar Galeri

1. Letakkan gambar dalam `public/images/`
2. Kemaskini senarai `galleryImages` dalam `src/data/siteData.js`

Komen panduan untuk galeri sudah disediakan terus di dalam fail tersebut.
