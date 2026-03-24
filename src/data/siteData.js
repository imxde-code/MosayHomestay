export const siteMeta = {
  name: 'Mosay Homestay',
  familyName: 'Mosay Family',
  phoneDisplay: '019-268 3116',
  phoneHref: 'tel:+60192683116',
  whatsappLink: 'https://wa.me/60192683116?text=Hello%20Mosay%20Homestay',
  addressLines: [
    'No. 48, Jalan Kristal 7/65,',
    '40000 Shah Alam, Selangor',
  ],
}

export const navigationItems = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Kemudahan', href: '#kemudahan' },
  { label: 'Galeri', href: '#galeri' },
  { label: 'Lokasi', href: '#lokasi' },
  { label: 'Tempahan', href: '#tempahan' },
]

export const highlights = [
  {
    value: '2 tingkat',
    label: 'Rumah teres yang luas untuk keluarga dan rombongan kecil.',
  },
  {
    value: '4 + 1 bilik',
    label: 'Empat bilik utama dan satu bilik tambahan untuk fleksibiliti.',
  },
  {
    value: '3 bilik air',
    label: 'Lengkap dengan pemanas air pada setiap bilik air.',
  },
  {
    value: 'Lokasi mudah',
    label: 'Dekat dengan kampus, hospital, pusat acara dan kawasan membeli-belah.',
  },
]

export const houseFeatures = [
  'Rumah teres 2 tingkat yang selesa dan lapang.',
  '4 bilik tidur utama + 1 bilik tambahan.',
  '3 bilik air dengan pemanas air.',
  'Katil queen di setiap bilik utama.',
  'Penghawa dingin di semua bilik kecuali bilik tambahan.',
  'Bilik extra dilengkapi 1 katil single.',
]

export const amenities = [
  {
    title: 'WiFi percuma',
    description: 'Sesuai untuk urusan kerja, pembelajaran dan hiburan sepanjang penginapan.',
    icon: 'wifi',
  },
  {
    title: 'Smart TV 60 inci',
    description: 'Nikmati tontonan lebih puas di ruang tamu bersama keluarga.',
    icon: 'tv',
  },
  {
    title: 'Netflix, Disney+ & Unifi TV',
    description: 'Pilihan hiburan yang lengkap untuk waktu rehat anda.',
    icon: 'sparkles',
  },
  {
    title: 'Sofa & ruang tamu',
    description: 'Ruang santai yang sesuai untuk berbual, berehat dan meluangkan masa bersama.',
    icon: 'sofa',
  },
  {
    title: 'Meja makan 6 kerusi',
    description: 'Praktikal untuk sarapan, makan malam dan aktiviti keluarga.',
    icon: 'utensils',
  },
  {
    title: 'Coway air panas & sejuk',
    description: 'Mudah untuk keluarga yang perlukan akses air panas atau sejuk dengan cepat.',
    icon: 'droplets',
  },
  {
    title: 'Peti sejuk besar & microwave',
    description: 'Senang simpan stok makanan dan panaskan hidangan bila-bila masa.',
    icon: 'fridge',
  },
  {
    title: 'Rice cooker & dapur gas',
    description: 'Lengkap untuk anda sediakan makanan ringkas atau masakan keluarga.',
    icon: 'chef',
  },
  {
    title: 'Mesin basuh',
    description: 'Lebih memudahkan bagi penginapan yang lebih panjang atau bersama anak-anak.',
    icon: 'washer',
  },
  {
    title: 'Peralatan memasak lengkap',
    description: 'Pinggan mangkuk dan keperluan memasak asas tersedia untuk kegunaan tetamu.',
    icon: 'home',
  },
]

// 👉 GANTIKAN GAMBAR DI SINI
// Letakkan semua gambar homestay anda dalam folder /public/images/
// Kemudian update senarai dalam array galleryImages di atas
export const galleryImages = [
  '/images/rumah1.jpg',
  '/images/ruangtamu.jpg',
  '/images/bilik1.jpg',
  '/images/bilik2.jpg',
  '/images/dapur.jpg',
]

export const galleryDetails = {
  '/images/rumah1.jpg': {
    title: 'Bahagian luar rumah',
    description: 'Kemas, mudah diakses dan memberi rasa selesa sejak ketibaan.',
    tag: 'Ruang hadapan',
  },
  '/images/ruangtamu.jpg': {
    title: 'Ruang tamu keluarga',
    description: 'Tempat santai untuk berkumpul, berbual dan menonton bersama.',
    tag: 'Ruang santai',
  },
  '/images/bilik1.jpg': {
    title: 'Bilik utama yang tenang',
    description: 'Lengkap dengan katil queen untuk tidur yang lebih selesa.',
    tag: 'Bilik tidur',
  },
  '/images/bilik2.jpg': {
    title: 'Bilik tambahan yang praktikal',
    description: 'Sesuai untuk keluarga besar atau kumpulan yang perlukan ruang ekstra.',
    tag: 'Ruang fleksibel',
  },
  '/images/dapur.jpg': {
    title: 'Dapur lengkap untuk kegunaan anda',
    description: 'Mudah untuk sediakan sarapan, minuman atau masakan ringkas.',
    tag: 'Dapur',
  },
}

export const nearbyPlaces = [
  {
    title: 'UiTM Shah Alam',
    description: 'Pilihan mudah untuk keluarga pelajar, urusan pendaftaran atau majlis graduasi.',
  },
  {
    title: 'UNISEL',
    description: 'Sesuai untuk kunjungan akademik, lawatan keluarga dan urusan kampus.',
  },
  {
    title: 'Jakel',
    description: 'Mudah untuk sesi membeli-belah kain, pakaian atau persiapan acara.',
  },
  {
    title: 'Hospital Shah Alam',
    description: 'Praktikal bagi keluarga yang datang untuk rawatan, lawatan atau temujanji.',
  },
  {
    title: 'IDCC',
    description: 'Berhampiran pusat acara, seminar dan program korporat di Shah Alam.',
  },
  {
    title: 'Masjid Negeri',
    description: 'Lokasi yang mudah dicapai untuk urusan keluarga dan aktiviti komuniti.',
  },
]
