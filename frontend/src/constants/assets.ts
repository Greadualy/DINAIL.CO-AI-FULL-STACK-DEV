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
  logo: '/images/Logo.jpg',

  /** Foto hero utama nail art showcase */
  heroNailArt: '/images/hero_nail_art.jpg',

  /**
   * 6 foto ilustrasi/dokumentasi untuk masing-masing langkah pemesanan
   * Ganti dengan foto yang lebih representatif sesuai langkah
   */
  stepImages: {
    1: '/images/catalog_milky_french.jpg',   // Langkah 01: Login
    2: '/images/catalog_bridal_pearl.jpg',   // Langkah 02: Cek ukuran kuku
    3: '/images/catalog_blush_chrome.jpg',   // Langkah 03: Isi data diri
    4: '/images/catalog_cat_eye.jpg',        // Langkah 04: Isi form konsultasi
    5: '/images/catalog_tortoiseshell.jpg',  // Langkah 05: Tunggu konfirmasi
    6: '/images/catalog_press_on_coquette.jpg', // Langkah 06: ACC & Shopee
  },

  /**
   * Foto koleksi nail art untuk katalog & price list
   * Tambah/ganti sesuai koleksi dinail.co
   */
  catalogPreviews: [
    '/images/catalog_milky_french.jpg',
    '/images/catalog_bridal_pearl.jpg',
    '/images/catalog_blush_chrome.jpg',
    '/images/catalog_cat_eye.jpg',
    '/images/catalog_tortoiseshell.jpg',
    '/images/catalog_press_on_coquette.jpg',
  ],

  /**
   * Foto hasil pemasangan nail art dari pelanggan untuk testimoni
   * Idealnya foto wajah/tangan pelanggan yang sudah menggunakan produk
   */
  testimonialPhotos: [
    '/images/catalog_milky_french.jpg',
    '/images/catalog_bridal_pearl.jpg',
    '/images/catalog_blush_chrome.jpg',
    '/images/catalog_cat_eye.jpg',
    '/images/catalog_tortoiseshell.jpg',
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
} as const;

export type DinailAssets = typeof DINAIL_ASSETS;

