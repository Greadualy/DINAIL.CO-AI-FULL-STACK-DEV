/**
 * DINAIL_ASSETS — Konfigurasi Terpusat Semua Path Gambar Asli dinail.co
 * Seluruh aset berformat .webp tersimpan di public/images/
 */

export const DINAIL_ASSETS = {
  /** Logo brand dinail.co */
  logo: '/images/Logo.webp',

  /** Foto hero utama nail art showcase */
  heroNailArt: '/images/hero/hero.webp',

  /** Foto HD Karya Unggulan (Featured Works Carousel) */
  featuredWorks: [
    '/images/featured/featured-1.webp',
    '/images/featured/featured-2.webp',
    '/images/featured/featured-3.webp',
    '/images/featured/featured-4.webp',
  ],

  /**
   * 6 foto dokumentasi asli untuk masing-masing langkah pemesanan
   */
  stepImages: {
    1: '/images/catalog/basic/basic-6.webp',      // Langkah 01: Login
    2: '/images/catalog/luxury/luxury-12.webp',   // Langkah 02: Cek ukuran kuku
    3: '/images/catalog/classic/classic-11.webp', // Langkah 03: Isi data diri
    4: '/images/catalog/luxury/luxury-16.webp',   // Langkah 04: Isi form konsultasi
    5: '/images/catalog/luxury/luxury-15.webp',   // Langkah 05: Tunggu konfirmasi
    6: '/images/catalog/prestige/prestige-8.webp', // Langkah 06: ACC & Shopee
  },

  /**
   * Pilihan foto koleksi nail art unggulan asli dinail.co
   */
  catalogPreviews: [
    '/images/catalog/classic/classic-4.webp',
    '/images/catalog/luxury/luxury-15.webp',
    '/images/catalog/prestige/prestige-8.webp',
    '/images/catalog/classic/classic-9.webp',
    '/images/catalog/luxury/luxury-8.webp',
    '/images/catalog/basic/basic-6.webp',
  ],

  /**
   * Foto dokumentasi hasil nail art asli untuk testimoni
   */
  testimonialPhotos: [
    '/images/catalog/classic/classic-4.webp',
    '/images/catalog/luxury/luxury-15.webp',
    '/images/catalog/classic/classic-9.webp',
    '/images/catalog/luxury/luxury-8.webp',
    '/images/catalog/prestige/prestige-8.webp',
  ],

  /**
   * Gambar sampul paket Price List (dari Shopee dinail.co) — format .webp
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
   * Jika kosong atau gagal dimuat, komponen otomatis menampilkan ilustrasi SVG kustom.
   */
  nailShapes: {
    almondShort:     '' as string,
    almondMedium:    '' as string,
    ovalShort:       '' as string,
    ovalMedium:      '' as string,
    coffinShort:     '' as string,
    coffinMedium:    '' as string,
    stilettoLong:    '' as string,
    squareExtraLong: '' as string,
    squovalShort:    '' as string,
  },

  /** Gambar panduan visual untuk pelanggan */
  guides: {
    measureWithCoin: '/images/panduan-ukur-koin.webp',
  },
} as const;

export type DinailAssets = typeof DINAIL_ASSETS;
