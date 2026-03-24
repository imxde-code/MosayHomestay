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
  '/images/ruang-tamu.jpeg',
  '/images/ruang-makan.jpeg',
  '/images/bilik-utama-biru.jpeg',
  '/images/bilik-utama-ungu.jpeg',
  '/images/bilik-utama-merah-jambu.jpeg',
  '/images/bilik-dua-katil.jpeg',
  '/images/bilik-single-tambahan.jpeg',
  '/images/pemandangan-kawasan.jpeg',
]

export const galleryDetails = {
  '/images/ruang-tamu.jpeg': {
    title: 'Ruang tamu keluarga',
    description: 'Ruang santai yang selesa untuk berkumpul, menonton dan berehat bersama keluarga.',
    tag: 'Ruang santai',
  },
  '/images/ruang-makan.jpeg': {
    title: 'Ruang makan yang kemas',
    description: 'Sesuai untuk sarapan, makan malam dan waktu santai bersama tetamu lain.',
    tag: 'Ruang makan',
  },
  '/images/bilik-utama-biru.jpeg': {
    title: 'Bilik utama biru',
    description: 'Bilik yang lapang dan tenang untuk rehat malam yang lebih selesa.',
    tag: 'Bilik tidur',
  },
  '/images/bilik-utama-ungu.jpeg': {
    title: 'Bilik utama ungu',
    description: 'Pilihan bilik yang selesa dengan susun atur praktikal untuk penginapan keluarga.',
    tag: 'Bilik tidur',
  },
  '/images/bilik-utama-merah-jambu.jpeg': {
    title: 'Bilik utama merah jambu',
    description: 'Suasana bilik yang kemas dan nyaman untuk tidur yang lebih berkualiti.',
    tag: 'Bilik tidur',
  },
  '/images/bilik-dua-katil.jpeg': {
    title: 'Bilik dua katil',
    description: 'Sesuai untuk ahli keluarga atau kumpulan kecil yang perlukan susunan katil berasingan.',
    tag: 'Bilik keluarga',
  },
  '/images/bilik-single-tambahan.jpeg': {
    title: 'Bilik tambahan single',
    description: 'Ruang tambahan yang praktikal untuk tetamu ekstra atau anak-anak.',
    tag: 'Bilik tambahan',
  },
  '/images/pemandangan-kawasan.jpeg': {
    title: 'Pemandangan kawasan sekitar',
    description: 'Persekitaran kejiranan yang tenang dan sesuai untuk penginapan keluarga.',
    tag: 'Kawasan sekitar',
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
