import { normalizeLanguage } from '../lib/language'

function buildWhatsAppLink(message) {
  return `https://wa.me/60192683116?text=${encodeURIComponent(message)}`
}

const sharedSiteMeta = {
  name: 'Mosay Homestay',
  familyName: 'Mosay Family',
  siteUrl: 'https://mosayhomestay.com',
  ogImageUrl: 'https://mosayhomestay.com/images/ruang-tamu.jpeg',
  logoPath: '/images/mosay-logo-trimmed.png',
  phoneDisplay: '019-268 3116',
  phoneHref: 'tel:+60192683116',
  addressLines: [
    'No. 48, Jalan Kristal 7/65,',
    '40000 Shah Alam, Selangor',
  ],
}

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

const localizedSiteData = {
  ms: {
    siteMeta: {
      ...sharedSiteMeta,
      whatsappLink: buildWhatsAppLink('Salam Mosay Homestay'),
      pageTitle: 'Mosay Homestay | Homestay Keluarga di Shah Alam',
      pageDescription:
        'Mosay Homestay di Shah Alam menawarkan penginapan keluarga yang selesa, lengkap dan strategik berhampiran UiTM, hospital, IDCC dan pelbagai lokasi penting.',
    },
    navigationItems: [
      { label: 'Tentang', href: '#tentang' },
      { label: 'Kemudahan', href: '#kemudahan' },
      { label: 'Galeri', href: '#galeri' },
      { label: 'Lokasi', href: '#lokasi' },
      { label: 'Tempahan', href: '#tempahan' },
    ],
    highlights: [
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
    ],
    houseFeatures: [
      'Rumah teres 2 tingkat yang selesa dan lapang.',
      '4 bilik tidur utama + 1 bilik tambahan.',
      '3 bilik air dengan pemanas air.',
      'Katil queen di setiap bilik utama.',
      'Penghawa dingin di semua bilik kecuali bilik tambahan.',
      'Bilik extra dilengkapi 1 katil single.',
    ],
    amenities: [
      {
        title: 'WiFi percuma',
        description:
          'Sesuai untuk urusan kerja, pembelajaran dan hiburan sepanjang penginapan.',
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
        description:
          'Ruang santai yang sesuai untuk berbual, berehat dan meluangkan masa bersama.',
        icon: 'sofa',
      },
      {
        title: 'Meja makan 6 kerusi',
        description: 'Praktikal untuk sarapan, makan malam dan aktiviti keluarga.',
        icon: 'utensils',
      },
      {
        title: 'Coway air panas & sejuk',
        description:
          'Mudah untuk keluarga yang perlukan akses air panas atau sejuk dengan cepat.',
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
        description:
          'Lebih memudahkan bagi penginapan yang lebih panjang atau bersama anak-anak.',
        icon: 'washer',
      },
      {
        title: 'Peralatan memasak lengkap',
        description:
          'Pinggan mangkuk dan keperluan memasak asas tersedia untuk kegunaan tetamu.',
        icon: 'home',
      },
    ],
    galleryDetails: {
      '/images/ruang-tamu.jpeg': {
        title: 'Ruang tamu keluarga',
        description:
          'Ruang santai yang selesa untuk berkumpul, menonton dan berehat bersama keluarga.',
        tag: 'Ruang santai',
      },
      '/images/ruang-makan.jpeg': {
        title: 'Ruang makan yang kemas',
        description:
          'Sesuai untuk sarapan, makan malam dan waktu santai bersama tetamu lain.',
        tag: 'Ruang makan',
      },
      '/images/bilik-utama-biru.jpeg': {
        title: 'Bilik utama biru',
        description: 'Bilik yang lapang dan tenang untuk rehat malam yang lebih selesa.',
        tag: 'Bilik tidur',
      },
      '/images/bilik-utama-ungu.jpeg': {
        title: 'Bilik utama ungu',
        description:
          'Pilihan bilik yang selesa dengan susun atur praktikal untuk penginapan keluarga.',
        tag: 'Bilik tidur',
      },
      '/images/bilik-utama-merah-jambu.jpeg': {
        title: 'Bilik utama merah jambu',
        description: 'Suasana bilik yang kemas dan nyaman untuk tidur yang lebih berkualiti.',
        tag: 'Bilik tidur',
      },
      '/images/bilik-dua-katil.jpeg': {
        title: 'Bilik dua katil',
        description:
          'Sesuai untuk ahli keluarga atau kumpulan kecil yang perlukan susunan katil berasingan.',
        tag: 'Bilik keluarga',
      },
      '/images/bilik-single-tambahan.jpeg': {
        title: 'Bilik tambahan single',
        description: 'Ruang tambahan yang praktikal untuk tetamu ekstra atau anak-anak.',
        tag: 'Bilik tambahan',
      },
      '/images/pemandangan-kawasan.jpeg': {
        title: 'Pemandangan kawasan sekitar',
        description:
          'Persekitaran kejiranan yang tenang dan sesuai untuk penginapan keluarga.',
        tag: 'Kawasan sekitar',
      },
    },
    nearbyPlaces: [
      {
        title: 'UiTM Shah Alam',
        description:
          'Pilihan mudah untuk keluarga pelajar, urusan pendaftaran atau majlis graduasi.',
      },
      {
        title: 'UNISEL',
        description: 'Sesuai untuk kunjungan akademik, lawatan keluarga dan urusan kampus.',
      },
      {
        title: 'Jakel',
        description:
          'Mudah untuk sesi membeli-belah kain, pakaian atau persiapan acara.',
      },
      {
        title: 'Hospital Shah Alam',
        description:
          'Praktikal bagi keluarga yang datang untuk rawatan, lawatan atau temujanji.',
      },
      {
        title: 'IDCC',
        description:
          'Berhampiran pusat acara, seminar dan program korporat di Shah Alam.',
      },
      {
        title: 'Masjid Negeri',
        description:
          'Lokasi yang mudah dicapai untuk urusan keluarga dan aktiviti komuniti.',
      },
    ],
    appContent: {
      languageSwitcherLabel: 'Bahasa',
      mobileMenu: {
        title: 'Navigasi',
        openLabel: 'Buka menu',
        closeLabel: 'Tutup menu',
      },
      hero: {
        eyebrow: 'Homestay keluarga di Shah Alam',
        title: 'Selesa untuk keluarga, strategik untuk setiap urusan anda.',
        description:
          'Mosay Homestay menawarkan rumah teres 2 tingkat yang luas, lengkap dan mesra keluarga. Sesuai untuk penginapan berkumpulan, urusan kampus, acara di Shah Alam atau percutian singkat yang lebih tenang.',
        primaryCta: 'Tempah Sekarang',
        secondaryCta: 'Lihat Galeri',
        badges: [
          '4 bilik + 1 bilik tambahan',
          'Penghawa dingin semua bilik utama',
          'Berhampiran UiTM, IDCC & hospital',
        ],
      },
      featurePanel: {
        eyebrow: 'Ruang yang dibuat untuk keluarga',
        title: 'Rehat dengan lebih tenang dan praktikal.',
        cards: [
          {
            title: 'Katil queen setiap bilik utama',
            description:
              'Sesuai untuk keluarga yang perlukan tidur lebih selesa tanpa rasa sempit.',
          },
          {
            title: 'Pemanas air setiap bilik air',
            description:
              'Lebih selesa untuk orang dewasa, warga emas dan anak kecil.',
          },
        ],
        contactLabel: 'Hubungi terus',
        whatsappLabel: 'WhatsApp',
      },
      quickCards: [
        {
          title: 'Lokasi strategik',
          description:
            'Mudah bergerak ke UiTM Shah Alam, Hospital Shah Alam, IDCC, Jakel dan Masjid Negeri.',
        },
        {
          title: 'Penginapan lebih selesa',
          description:
            'Penghawa dingin pada semua bilik utama serta ruang yang sesuai untuk keluarga besar dan kumpulan.',
        },
      ],
      sections: {
        about: {
          eyebrow: 'Tentang Homestay',
          title: 'Penginapan yang terasa seperti rumah sendiri.',
          description:
            'Di Mosay Homestay, kami percaya pengalaman menginap yang baik bermula dengan rasa tenang, ruang yang cukup dan lokasi yang memudahkan urusan harian. Sebab itu setiap ruang dirancang untuk keluarga dan kumpulan yang mahu berehat dengan selesa tanpa mengorbankan akses ke tempat penting di Shah Alam.',
        },
        amenities: {
          eyebrow: 'Kemudahan',
          title: 'Lengkap untuk penginapan yang santai, kemas dan praktikal.',
          description:
            'Daripada hiburan seisi keluarga hinggalah keperluan memasak dan mencuci, kemudahan di Mosay Homestay disusun untuk memudahkan penginapan anda dari hari pertama hingga hari terakhir.',
        },
        gallery: {
          eyebrow: 'Galeri',
          title: 'Lihat suasana homestay yang selesa, lapang dan mesra keluarga.',
          description:
            'Klik mana-mana gambar untuk melihat paparan yang lebih besar dan dapatkan gambaran lebih jelas tentang ruang penginapan anda.',
          hint: 'Sentuh atau klik gambar untuk membuka paparan yang lebih besar.',
          fallback: {
            actionLabel: 'Tambah gambar',
            title: 'Gambar homestay',
            description:
              'Kemaskini butiran galeri untuk paparan yang lebih lengkap.',
            lead:
              'Galeri ini sedia untuk foto sebenar homestay anda supaya tetamu dapat melihat ruang dengan lebih jelas dan meyakinkan.',
            tag: 'Galeri',
          },
        },
        location: {
          eyebrow: 'Lokasi Strategik',
          title: 'Mudah untuk urusan kampus, keluarga, acara dan rawatan.',
          description:
            'Kedudukan Mosay Homestay memudahkan pergerakan anda ke lokasi penting sekitar Shah Alam. Sesuai untuk tetamu yang datang bersama keluarga, kumpulan kecil atau rombongan.',
        },
        cta: {
          eyebrow: 'Tempah dengan lebih mudah',
          title: 'Klik WhatsApp untuk tempahan sekarang.',
          description:
            'Jika anda mencari homestay yang selesa untuk keluarga atau kumpulan di Shah Alam, Mosay Homestay sedia membantu. Hubungi kami terus untuk semak ketersediaan tarikh dan dapatkan respon dengan lebih pantas.',
          addressLabel: 'Alamat',
          whatsappCta: 'WhatsApp Sekarang',
        },
        footer: {
          whatsappLabel: 'Tempahan melalui WhatsApp',
          builtByLabel: 'Dibina oleh imxde-code',
          adminAccessLabel: 'Akses Admin',
          floatingWhatsAppLabel: 'WhatsApp Kami',
          floatingWhatsAppAria: 'Hubungi Mosay Homestay melalui WhatsApp',
          modalCloseAria: 'Tutup galeri',
          modalCta: 'Tempah Melalui WhatsApp',
        },
      },
      loadingAdmin: {
        title: 'Memuatkan panel admin',
        description: 'Sila tunggu sebentar sementara panel pengurusan dibuka.',
      },
    },
    mapSection: {
      eyebrow: 'Lokasi Kami',
      title: 'Mudah dicari dan strategik untuk setiap urusan anda.',
      description:
        'Lokasi homestay kami sangat strategik di Seksyen 7 Shah Alam, berhampiran pelbagai kemudahan seperti UiTM, hospital dan pusat bandar.',
      addressLabel: 'Alamat',
      iframeTitle: 'Peta lokasi Mosay Homestay',
      openInMaps: 'Buka di Google Maps',
      whatsappCta: 'Tempah Sekarang (WhatsApp)',
    },
    bookingSection: {
      eyebrow: 'Kalendar Ketersediaan',
      title: 'Semak tarikh tersedia secara lebih tepat dan teratur.',
      description:
        'Tarikh yang telah disahkan atau ditutup akan ditanda sebagai tidak tersedia. Pilih tarikh masuk dan keluar, hantar permintaan tempahan, kemudian teruskan ke WhatsApp untuk pengesahan akhir.',
      pills: {
        availableDates: 'Tarikh tersedia',
        blockedDates: 'Tarikh ditutup',
        liveCheck: 'Semakan semasa',
        availableDays: 'Hari tersedia',
        blockedDays: 'Hari tidak tersedia',
        minNight: 'Pilih sekurang-kurangnya 1 malam',
        unavailable: 'Tidak tersedia',
      },
      featureList: [
        {
          title: 'Tarikh dikunci secara automatik',
          description:
            'Kalendar membaca blok tempahan daripada sistem supaya tarikh yang sudah ditempah tidak dipilih semula.',
        },
        {
          title: 'Sesuai untuk urusan pentadbiran',
          description:
            'Anda boleh urus tarikh yang diblok atau disahkan terus melalui panel pengurusan tanpa perlu ubah kod website setiap kali ada tempahan baru.',
        },
        {
          title: 'Pengesahan akhir tetap mudah',
          description:
            'Setiap permintaan akan direkodkan dahulu dalam sistem, kemudian tetamu disambungkan ke WhatsApp dengan mesej yang sudah siap diisi.',
        },
      ],
      loadError:
        'Kalendar ketersediaan belum dapat dimuatkan. Anda masih boleh teruskan pertanyaan melalui WhatsApp.',
      panel: {
        title: 'Pilih tarikh penginapan anda',
        description:
          'Gunakan bar tarikh ringkas untuk buka kalendar ketersediaan dan pilih julat penginapan anda.',
        loadingAvailability: 'Memuatkan ketersediaan',
        liveAvailability: 'Ketersediaan semasa',
        manualMode: 'Mod manual sementara',
      },
      dateBar: {
        checkInLabel: 'Tarikh masuk',
        checkInPlaceholder: 'Pilih tarikh',
        checkOutLabel: 'Tarikh keluar',
        checkOutPlaceholder: 'Pilih tarikh',
        stayLabel: 'Tempoh penginapan',
        stayEmpty: 'Belum dipilih',
        helper:
          'Buka kalendar untuk semak tarikh tersedia secara langsung, kemudian pilih tarikh masuk dan tarikh keluar anda.',
        openCalendarLabel: 'Buka Kalendar',
        changeDatesLabel: 'Ubah Tarikh',
        clearDatesLabel: 'Kosongkan tarikh',
      },
      modal: {
        eyebrow: 'Kalendar ketersediaan',
        title: 'Pilih julat tarikh anda',
        description:
          'Tarikh yang berwarna menunjukkan ketersediaan semasa. Pilih tarikh masuk dan tarikh keluar terus dari kalendar ini.',
        closeLabel: 'Tutup kalendar',
        doneLabel: 'Simpan Pilihan',
      },
      guestsLabel: 'Jumlah tetamu',
      guestsSuffix: 'orang',
      requestSummaryTitle: 'Ringkasan permintaan',
      summary: {
        checkIn: 'Tarikh masuk',
        checkOut: 'Tarikh keluar',
        nights: 'Jumlah malam',
        guests: 'Jumlah tetamu',
        empty:
          'Buka kalendar ketersediaan untuk pilih tarikh masuk dan tarikh keluar anda, kemudian ringkasan tempahan akan muncul di sini.',
        nightsSuffix: 'malam',
      },
      upcomingUnavailableTitle: 'Tarikh tidak tersedia terdekat',
      unavailableBlockDescription: 'Blok tempahan yang sedang dikunci dalam sistem.',
      noBlockedDatesLive:
        'Tiada blok tarikh ditemui buat masa ini. Semua tarikh yang dipaparkan masih terbuka untuk pertanyaan baru.',
      noBlockedDatesManual:
        'Tiada blok tarikh ditemui buat masa ini. Semua tarikh akan kelihatan terbuka sehingga anda sambungkan data tempahan sebenar.',
      form: {
        guestNameLabel: 'Nama tetamu',
        guestNamePlaceholder: 'Contoh: Keluarga Ahmad',
        guestPhoneLabel: 'Nombor telefon',
        guestPhonePlaceholder: 'Contoh: 019-268 3116',
        guestEmailLabel: 'Email (pilihan)',
        guestEmailPlaceholder: 'nama@email.com',
        notesLabel: 'Nota ringkas (pilihan)',
        notesPlaceholder: 'Contoh: check-in lewat malam atau keperluan tambahan',
        statusNotePrefix:
          'Permintaan anda akan masuk ke panel admin dahulu sebagai ',
        statusKeyword: 'Pertanyaan',
        statusNoteSuffix:
          '. Tempahan hanya dianggap sah selepas pihak Mosay Homestay mengesahkannya.',
        submitLabel: 'Hantar Permintaan',
        submittingLabel: 'Menghantar Permintaan',
        continueWhatsappLabel: 'Teruskan Pertanyaan di WhatsApp',
        selectDatesFirstLabel: 'Pilih Tarikh Dahulu',
      },
      requestMessages: {
        noDates: 'Sila pilih tarikh masuk dan tarikh keluar dahulu.',
        noAutomation:
          'Permintaan automatik belum diaktifkan. Sila teruskan melalui WhatsApp buat sementara waktu.',
        missingName: 'Sila isi nama tetamu untuk teruskan.',
        missingPhone: 'Sila isi nombor telefon untuk teruskan.',
        invalidPhone:
          'Sila masukkan nombor telefon yang sah supaya kami boleh hubungi anda semula.',
        unavailableDates:
          'Tarikh ini baru sahaja tidak tersedia. Sila pilih tarikh lain sebelum hantar permintaan baru.',
        selectionExpired:
          'Pilihan tarikh anda baru sahaja tidak tersedia dan telah dikosongkan. Sila pilih julat tarikh lain.',
        invalidGuests: 'Jumlah tetamu yang dimasukkan tidak sah.',
        invalidDates:
          'Tarikh masuk dan keluar tidak sah. Sila semak semula pilihan anda.',
        fallbackError: 'Permintaan belum berjaya dihantar. Sila cuba lagi.',
        successTitle: 'Permintaan anda berjaya direkodkan.',
        successPrefix: 'Permintaan anda telah direkodkan dengan rujukan',
        successSuffix:
          '. Simpan rujukan ini dan teruskan ke WhatsApp apabila anda sedia.',
        referenceLabel: 'Rujukan permintaan',
        successWhatsappHelp:
          'Butang di bawah akan membuka mesej WhatsApp yang sudah siap bersama rujukan permintaan anda.',
        whatsappFallback:
          'Jika WhatsApp tidak terbuka atau anda mahu sambung kemudian, simpan rujukan ini dan hubungi kami di',
        newRequestLabel: 'Buat Permintaan Baru',
      },
      devHint:
        'Lengkapkan konfigurasi sambungan data untuk aktifkan ketersediaan semasa dan permintaan tempahan automatik.',
    },
  },
  en: {
    siteMeta: {
      ...sharedSiteMeta,
      whatsappLink: buildWhatsAppLink('Hello Mosay Homestay'),
      pageTitle: 'Mosay Homestay | Family Homestay in Shah Alam',
      pageDescription:
        'Mosay Homestay in Shah Alam offers a comfortable, fully equipped, and strategically located family stay near UiTM, hospitals, IDCC, and other key destinations.',
    },
    navigationItems: [
      { label: 'About', href: '#tentang' },
      { label: 'Amenities', href: '#kemudahan' },
      { label: 'Gallery', href: '#galeri' },
      { label: 'Location', href: '#lokasi' },
      { label: 'Booking', href: '#tempahan' },
    ],
    highlights: [
      {
        value: '2 storeys',
        label: 'A spacious terrace home for families and small groups.',
      },
      {
        value: '4 + 1 rooms',
        label: 'Four main bedrooms and one extra room for added flexibility.',
      },
      {
        value: '3 bathrooms',
        label: 'Each bathroom is fitted with a water heater.',
      },
      {
        value: 'Easy location',
        label: 'Close to campuses, hospitals, event venues, and shopping areas.',
      },
    ],
    houseFeatures: [
      'A comfortable and spacious two-storey terrace house.',
      '4 main bedrooms + 1 extra room.',
      '3 bathrooms with water heaters.',
      'Queen beds in every main bedroom.',
      'Air conditioning in all main bedrooms except the extra room.',
      'The extra room includes a single bed.',
    ],
    amenities: [
      {
        title: 'Free WiFi',
        description: 'Ideal for work, study, and entertainment throughout your stay.',
        icon: 'wifi',
      },
      {
        title: '60-inch Smart TV',
        description: 'Enjoy a better viewing experience together in the living room.',
        icon: 'tv',
      },
      {
        title: 'Netflix, Disney+ & Unifi TV',
        description: 'A complete entertainment lineup for your downtime.',
        icon: 'sparkles',
      },
      {
        title: 'Sofa & living area',
        description:
          'A cozy shared space for conversation, rest, and time with family.',
        icon: 'sofa',
      },
      {
        title: 'Dining table for 6',
        description: 'Practical for breakfast, dinner, and family activities.',
        icon: 'utensils',
      },
      {
        title: 'Hot & cold Coway water',
        description:
          'Convenient for families who need quick access to hot or cold water.',
        icon: 'droplets',
      },
      {
        title: 'Large fridge & microwave',
        description: 'Easy to store groceries and reheat meals anytime.',
        icon: 'fridge',
      },
      {
        title: 'Rice cooker & gas stove',
        description:
          'Fully equipped for preparing simple meals or family cooking.',
        icon: 'chef',
      },
      {
        title: 'Washing machine',
        description: 'Helpful for longer stays or trips with children.',
        icon: 'washer',
      },
      {
        title: 'Complete cooking utensils',
        description:
          'Basic tableware and kitchen essentials are ready for guest use.',
        icon: 'home',
      },
    ],
    galleryDetails: {
      '/images/ruang-tamu.jpeg': {
        title: 'Family living room',
        description:
          'A cozy lounge area for gathering, watching shows, and unwinding together.',
        tag: 'Living area',
      },
      '/images/ruang-makan.jpeg': {
        title: 'Tidy dining area',
        description:
          'Great for breakfast, dinner, and relaxed moments with the group.',
        tag: 'Dining area',
      },
      '/images/bilik-utama-biru.jpeg': {
        title: 'Blue master room',
        description: 'A spacious and calming bedroom for a more restful night.',
        tag: 'Bedroom',
      },
      '/images/bilik-utama-ungu.jpeg': {
        title: 'Purple master room',
        description:
          'A comfortable room with a practical layout for family stays.',
        tag: 'Bedroom',
      },
      '/images/bilik-utama-merah-jambu.jpeg': {
        title: 'Pink master room',
        description:
          'A neat and comfortable bedroom designed for better sleep quality.',
        tag: 'Bedroom',
      },
      '/images/bilik-dua-katil.jpeg': {
        title: 'Twin-bed room',
        description:
          'Suitable for family members or small groups who prefer separate beds.',
        tag: 'Family room',
      },
      '/images/bilik-single-tambahan.jpeg': {
        title: 'Extra single room',
        description:
          'A practical extra space for additional guests or children.',
        tag: 'Extra room',
      },
      '/images/pemandangan-kawasan.jpeg': {
        title: 'Neighborhood surroundings',
        description:
          'A calm residential setting that suits family stays well.',
        tag: 'Surroundings',
      },
    },
    nearbyPlaces: [
      {
        title: 'UiTM Shah Alam',
        description:
          'A convenient option for student families, registration matters, or graduation events.',
      },
      {
        title: 'UNISEL',
        description:
          'Suitable for academic visits, family trips, and campus-related stays.',
      },
      {
        title: 'Jakel',
        description:
          'Easy access for fabric shopping, outfit purchases, or event preparation.',
      },
      {
        title: 'Hospital Shah Alam',
        description:
          'Practical for families coming for treatment, visits, or appointments.',
      },
      {
        title: 'IDCC',
        description:
          'Close to major event spaces, seminars, and corporate programs in Shah Alam.',
      },
      {
        title: 'Masjid Negeri',
        description:
          'An easy-to-reach location for family matters and community activities.',
      },
    ],
    appContent: {
      languageSwitcherLabel: 'Language',
      mobileMenu: {
        title: 'Navigation',
        openLabel: 'Open menu',
        closeLabel: 'Close menu',
      },
      hero: {
        eyebrow: 'Family homestay in Shah Alam',
        title: 'Comfort for families, convenience for every trip.',
        description:
          'Mosay Homestay offers a spacious two-storey terrace house that is fully equipped and family-friendly. It suits group stays, campus visits, events in Shah Alam, or a short, more peaceful getaway.',
        primaryCta: 'Book Now',
        secondaryCta: 'View Gallery',
        badges: [
          '4 bedrooms + 1 extra room',
          'Air conditioning in all main rooms',
          'Near UiTM, IDCC & hospitals',
        ],
      },
      featurePanel: {
        eyebrow: 'A home designed for families',
        title: 'Rest with greater ease and practicality.',
        cards: [
          {
            title: 'Queen beds in every main room',
            description:
              'Great for families who want more comfortable sleep without feeling cramped.',
          },
          {
            title: 'Water heaters in every bathroom',
            description:
              'More comfortable for adults, seniors, and young children.',
          },
        ],
        contactLabel: 'Contact us directly',
        whatsappLabel: 'WhatsApp',
      },
      quickCards: [
        {
          title: 'Strategic location',
          description:
            'Easy access to UiTM Shah Alam, Hospital Shah Alam, IDCC, Jakel, and Masjid Negeri.',
        },
        {
          title: 'A more comfortable stay',
          description:
            'Air conditioning in all main bedrooms plus enough space for larger families and groups.',
        },
      ],
      sections: {
        about: {
          eyebrow: 'About The Homestay',
          title: 'A stay that feels like home.',
          description:
            'At Mosay Homestay, we believe a great stay begins with peace of mind, enough space, and a location that makes daily plans easier. That is why each area is arranged for families and groups who want comfort without losing access to important places in Shah Alam.',
        },
        amenities: {
          eyebrow: 'Amenities',
          title: 'Everything you need for a calm, tidy, and practical stay.',
          description:
            'From family entertainment to cooking and laundry essentials, the amenities at Mosay Homestay are arranged to make your stay easier from day one until the last day.',
        },
        gallery: {
          eyebrow: 'Gallery',
          title: 'See the homestay atmosphere: comfortable, airy, and family-friendly.',
          description:
            'Tap any photo to open a larger view and get a clearer feel for the space you will be staying in.',
          hint: 'Tap or click any image to open a larger preview.',
          fallback: {
            actionLabel: 'Add image',
            title: 'Homestay image',
            description: 'Update the gallery details for a fuller presentation.',
            lead:
              'This gallery is ready for your real homestay photos so guests can understand the space more clearly and confidently.',
            tag: 'Gallery',
          },
        },
        location: {
          eyebrow: 'Strategic Location',
          title: 'Convenient for campus visits, family plans, events, and medical trips.',
          description:
            'Mosay Homestay makes it easier to move between key destinations around Shah Alam. It works well for guests arriving with family, small groups, or a travel party.',
        },
        cta: {
          eyebrow: 'Book more easily',
          title: 'Click WhatsApp to book now.',
          description:
            'If you are looking for a comfortable homestay for family or group stays in Shah Alam, Mosay Homestay is ready to help. Contact us directly to check dates and get a faster response.',
          addressLabel: 'Address',
          whatsappCta: 'WhatsApp Now',
        },
        footer: {
          whatsappLabel: 'Book via WhatsApp',
          builtByLabel: 'Built by imxde-code',
          adminAccessLabel: 'Admin Access',
          floatingWhatsAppLabel: 'WhatsApp Us',
          floatingWhatsAppAria: 'Contact Mosay Homestay via WhatsApp',
          modalCloseAria: 'Close gallery',
          modalCta: 'Book via WhatsApp',
        },
      },
      loadingAdmin: {
        title: 'Loading admin panel',
        description: 'Please wait while the management panel opens.',
      },
    },
    mapSection: {
      eyebrow: 'Our Location',
      title: 'Easy to find and convenient for every plan.',
      description:
        'Our homestay is strategically located in Section 7, Shah Alam, close to key places such as UiTM, hospitals, and the city center.',
      addressLabel: 'Address',
      iframeTitle: 'Mosay Homestay location map',
      openInMaps: 'Open in Google Maps',
      whatsappCta: 'Book Now (WhatsApp)',
    },
    bookingSection: {
      eyebrow: 'Availability Calendar',
      title: 'Check available dates with better clarity and structure.',
      description:
        'Dates that have already been confirmed or blocked are marked as unavailable. Choose your check-in and check-out dates, submit a booking request, then continue to WhatsApp for final confirmation.',
      pills: {
        availableDates: 'Available dates',
        blockedDates: 'Blocked dates',
        liveCheck: 'Live check',
        availableDays: 'Available days',
        blockedDays: 'Unavailable days',
        minNight: 'Choose at least 1 night',
        unavailable: 'Unavailable',
      },
      featureList: [
        {
          title: 'Dates lock automatically',
          description:
            'The calendar reads booking blocks from the system so already booked dates cannot be selected again.',
        },
        {
          title: 'Made for smoother admin work',
          description:
            'You can manage blocked or confirmed dates from the admin panel without editing website code every time a new booking comes in.',
        },
        {
          title: 'Final confirmation stays simple',
          description:
            'Every request is recorded in the system first, then guests are sent to WhatsApp with a prefilled message.',
        },
      ],
      loadError:
        'The availability calendar could not be loaded yet. You can still continue your inquiry through WhatsApp.',
      panel: {
        title: 'Choose your stay dates',
        description:
          'Use the compact date bar to open the availability calendar and choose your stay range.',
        loadingAvailability: 'Loading availability',
        liveAvailability: 'Live availability',
        manualMode: 'Manual mode for now',
      },
      dateBar: {
        checkInLabel: 'Check-in',
        checkInPlaceholder: 'Select a date',
        checkOutLabel: 'Check-out',
        checkOutPlaceholder: 'Select a date',
        stayLabel: 'Stay length',
        stayEmpty: 'Not selected yet',
        helper:
          'Open the calendar to review live availability, then choose your check-in and check-out dates.',
        openCalendarLabel: 'Open Calendar',
        changeDatesLabel: 'Change Dates',
        clearDatesLabel: 'Clear dates',
      },
      modal: {
        eyebrow: 'Availability calendar',
        title: 'Choose your stay range',
        description:
          'Highlighted dates reflect the latest availability. Select your check-in and check-out dates directly from this calendar.',
        closeLabel: 'Close calendar',
        doneLabel: 'Save Selection',
      },
      guestsLabel: 'Number of guests',
      guestsSuffix: 'guests',
      requestSummaryTitle: 'Request summary',
      summary: {
        checkIn: 'Check-in date',
        checkOut: 'Check-out date',
        nights: 'Number of nights',
        guests: 'Number of guests',
        empty:
          'Open the availability calendar to choose your check-in and check-out dates, then your booking summary will appear here.',
        nightsSuffix: 'nights',
      },
      upcomingUnavailableTitle: 'Upcoming unavailable dates',
      unavailableBlockDescription: 'These dates are currently locked in the system.',
      noBlockedDatesLive:
        'No blocked dates were found at the moment. All displayed dates are still open for new inquiries.',
      noBlockedDatesManual:
        'No blocked dates were found at the moment. All dates will appear open until you connect real booking data.',
      form: {
        guestNameLabel: 'Guest name',
        guestNamePlaceholder: 'Example: Ahmad Family',
        guestPhoneLabel: 'Phone number',
        guestPhonePlaceholder: 'Example: 019-268 3116',
        guestEmailLabel: 'Email (optional)',
        guestEmailPlaceholder: 'name@email.com',
        notesLabel: 'Short note (optional)',
        notesPlaceholder: 'Example: late check-in or extra requests',
        statusNotePrefix:
          'Your request will appear in the admin panel first as an ',
        statusKeyword: 'Inquiry',
        statusNoteSuffix:
          '. The booking is only considered confirmed after Mosay Homestay approves it.',
        submitLabel: 'Send Request',
        submittingLabel: 'Sending Request',
        continueWhatsappLabel: 'Continue Inquiry on WhatsApp',
        selectDatesFirstLabel: 'Select Dates First',
      },
      requestMessages: {
        noDates: 'Please select your check-in and check-out dates first.',
        noAutomation:
          'Automatic request submission is not active yet. Please continue through WhatsApp for now.',
        missingName: 'Please enter the guest name to continue.',
        missingPhone: 'Please enter the phone number to continue.',
        invalidPhone:
          'Please enter a valid phone number so we can contact you again.',
        unavailableDates:
          'These dates just became unavailable. Please choose a different date range before sending a new request.',
        selectionExpired:
          'Your selected dates just became unavailable and were cleared. Please choose a different date range.',
        invalidGuests: 'The guest count is not valid.',
        invalidDates:
          'The selected check-in and check-out dates are not valid. Please review your selection.',
        fallbackError: 'The request could not be sent yet. Please try again.',
        successTitle: 'Your request has been recorded successfully.',
        successPrefix: 'Your request has been recorded with reference',
        successSuffix:
          '. Please keep this reference and continue to WhatsApp when you are ready.',
        referenceLabel: 'Request reference',
        successWhatsappHelp:
          'The button below will open a prefilled WhatsApp message with your request reference included.',
        whatsappFallback:
          'If WhatsApp does not open or you prefer to continue later, keep this reference and contact us at',
        newRequestLabel: 'Send New Request',
      },
      devHint:
        'Complete the data connection setup to enable live availability and automatic booking requests.',
    },
  },
}

export function getSiteData(language = 'ms') {
  return localizedSiteData[normalizeLanguage(language)]
}
