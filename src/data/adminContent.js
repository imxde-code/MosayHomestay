import { normalizeLanguage } from '../lib/language'

const localizedAdminContent = {
  ms: {
    languageSwitcherLabel: 'Bahasa',
    guestSalutation: 'tuan/puan',
    unnamedGuest: 'Tetamu tanpa nama',
    backToHome: 'Kembali ke laman utama',
    headerBadge: 'Panel Admin Mosay Homestay',
    headerTitle: 'Urus booking terus dari website.',
    headerDescription:
      'Tambah booking baru, ubah tarikh, tandakan sebagai diblok atau dibatalkan, dan pantau semua tempahan dalam satu tempat.',
    signedInAs: 'Anda log masuk sebagai',
    signOut: 'Log Keluar',
    statusLabels: {
      inquiry: 'Pertanyaan',
      pending_payment: 'Menunggu Bayaran',
      confirmed: 'Disahkan',
      blocked: 'Diblok',
      expired: 'Tamat Tempoh',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    },
    sourceLabels: {
      whatsapp: 'WhatsApp',
      manual: 'Manual',
      website: 'Website',
    },
    statusFilters: [
      { value: 'all', label: 'Semua' },
      { value: 'inquiry', label: 'Pertanyaan' },
      { value: 'pending_payment', label: 'Menunggu Bayaran' },
      { value: 'confirmed', label: 'Disahkan' },
      { value: 'blocked', label: 'Diblok' },
      { value: 'completed', label: 'Selesai' },
      { value: 'expired', label: 'Tamat Tempoh' },
      { value: 'cancelled', label: 'Dibatalkan' },
    ],
    sourceFilters: [
      { value: 'all', label: 'Semua sumber' },
      { value: 'website', label: 'Website' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'manual', label: 'Manual' },
    ],
    missingConfig: {
      title: 'Panel Admin belum diaktifkan.',
      description:
        'Lengkapkan konfigurasi sambungan data dahulu untuk mengurus booking terus dari website ini.',
    },
    loadingSession: 'Memuatkan sesi admin...',
    loadingBookings: 'Memuatkan senarai booking...',
    loadingAdminAccess: 'Menyemak akses admin...',
    loginIntro: {
      badge: 'Log Masuk Admin',
      title: 'Akses khas untuk pengurusan tempahan.',
      description:
        'Gunakan akaun admin anda untuk melihat semua booking, menambah tempahan baru, atau membatalkan tarikh sedia ada.',
      accountCardTitle: 'Guna akaun admin anda sendiri',
      accountCardDescription:
        'Cipta seorang pengguna admin dalam sistem authentication dan gunakan email serta kata laluan itu di sini.',
      impactCardTitle: 'Data booking kekal dalam sistem',
      impactCardDescription:
        'Semua perubahan yang anda simpan di panel ini akan terus mempengaruhi kalendar ketersediaan di laman utama.',
    },
    loginForm: {
      title: 'Log masuk untuk teruskan',
      description:
        'Jika login belum berjaya, semak semula sama ada pengguna admin sudah diwujudkan dalam sistem authentication.',
      emailLabel: 'Email admin',
      emailPlaceholder: 'admin@mosay.com',
      passwordLabel: 'Kata laluan',
      passwordPlaceholder: 'Masukkan kata laluan',
      submit: 'Masuk ke Panel Admin',
      submitting: 'Sedang log masuk',
    },
    accessDenied: {
      badge: 'Akses Admin Diperlukan',
      title: 'Akaun ini belum dibenarkan untuk urus booking.',
      descriptionSuffix:
        'Semak semula senarai admin dalam Supabase atau log masuk menggunakan akaun admin yang betul.',
    },
    recordsSection: {
      eyebrow: 'Permintaan & Booking',
      title: 'Semua permintaan dan rekod tarikh',
      descriptionBefore: 'Permintaan dari laman web akan masuk sebagai ',
      descriptionHighlight: 'Pertanyaan',
      descriptionAfter:
        '. Sahkan untuk menutup tarikh pada kalendar pelanggan, atau batalkan jika tidak diteruskan.',
      refresh: 'Muat Semula',
      searchLabel: 'Cari rekod',
      searchPlaceholder: 'Nama, telefon, email, rujukan, nota...',
      sourceLabel: 'Sumber booking',
      statusFilterLabel: 'Tapis ikut status',
      resultsSummary: (filteredCount, totalCount) =>
        `Memaparkan ${filteredCount} daripada ${totalCount} rekod.`,
      resetFilters: 'Reset carian & tapisan',
    },
    inquirySection: {
      eyebrow: 'Permintaan Menunggu Tindakan',
      title: 'Luluskan atau batalkan permintaan baru',
      empty: 'Tiada permintaan baru buat masa ini.',
      emptyFiltered:
        'Tiada permintaan pertanyaan yang sepadan dengan carian atau tapisan anda.',
    },
    managedSection: {
      emptyFilteredTitle: 'Semua rekod yang dipadankan masih dalam status pertanyaan.',
      emptyFilteredDescription:
        'Luluskan atau batalkan permintaan di bahagian atas untuk mula mengunci tarikh pada kalendar pelanggan.',
      emptyTitle: 'Belum ada booking dalam sistem.',
      emptyDescription:
        'Permintaan dari laman web akan muncul di sini, atau gunakan borang di sebelah untuk tambah tempahan pertama.',
      noSearchResultsTitle: 'Tiada rekod yang sepadan dengan carian anda.',
      noSearchResultsDescription:
        'Cuba ubah carian atau status tapisan untuk lihat rekod lain dengan lebih cepat.',
    },
    bookingDetails: {
      reference: 'Rujukan',
      received: 'Diterima',
      confirmedAt: 'Disahkan pada',
      holdExpiresAt: 'Tahan hingga',
      phone: 'Telefon',
      email: 'Email',
      guests: 'Tetamu',
      guestsSuffix: 'orang',
      source: 'Sumber',
    },
    actions: {
      replyWhatsApp: 'Balas di WhatsApp',
      openWhatsApp: 'WhatsApp',
      confirmInquiry: 'Sahkan Tempahan',
      reviewEdit: 'Semak / Edit',
      cancelInquiry: 'Batal Permintaan',
      confirm: 'Sahkan',
      edit: 'Edit',
      markCancelled: 'Tandakan Batal',
      delete: 'Padam',
      addBooking: 'Tambah Booking',
      editBooking: 'Edit Booking',
      saveChanges: 'Simpan Perubahan',
      resetForm: 'Reset Borang',
      saving: 'Menyimpan',
    },
    form: {
      titleAdd: 'Masukkan booking baru terus di sini.',
      titleEdit: 'Kemaskini booking sedia ada.',
      descriptionBefore: 'Status ',
      descriptionFirst: 'Disahkan',
      descriptionBetween: ' dan ',
      descriptionSecond: 'Diblok',
      descriptionAfter:
        ' akan terus menutup tarikh tersebut pada kalendar laman utama.',
      guestNameLabel: 'Nama tetamu',
      guestNamePlaceholder: 'Contoh: Keluarga Ahmad',
      guestPhoneLabel: 'Telefon',
      guestPhonePlaceholder: '019-268 3116',
      guestEmailLabel: 'Email',
      guestEmailPlaceholder: 'tetamu@email.com',
      startDateLabel: 'Tarikh masuk',
      endDateLabel: 'Tarikh keluar',
      holdExpiresAtLabel: 'Tahan hingga',
      guestCountLabel: 'Jumlah tetamu',
      statusLabel: 'Status',
      sourceLabel: 'Sumber',
      notesLabel: 'Nota',
      notesPlaceholder:
        'Contoh: check-in lewat malam atau blok tarikh untuk kegunaan keluarga',
      footerBefore: 'Status ',
      footerFirst: 'Disahkan',
      footerBetween: ' dan ',
      footerSecond: 'Diblok',
      footerMiddle: ' akan terus menutup tarikh pada kalendar pelanggan. Status ',
      footerThird: 'Pertanyaan',
      footerBetweenSecond: ' dan ',
      footerFourth: 'Dibatalkan',
      footerAfter: ' tidak akan menghalang pilihan tarikh.',
    },
    errors: {
      overlappingDates:
        'Tarikh ini bertindih dengan booking aktif lain. Sila pilih julat tarikh yang berbeza.',
      adminAuthorization:
        'Akses anda untuk mengurus booking belum dibenarkan. Semak semula tetapan akses admin sistem anda.',
      genericActionFailed: 'Tindakan tidak berjaya disimpan. Sila cuba lagi.',
      restoreSession:
        'Sesi admin tidak dapat dipulihkan. Sila log masuk semula untuk teruskan.',
      adminAccessUnavailable:
        'Akses admin tidak dapat disahkan sekarang. Sila log keluar dan cuba semula.',
      adminAccessMissing:
        'Akaun ini berjaya log masuk tetapi belum diberi akses admin booking.',
      systemUnavailable:
        'Sambungan sistem belum tersedia. Semak semula konfigurasi laman anda.',
      signInFailed:
        'Log masuk tidak berjaya. Semak email dan kata laluan admin anda.',
      selectDates: 'Sila pilih tarikh masuk dan tarikh keluar.',
      invalidDateRange: 'Tarikh keluar mesti selepas tarikh masuk.',
      invalidGuestCount: 'Jumlah tetamu mesti sekurang-kurangnya 1 orang.',
    },
    messages: {
      requestConfirmed:
        'Permintaan telah disahkan dan tarikh kini ditutup pada kalendar pelanggan.',
      bookingConfirmed: 'Booking telah ditandakan sebagai disahkan.',
      requestCancelled: 'Permintaan telah dibatalkan.',
      bookingCancelled: 'Booking telah ditandakan sebagai dibatalkan.',
      bookingDeleted: 'Booking telah dipadam daripada sistem.',
      bookingUpdated: 'Booking berjaya dikemas kini.',
      bookingCreated: 'Booking baru berjaya ditambah.',
      deleteConfirmation: (guestName) =>
        `Padam booking untuk ${guestName || 'tetamu ini'}? Tindakan ini tidak boleh dipulihkan.`,
    },
    whatsapp: {
      inquiryMessageLines: ({ guestName, reference, stayRange }) => [
        `Salam ${guestName}, terima kasih kerana menghubungi Mosay Homestay.`,
        `Rujukan permintaan: ${reference}`,
        `Tarikh yang diminta: ${stayRange}`,
        'Kami sedang semak permintaan anda dan akan bantu anda di sini.',
      ],
      bookingMessageLines: ({ guestName, reference, stayRange }) => [
        `Salam ${guestName}, berkaitan booking Mosay Homestay anda.`,
        `Rujukan booking: ${reference}`,
        `Tarikh penginapan: ${stayRange}`,
        'Sila balas mesej ini jika anda perlukan bantuan lanjut.',
      ],
    },
  },
  en: {
    languageSwitcherLabel: 'Language',
    guestSalutation: 'there',
    unnamedGuest: 'Unnamed guest',
    backToHome: 'Back to home',
    headerBadge: 'Mosay Homestay Admin Panel',
    headerTitle: 'Manage bookings directly from the website.',
    headerDescription:
      'Add new bookings, adjust dates, mark stays as blocked or cancelled, and monitor all reservations in one place.',
    signedInAs: 'You are signed in as',
    signOut: 'Sign Out',
    statusLabels: {
      inquiry: 'Inquiry',
      pending_payment: 'Pending Payment',
      confirmed: 'Confirmed',
      blocked: 'Blocked',
      expired: 'Expired',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    sourceLabels: {
      whatsapp: 'WhatsApp',
      manual: 'Manual',
      website: 'Website',
    },
    statusFilters: [
      { value: 'all', label: 'All' },
      { value: 'inquiry', label: 'Inquiry' },
      { value: 'pending_payment', label: 'Pending Payment' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'blocked', label: 'Blocked' },
      { value: 'completed', label: 'Completed' },
      { value: 'expired', label: 'Expired' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    sourceFilters: [
      { value: 'all', label: 'All sources' },
      { value: 'website', label: 'Website' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'manual', label: 'Manual' },
    ],
    missingConfig: {
      title: 'The admin panel is not enabled yet.',
      description:
        'Complete the data connection setup first before managing website bookings here.',
    },
    loadingSession: 'Loading admin session...',
    loadingBookings: 'Loading booking list...',
    loadingAdminAccess: 'Checking admin access...',
    loginIntro: {
      badge: 'Admin Sign In',
      title: 'Restricted access for booking management.',
      description:
        'Use your admin account to view all bookings, add new stays, or cancel existing dates.',
      accountCardTitle: 'Use your own admin account',
      accountCardDescription:
        'Create an admin user in the authentication system, then sign in here with that email and password.',
      impactCardTitle: 'Booking data stays in the system',
      impactCardDescription:
        'Every change you save in this panel will directly affect the availability calendar on the main website.',
    },
    loginForm: {
      title: 'Sign in to continue',
      description:
        'If sign-in still fails, check that the admin user already exists in the authentication system.',
      emailLabel: 'Admin email',
      emailPlaceholder: 'admin@mosay.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      submit: 'Enter Admin Panel',
      submitting: 'Signing in',
    },
    accessDenied: {
      badge: 'Admin Access Required',
      title: 'This account is not allowed to manage bookings yet.',
      descriptionSuffix:
        'Check the Supabase admin list again or sign in with the correct admin account.',
    },
    recordsSection: {
      eyebrow: 'Requests & Bookings',
      title: 'All requests and booking records',
      descriptionBefore: 'Website requests will appear as ',
      descriptionHighlight: 'Inquiry',
      descriptionAfter:
        '. Confirm them to close those dates on the guest calendar, or cancel them if they do not proceed.',
      refresh: 'Refresh',
      searchLabel: 'Search records',
      searchPlaceholder: 'Name, phone, email, reference, notes...',
      sourceLabel: 'Booking source',
      statusFilterLabel: 'Filter by status',
      resultsSummary: (filteredCount, totalCount) =>
        `Showing ${filteredCount} of ${totalCount} records.`,
      resetFilters: 'Reset search & filters',
    },
    inquirySection: {
      eyebrow: 'Requests Awaiting Action',
      title: 'Approve or cancel new requests',
      empty: 'There are no new requests right now.',
      emptyFiltered: 'No inquiry requests match your current search or filters.',
    },
    managedSection: {
      emptyFilteredTitle: 'All matched records are still in inquiry status.',
      emptyFilteredDescription:
        'Approve or cancel a request above to start locking dates on the guest calendar.',
      emptyTitle: 'There are no bookings in the system yet.',
      emptyDescription:
        'Website requests will appear here, or use the form on the right to add the first booking.',
      noSearchResultsTitle: 'No records match your search.',
      noSearchResultsDescription:
        'Try changing the search or status filters to find other records faster.',
    },
    bookingDetails: {
      reference: 'Reference',
      received: 'Received',
      confirmedAt: 'Confirmed at',
      holdExpiresAt: 'Hold expires',
      phone: 'Phone',
      email: 'Email',
      guests: 'Guests',
      guestsSuffix: 'guests',
      source: 'Source',
    },
    actions: {
      replyWhatsApp: 'Reply on WhatsApp',
      openWhatsApp: 'WhatsApp',
      confirmInquiry: 'Confirm Booking',
      reviewEdit: 'Review / Edit',
      cancelInquiry: 'Cancel Request',
      confirm: 'Confirm',
      edit: 'Edit',
      markCancelled: 'Mark Cancelled',
      delete: 'Delete',
      addBooking: 'Add Booking',
      editBooking: 'Edit Booking',
      saveChanges: 'Save Changes',
      resetForm: 'Reset Form',
      saving: 'Saving',
    },
    form: {
      titleAdd: 'Enter a new booking right here.',
      titleEdit: 'Update an existing booking.',
      descriptionBefore: 'Statuses ',
      descriptionFirst: 'Confirmed',
      descriptionBetween: ' and ',
      descriptionSecond: 'Blocked',
      descriptionAfter:
        ' will immediately close those dates on the main website calendar.',
      guestNameLabel: 'Guest name',
      guestNamePlaceholder: 'Example: Ahmad Family',
      guestPhoneLabel: 'Phone',
      guestPhonePlaceholder: '019-268 3116',
      guestEmailLabel: 'Email',
      guestEmailPlaceholder: 'guest@email.com',
      startDateLabel: 'Check-in date',
      endDateLabel: 'Check-out date',
      holdExpiresAtLabel: 'Hold expires',
      guestCountLabel: 'Guest count',
      statusLabel: 'Status',
      sourceLabel: 'Source',
      notesLabel: 'Notes',
      notesPlaceholder:
        'Example: late-night check-in or block these dates for family use',
      footerBefore: 'Statuses ',
      footerFirst: 'Confirmed',
      footerBetween: ' and ',
      footerSecond: 'Blocked',
      footerMiddle: ' will continue closing dates on the guest calendar. Statuses ',
      footerThird: 'Inquiry',
      footerBetweenSecond: ' and ',
      footerFourth: 'Cancelled',
      footerAfter: ' will not block date selection.',
    },
    errors: {
      overlappingDates:
        'These dates overlap with another active booking. Please choose a different date range.',
      adminAuthorization:
        'Your access to manage bookings has not been authorized yet. Please review the admin access settings.',
      genericActionFailed: 'The action could not be saved. Please try again.',
      restoreSession:
        'The admin session could not be restored. Please sign in again to continue.',
      adminAccessUnavailable:
        'Admin access cannot be verified right now. Please sign out and try again.',
      adminAccessMissing:
        'This account signed in successfully but has not been granted booking admin access.',
      systemUnavailable:
        'The system connection is not available yet. Please review the site configuration.',
      signInFailed:
        'Sign-in failed. Please check your admin email and password.',
      selectDates: 'Please choose a check-in date and a check-out date.',
      invalidDateRange: 'The check-out date must be after the check-in date.',
      invalidGuestCount: 'Guest count must be at least 1.',
    },
    messages: {
      requestConfirmed:
        'The request has been confirmed and the dates are now closed on the guest calendar.',
      bookingConfirmed: 'The booking has been marked as confirmed.',
      requestCancelled: 'The request has been cancelled.',
      bookingCancelled: 'The booking has been marked as cancelled.',
      bookingDeleted: 'The booking has been deleted from the system.',
      bookingUpdated: 'The booking was updated successfully.',
      bookingCreated: 'A new booking was added successfully.',
      deleteConfirmation: (guestName) =>
        `Delete the booking for ${guestName || 'this guest'}? This action cannot be undone.`,
    },
    whatsapp: {
      inquiryMessageLines: ({ guestName, reference, stayRange }) => [
        `Hello ${guestName}, thank you for contacting Mosay Homestay.`,
        `Request reference: ${reference}`,
        `Requested dates: ${stayRange}`,
        'We are reviewing your request and will assist you here.',
      ],
      bookingMessageLines: ({ guestName, reference, stayRange }) => [
        `Hello ${guestName}, regarding your Mosay Homestay booking.`,
        `Booking reference: ${reference}`,
        `Stay dates: ${stayRange}`,
        'Please reply to this message if you need further help.',
      ],
    },
  },
}

export function getAdminContent(language = 'ms') {
  return localizedAdminContent[normalizeLanguage(language)]
}
