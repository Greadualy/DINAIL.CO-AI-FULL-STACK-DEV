/**
 * DINAIL_ASSETS — Konfigurasi Terpusat Semua Path Gambar
 * Ganti nilai path di bawah ini dengan foto asli dinail.co
 * yang sudah kamu taruh di folder public/images/
 *
 * Contoh: heroNailArt -> taruh file di public/images/hero_nail_art.jpg
 *         lalu nilai path di sini: '/images/hero_nail_art.jpg'
 */

export const DINAIL_ASSETS = {
  /** Logo brand dinail.co */
  logo: '/images/Logo.webp',

  /** Foto hero utama nail art showcase */
  heroNailArt: '/images/hero_nail_art.webp',

  /**
   * 6 foto ilustrasi/dokumentasi untuk masing-masing langkah pemesanan
   * Ganti dengan foto yang lebih representatif sesuai langkah
   */
  stepImages: {
    1: '/images/catalog_milky_french.webp',   // Langkah 01: Login
    2: '/images/catalog_bridal_pearl.webp',   // Langkah 02: Cek ukuran kuku
    3: '/images/catalog_blush_chrome.webp',   // Langkah 03: Isi data diri
    4: '/images/catalog_cat_eye.webp',        // Langkah 04: Isi form konsultasi
    5: '/images/catalog_tortoiseshell.webp',  // Langkah 05: Tunggu konfirmasi
    6: '/images/catalog_press_on_coquette.webp', // Langkah 06: ACC & Shopee
  },

  /**
   * Foto koleksi nail art untuk katalog & price list
   * Tambah/ganti sesuai koleksi dinail.co
   */
  catalogPreviews: [
    '/images/catalog_milky_french.webp',
    '/images/catalog_bridal_pearl.webp',
    '/images/catalog_blush_chrome.webp',
    '/images/catalog_cat_eye.webp',
    '/images/catalog_tortoiseshell.webp',
    '/images/catalog_press_on_coquette.webp',
  ],

  /**
   * Foto hasil pemasangan nail art dari pelanggan untuk testimoni
   * Idealnya foto wajah/tangan pelanggan yang sudah menggunakan produk
   */
  testimonialPhotos: [
    '/images/catalog_milky_french.webp',
    '/images/catalog_bridal_pearl.webp',
    '/images/catalog_blush_chrome.webp',
    '/images/catalog_cat_eye.webp',
    '/images/catalog_tortoiseshell.webp',
  ],

  /**
   * Gambar sampul paket Price List (dari Shopee dinail.co) — format .webp
   * Kelima file sudah ada di public/images/
   */
  priceList: {
    simple:   '/images/pricelist-simple.webp',
    basic:    '/images/pricelist-basic.webp',
    classic:  '/images/pricelist-classic.webp',
    luxury:   '/images/pricelist-luxury.webp',
    prestige: '/images/pricelist-prestige.webp',
  },

  /**
   * Slot gambar bentuk & panjang kuku (.webp) untuk section "9 Pilihan Shape & Length"
   * Taruh file di public/images/shapes/ lalu isi path-nya (misal '/images/shapes/almond-short.webp').
   * Jika kosong atau gagal dimuat, komponen otomatis menampilkan ilustrasi SVG kustom.
   */
  nailShapes: {
    almondShort:     '' as string, // '/images/shapes/almond-short.webp'
    almondMedium:    '' as string, // '/images/shapes/almond-medium.webp'
    ovalShort:       '' as string, // '/images/shapes/oval-short.webp'
    ovalMedium:      '' as string, // '/images/shapes/oval-medium.webp'
    coffinShort:     '' as string, // '/images/shapes/coffin-short.webp'
    coffinMedium:    '' as string, // '/images/shapes/coffin-medium.webp'
    stilettoLong:    '' as string, // '/images/shapes/stiletto-long.webp'
    squareExtraLong: '' as string, // '/images/shapes/square-extra-long.webp'
    squovalShort:    '' as string, // '/images/shapes/squoval-short.webp'
  },
} as const;

export type DinailAssets = typeof DINAIL_ASSETS;

