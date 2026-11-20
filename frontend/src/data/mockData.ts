// src/data/mockData.ts — Semua data dummy terpusat

import { DINAIL_ASSETS } from '@/constants/assets';

// CATALOG
export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  img: string;
  popular?: boolean;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'milky-french',
    name: 'Milky French Collection',
    category: 'Classic',
    tags: ['French', 'Soft', 'Everyday'],
    description: 'Tampilan klasik perancis dengan sentuhan susu yang lembut dan elegan, cocok untuk acara formal maupun kasual.',
    img: DINAIL_ASSETS.catalogPreviews[0],
    popular: true,
  },
  {
    id: 'bridal-pearl',
    name: 'Bridal Pearl Series',
    category: 'Wedding',
    tags: ['Bridal', 'Pearl', 'Mewah'],
    description: 'Koleksi eksklusif untuk hari pernikahan dengan kilap mutiara premium yang memukau di setiap momen.',
    img: DINAIL_ASSETS.catalogPreviews[1],
    popular: true,
  },
  {
    id: 'blush-chrome',
    name: 'Blush Chrome Edition',
    category: 'Trendy',
    tags: ['Chrome', 'Blush', 'Mirror'],
    description: 'Efek chrome dengan warna blush rose gold yang trendi, memberikan kesan futuristik dan glamor.',
    img: DINAIL_ASSETS.catalogPreviews[2],
  },
  {
    id: 'cat-eye',
    name: 'Cat Eye Luxe',
    category: 'Trendy',
    tags: ['Cat Eye', 'Magnetic', 'Luxe'],
    description: 'Tekstur cat eye magnetic yang berkilau mengikuti cahaya, tampak berbeda dari setiap sudut pandang.',
    img: DINAIL_ASSETS.catalogPreviews[3],
    popular: true,
  },
  {
    id: 'tortoiseshell',
    name: 'Tortoiseshell Fantasy',
    category: 'Artistic',
    tags: ['Tortoise', 'Earthy', 'Unik'],
    description: 'Motif cangkang kura-kura dengan palet warna hangat amber dan cokelat yang artistik dan natural.',
    img: DINAIL_ASSETS.catalogPreviews[4],
  },
  {
    id: 'coquette',
    name: 'Press-On Coquette',
    category: 'Aesthetic',
    tags: ['Coquette', 'Ribbon', 'Pink'],
    description: 'Vibes coquette feminin dengan aksen ribbon dan warna pastel yang imut, trending di sosial media.',
    img: DINAIL_ASSETS.catalogPreviews[5],
  },
];

export const CATALOG_CATEGORIES = ['Semua', 'Classic', 'Wedding', 'Trendy', 'Artistic', 'Aesthetic'];

// PRICE LIST
export interface PriceItem {
  id: string;
  name: string;
  priceFrom: number;
  priceTo?: number;
  includes: string[];
  highlight?: boolean;
  badge?: string;
  category: 'Press-On' | 'Nail Art' | 'Paket';
}

export const PRICE_ITEMS: PriceItem[] = [
  {
    id: 'basic-press-on',
    name: 'Press-On Nails Basic',
    priceFrom: 85000,
    priceTo: 120000,
    includes: ['1 set 10 kuku', 'Desain solid/ombre', 'Ukuran custom via konsultasi', 'Lem kuku inklusif'],
    category: 'Press-On',
  },
  {
    id: 'premium-press-on',
    name: 'Press-On Nails Premium',
    priceFrom: 150000,
    priceTo: 220000,
    includes: ['1 set 10 kuku', 'Desain custom (cat eye, chrome, foil)', 'Ukuran presisi via foto', 'Lem pro & nail tab inklusif', 'Packaging gift box'],
    highlight: true,
    badge: 'TERLARIS',
    category: 'Press-On',
  },
  {
    id: 'bridal-set',
    name: 'Bridal Premium Set',
    priceFrom: 350000,
    priceTo: 500000,
    includes: ['1 set 10 kuku + 2 cadangan', 'Konsultasi desain 1-on-1', 'Desain mewah (pearl, 3D art)', 'Sertifikat ukuran kuku tersimpan', 'Packaging premium + ribbon'],
    badge: 'EKSKLUSIF',
    category: 'Press-On',
  },
  {
    id: 'konsultasi-desain',
    name: 'Konsultasi Desain',
    priceFrom: 0,
    includes: ['Cek ukuran via foto', 'Rekomendasi desain', 'Revisi desain 2x', 'Estimasi harga personal'],
    badge: 'GRATIS',
    category: 'Paket',
  },
  {
    id: 'nail-art-custom',
    name: 'Nail Art Custom Full',
    priceFrom: 200000,
    priceTo: 400000,
    includes: ['Desain fully custom', 'Handpainted art', 'Semua tipe kuku', 'Revisi tidak terbatas', 'Waktu pengerjaan 3–7 hari'],
    category: 'Nail Art',
    highlight: true,
    badge: 'CUSTOM',
  },
  {
    id: 'paket-hemat',
    name: 'Paket Hemat Duo',
    priceFrom: 220000,
    includes: ['2 set press-on (20 kuku)', 'Desain berbeda tiap set', 'Diskon 15% dari harga normal', 'Free ongkir area Yogyakarta'],
    badge: 'HEMAT',
    category: 'Paket',
  },
];

export const PRICE_CATEGORIES: Array<'Semua' | 'Press-On' | 'Nail Art' | 'Paket'> = ['Semua', 'Press-On', 'Nail Art', 'Paket'];

// CONSULTATIONS (Admin mock data)
export type ConsultStatus = 'pending' | 'acc' | 'revisi' | 'ditolak';

export interface Consultation {
  id: string;
  userName: string;
  userEmail: string;
  designName: string;
  nailShape: string;
  nailLength: string;
  color: string;
  notes: string;
  submittedAt: string;
  status: ConsultStatus;
  photoUrl?: string;
}

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'c001',
    userName: 'Sari Dewi',
    userEmail: 'sari@example.com',
    designName: 'Milky French Classic',
    nailShape: 'Oval',
    nailLength: 'Medium',
    color: 'Putih Susu',
    notes: 'Mohon dibuat tipis dan natural, buat acara wisuda.',
    submittedAt: '2026-11-14 09:30',
    status: 'pending',
    photoUrl: DINAIL_ASSETS.stepImages[2],
  },
  {
    id: 'c002',
    userName: 'Bella Salsabila',
    userEmail: 'bella@example.com',
    designName: 'Cat Eye Pink',
    nailShape: 'Almond',
    nailLength: 'Long',
    color: 'Pink Chrome',
    notes: 'Efek cat eye magnetic, warna pink dusty rose.',
    submittedAt: '2026-11-14 11:15',
    status: 'acc',
    photoUrl: DINAIL_ASSETS.stepImages[3],
  },
  {
    id: 'c003',
    userName: 'Citra Maharani',
    userEmail: 'citra@example.com',
    designName: 'Bridal Pearl Mewah',
    nailShape: 'Square',
    nailLength: 'Medium',
    color: 'Pearl White',
    notes: 'Untuk pernikahan 20 Nov. Mohon prioritas.',
    submittedAt: '2026-11-15 08:00',
    status: 'revisi',
    photoUrl: DINAIL_ASSETS.stepImages[4],
  },
  {
    id: 'c004',
    userName: 'Dinda Pratiwi',
    userEmail: 'dinda@example.com',
    designName: 'Blush Chrome Gradient',
    nailShape: 'Coffin',
    nailLength: 'Extra Long',
    color: 'Blush Rose Gold',
    notes: 'Gradient dari blush ke rose gold dengan chrome effect.',
    submittedAt: '2026-11-15 14:20',
    status: 'pending',
    photoUrl: DINAIL_ASSETS.stepImages[5],
  },
];

// TESTIMONI (Data Ulasan Nyata Pelanggan Shopee dinail.co)
export interface TestimonialItem {
  id: number | string;
  name: string;
  variant: string;
  review: string;
  rating: number;
}

export const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: 's*****j',
    variant: 'Hard, Almond - Medium',
    review: 'SUKA BANGET SAMA HASILNYA 🥺 🖤 🖤 🖤 Detailnya sebagus itu dan hasilnya juga rapih dan keren banget huhuhu... Thank youu udah bikinin secantik iniii, definitely bakal order lagi!! 🫶🏻',
    rating: 5,
  },
  {
    id: 2,
    name: 'v*****5',
    variant: 'Medium, Oval - Short',
    review: 'kesesuaian desain custom: sesuai dan gemes banget 🫶 Suka banget sama hasilnya, udah ready bgt dipake nonton konser, admin sellernya baik banget meskipun dapet customer macem aku yang suka chat jam nya sesuka hati mana slow respon lagi, tapi admin sellernya gk ada kesel²nya, dan hasilnya tetep bagus bgt 🫶 Makasih dapet bonus sheetmask lagi 🫶🫶',
    rating: 5,
  },
  {
    id: 3,
    name: 'j*****a',
    variant: 'Hard, Almond - Short',
    review: 'Pengalaman Penggunaan: BENER BENER SECANTIK ITU DAN SUPER DUPER WORTH ITTTT. awalnya ngiraaa warnanya terlalu soft, tapii makin lama di lihat ternyata inii cocok bangettt untuk warna kulit ku (sebelumnya udah cerita juga soal ini). design nyaa parahhh semirip itu sama yang aku mauu dannn super duper detail, BURU GUYSSSS BELIIII',
    rating: 5,
  },
  {
    id: 4,
    name: 'fatahsyaazzahra',
    variant: 'Hard, Almond - Medium',
    review: 'kualitas bahan kuku: bagus bgtt. kenyamanan pemakaian: belum. kesesuaian desain dengan referensi: 100%. SUKA BGTTT DETAIL DAN SESUAII.. LOV BGTT',
    rating: 5,
  },
  {
    id: 5,
    name: 'k*****h',
    variant: 'Very Hard, Oval - Short',
    review: 'okeee untuk harga segituuu, nyampenya juga sesuai estimasiii aaa suka mau order lagi yah nanti xixixixi thank you kak 🫰🏻 💗 💗 💗',
    rating: 5,
  },
  {
    id: 6,
    name: 'by_wiseman',
    variant: 'Easy, Oval - Short',
    review: 'Foto ketiga itu foto referensi, bisa dilihat ya hasilnya unch sekali 💖 Nailist juga ramah puoll, seneng bgt bikin di sini',
    rating: 5,
  },
  {
    id: 7,
    name: 'f*****5',
    variant: 'Hard, Almond - Medium',
    review: 'TALENTTTTTTT BISA SEMIRIP ITU BAGUS POLLL 😭 😭 😭 😫 💗 💗 💗 BINTANG 1000000 🥺 🤞🏻 🤞🏻',
    rating: 5,
  },
  {
    id: 8,
    name: 'p*****1',
    variant: 'Very Hard, Oval - Short',
    review: 'kualitas bahan dan kerapian: rapi banget dan lucuu. kesesuaian desain custom: mirip banget sama custom aku shsh. efek 3D: menarik banget tapi sayang ga aku pake di cf hiks',
    rating: 5,
  },
  {
    id: 9,
    name: 'beatricepp',
    variant: 'Hard, Almond - Short',
    review: 'cantikk cekalii sesuai permintaan lovv 💛 💛',
    rating: 5,
  },
  {
    id: 10,
    name: 'a*****i',
    variant: 'Hard, Oval - Medium',
    review: 'kualitas bahan dan kerapian: its really good. kesesuaian desain custom: almost cant find the different with the inspo. efek 3D: mine is just water drop on the thumb but its kinda good tho. meskipun perasaan campur aduk karena dikirim 3 hari sebelum pesta tapi sampai di satu hari sebelum. im glad im waiting for this nails bc this nail artist nail it',
    rating: 5,
  },
  {
    id: 11,
    name: 'anisanuraini9b',
    variant: 'Easy, Oval - Medium',
    review: 'Wahhh.. Thanks banget ya min sudah seniat ini. Saya akan memakai kuku palsu ini saat event CF24 yang akan datang, sampai repot repot begini dikasih loyalty cardnya, masker wajahnya, lemnya, alkoholnya, dan juga alat buat memakai dan juga remove nya, sampai sampai ini ada instruksi nya, dan kartu Tanda terimakasih nya min dan bonus stiker dari dinail.co seneng banget alhamdulillah paketnya juga sampai dengan selamat, dan komplit semuanya ada dan packaging nya jujur sumpah rapih banget dan lucu banget sweet juga thankyou banget yaa min sekali lagi sukses terus untuk toko dinail.co yaa',
    rating: 5,
  },
  {
    id: 12,
    name: 'h*****a',
    variant: 'Hard, Almond - Medium',
    review: 'kualitas bahan kuku: tebal, hasilnya rapi juga gak kasar ujungnya. kenyamanan pemakaian: belom dicoba pake sih, tp ukurannya jg pas sama kuku asli. kesesuaian desain dengan referensi: warna pinknya lebih gelap dr referensi, cmn overall msh oke sih. Adminnya jg responsif banget dan lumayan fast resp 👍🏻',
    rating: 5,
  },
  {
    id: 13,
    name: 'puputpk',
    variant: 'Hard, Almond - Short',
    review: 'cakeeeep bangeeeeettt huhu',
    rating: 5,
  },
  {
    id: 14,
    name: 'x*****x',
    variant: 'Hard, Almond - Short',
    review: 'SUKAA BANGETT SM HASILNYAA cakep sesuai yang akuu maauu',
    rating: 5,
  },
  {
    id: 15,
    name: 'a*****h',
    variant: 'Medium, Almond - Medium',
    review: 'lucu bangett... timakasii,, nanti akan aku tag di ig pas ak gunain... btw ini wat wisuda.. thank uu 🤞🏻 🤞🏻',
    rating: 5,
  },
  {
    id: 16,
    name: 'o*****t',
    variant: 'Very Hard, Almond - Short',
    review: 'Bagusss bgtt pokoknya mahhhh topp sesuai req, admin sabarrr 🥰 ketemu akun dinail co dari igeh karena masuk fyp ku hihi',
    rating: 5,
  },
  {
    id: 17,
    name: 'l*****2',
    variant: 'Easy, Almond - Medium',
    review: 'Cakep poll, dikasih bonus face mask juga love banget thank u min 💕',
    rating: 5,
  },
  {
    id: 18,
    name: 'shelomitam013',
    variant: 'Hard, Almond - Short',
    review: 'kualitas bahan kuku: kokoh dan kuat. kenyamanan pemakaian: nyaman tidak menghambat aktivitas. kesesuaian desain dengan referensi: sangat sesuai. sangat sangat puas dengan hasil plus sesuai dengan ekspektasi dari refrensi yang aku kirim',
    rating: 5,
  },
  {
    id: 19,
    name: 'shiroberry.store',
    variant: 'Hard, Almond - Short',
    review: 'detail pengerjaan: BAGUSSS. Bagusss bangeetttt',
    rating: 5,
  },
];

export const TESTIMONIALS = testimonials;
