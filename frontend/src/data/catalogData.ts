export type MainCategory = 'Semua' | 'Basic' | 'Classic' | 'Luxury' | 'Prestige';

export interface CatalogDesignItem {
  id: string;
  name: string;
  category: Exclude<MainCategory, 'Semua'>;
  /** Varian atau gaya desain kuku */
  subType: string;
  /** Label badge varian (digunakan pada quick preview modal) */
  typeBadge: string;
  priceRange: string;
  recommendedShape: string;
  description: string;
  img: string;
}

export const MAIN_CATEGORIES: MainCategory[] = [
  'Semua',
  'Basic',
  'Classic',
  'Luxury',
  'Prestige',
];

export const CATEGORY_SUBFILTERS: Record<Exclude<MainCategory, 'Semua'>, string[]> = {
  Basic: ['Solid Gloss', 'Duo Tone', 'Blush Aura', 'Cat Eye'],
  Classic: ['Cat Eye', 'Chrome Art', 'French & Aura', 'Graphic & Pop', 'Earthy Motif'],
  Luxury: [
    'Floral & Pearl',
    'Cat Eye & Ocean',
    '3D Ribbon & Charm',
    'Concert & Fandom',
    'Artistic & Character',
  ],
  Prestige: [
    'Editorial Couture',
    'Tropical & Mixed Media',
    'Sculpted 3D Clay',
    'Anime & Portrait',
  ],
};

export const CATALOG_DESIGNS: CatalogDesignItem[] = [
  // ── BASIC TIER (6 Desain) ────────────────────────────────────────────────────
  {
    id: 'basic-1',
    name: 'Burgundy Forest Duo',
    category: 'Basic',
    subType: 'Duo Tone',
    typeBadge: 'Duo Tone',
    priceRange: 'Rp64.999 – Rp85.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Perpaduan warna burgundy maroon dan hijau zaitun solid dengan top coat kaca ultra-glossy yang elegan dan tegas.',
    img: '/images/catalog/basic/basic-1.webp',
  },
  {
    id: 'basic-2',
    name: 'Cerulean Ocean Gloss',
    category: 'Basic',
    subType: 'Solid Gloss',
    typeBadge: 'Solid Gloss',
    priceRange: 'Rp59.999 – Rp79.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Warna biru cerah bergaya ocean gloss dengan sapuan efek halus yang segar dan ringan untuk pemakaian harian.',
    img: '/images/catalog/basic/basic-2.webp',
  },
  {
    id: 'basic-3',
    name: 'Obsidian Silver Duo',
    category: 'Basic',
    subType: 'Duo Tone',
    typeBadge: 'Duo Tone',
    priceRange: 'Rp75.000 – Rp95.000',
    recommendedShape: 'Almond - Short',
    description:
      'Kontras monokrom hitam pekat dan silver metalik berkilau bersih untuk gaya modern yang minimalis namun edgy.',
    img: '/images/catalog/basic/basic-3.webp',
  },
  {
    id: 'basic-4',
    name: 'Peach Blush Ombre',
    category: 'Basic',
    subType: 'Blush Aura',
    typeBadge: 'Blush Aura',
    priceRange: 'Rp69.999 – Rp89.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Gradasi peach blush transparan yang lembut dan natural, memberikan kesan jari lebih jenjang dan rapi.',
    img: '/images/catalog/basic/basic-4.webp',
  },
  {
    id: 'basic-5',
    name: 'Creamy Rose Nude',
    category: 'Basic',
    subType: 'Solid Gloss',
    typeBadge: 'Solid Gloss',
    priceRange: 'Rp59.999 – Rp75.000',
    recommendedShape: 'Almond - Short',
    description:
      'Warna nude pink lembut bergaya clean girl dengan kilap gel halus yang timeless untuk segala suasana.',
    img: '/images/catalog/basic/basic-5.webp',
  },
  {
    id: 'basic-6',
    name: 'Soft Pearl Cat Eye',
    category: 'Basic',
    subType: 'Cat Eye',
    typeBadge: 'Cat Eye',
    priceRange: 'Rp85.000 – Rp110.160',
    recommendedShape: 'Almond - Short',
    description:
      'Efek velvet cat eye bernuansa pink mutiara yang manis, ringan dipakai, dan berkilau lembut mengikuti cahaya.',
    img: '/images/catalog/basic/basic-6.webp',
  },

  // ── CLASSIC TIER (13 Desain) ─────────────────────────────────────────────────
  {
    id: 'classic-1',
    name: 'Liquid Silver Chrome Swirl',
    category: 'Classic',
    subType: 'Chrome Art',
    typeBadge: 'Chrome Art',
    priceRange: 'Rp99.000 – Rp124.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Aksen ukiran liquid chrome perak bergaya modern di atas dasar sheer blush yang bersih dan berkarakter.',
    img: '/images/catalog/classic/classic-1.webp',
  },
  {
    id: 'classic-2',
    name: 'Milky Pink Glazed',
    category: 'Classic',
    subType: 'French & Aura',
    typeBadge: 'French & Aura',
    priceRange: 'Rp69.999 – Rp89.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Warna pink susu dengan lapisan kilap glazed pearl halus untuk tampilan feminin, bersih, dan elegan.',
    img: '/images/catalog/classic/classic-2.webp',
  },
  {
    id: 'classic-3',
    name: 'Misty Denim Wave',
    category: 'Classic',
    subType: 'Chrome Art',
    typeBadge: 'Chrome Art',
    priceRange: 'Rp85.000 – Rp109.000',
    recommendedShape: 'Almond - Short',
    description:
      'Paduan warna biru denim lembut dengan garis gelombang chrome tipis yang memberi sentuhan artistik minimalis.',
    img: '/images/catalog/classic/classic-3.webp',
  },
  {
    id: 'classic-4',
    name: 'Champagne Cat Eye Floral',
    category: 'Classic',
    subType: 'Cat Eye',
    typeBadge: 'Cat Eye',
    priceRange: 'Rp105.000 – Rp129.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Kilau champagne velvet cat eye yang mewah dipadukan aksen bunga emas mini dan mutiara halus bergaya timeless.',
    img: '/images/catalog/classic/classic-4.webp',
  },
  {
    id: 'classic-5',
    name: 'Pastel Aura Line Art',
    category: 'Classic',
    subType: 'Graphic & Pop',
    typeBadge: 'Graphic & Pop',
    priceRange: 'Rp95.000 – Rp119.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Gradasi pastel biru langit, lavender, peach, dan kuning hangat dihiasi ilustrasi garis putih halus yang ceria.',
    img: '/images/catalog/classic/classic-5.webp',
  },
  {
    id: 'classic-6',
    name: 'Cobalt Flame Graphic',
    category: 'Classic',
    subType: 'Graphic & Pop',
    typeBadge: 'Graphic & Pop',
    priceRange: 'Rp115.000 – Rp134.900',
    recommendedShape: 'Almond - Medium',
    description:
      'Desain grafis api biru kobalt dan hitam pekat berpadu detail ilustrasi tangan tegas untuk konser maupun streetwear.',
    img: '/images/catalog/classic/classic-6.webp',
  },
  {
    id: 'classic-7',
    name: 'Crimson Punk Doodle',
    category: 'Classic',
    subType: 'Graphic & Pop',
    typeBadge: 'Graphic & Pop',
    priceRange: 'Rp115.000 – Rp134.900',
    recommendedShape: 'Almond - Medium',
    description:
      'Kontras merah berry dan hitam dengan ilustrasi hati, garis ekspresif, serta tipografi kustom penuh karakter.',
    img: '/images/catalog/classic/classic-7.webp',
  },
  {
    id: 'classic-8',
    name: 'Coral Jelly Starlight',
    category: 'Classic',
    subType: 'French & Aura',
    typeBadge: 'French & Aura',
    priceRange: 'Rp79.000 – Rp99.000',
    recommendedShape: 'Oval - Short',
    description:
      'Dasar jelly coral merona dengan taburan kilau bintang halus yang manis, ringan, dan cocok untuk pemakaian harian.',
    img: '/images/catalog/classic/classic-8.webp',
  },
  {
    id: 'classic-9',
    name: 'Espresso Starburst Aura',
    category: 'Classic',
    subType: 'Earthy Motif',
    typeBadge: 'Earthy Motif',
    priceRange: 'Rp99.000 – Rp124.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Gradasi cokelat espresso dan karamel hangat dengan aksen bintang emas berkilau yang elegan dan earthy.',
    img: '/images/catalog/classic/classic-9.webp',
  },
  {
    id: 'classic-10',
    name: 'Leopard French Tips',
    category: 'Classic',
    subType: 'Earthy Motif',
    typeBadge: 'Earthy Motif',
    priceRange: 'Rp95.000 – Rp119.000',
    recommendedShape: 'Almond - Short',
    description:
      'French tips bermotif leopard amber di atas dasar pink susu dengan aksen garis hati tipis yang chic dan playful.',
    img: '/images/catalog/classic/classic-10.webp',
  },
  {
    id: 'classic-11',
    name: 'Classic White French Gel',
    category: 'Classic',
    subType: 'French & Aura',
    typeBadge: 'French & Aura',
    priceRange: 'Rp85.000 – Rp109.000',
    recommendedShape: 'Almond - Medium',
    description:
      'French tip putih bersih nan klasik dipercantik aksen tekstur gel transparan 3D lembut pada jari manis.',
    img: '/images/catalog/classic/classic-11.webp',
  },
  {
    id: 'classic-12',
    name: 'Gunmetal Chrome Cat Eye',
    category: 'Classic',
    subType: 'Cat Eye',
    typeBadge: 'Cat Eye',
    priceRange: 'Rp109.000 – Rp134.900',
    recommendedShape: 'Almond - Short',
    description:
      'Efek cat eye abu-abu metalik pekat dengan bingkai garis silver chrome presisi untuk kesan modern dan sleek.',
    img: '/images/catalog/classic/classic-12.webp',
  },
  {
    id: 'classic-13',
    name: 'Twilight Blue Marble',
    category: 'Classic',
    subType: 'Cat Eye',
    typeBadge: 'Cat Eye',
    priceRange: 'Rp95.000 – Rp119.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Motif marble biru senja yang lembut berpadu kuku aksen glitter perak berkilau untuk gaya anggun dan tenang.',
    img: '/images/catalog/classic/classic-13.webp',
  },

  // ── LUXURY TIER (18 Desain) ──────────────────────────────────────────────────
  {
    id: 'luxury-1',
    name: 'Monochrome Star Concert',
    category: 'Luxury',
    subType: 'Concert & Fandom',
    typeBadge: 'Concert & Fandom',
    priceRange: 'Rp145.000 – Rp175.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Desain kustom monokrom hitam-putih dengan bintang, aksen perak, dan detail grafis tajam khusus momen konser spesial.',
    img: '/images/catalog/luxury/luxury-1.webp',
  },
  {
    id: 'luxury-2',
    name: 'Scarlet Pulse Graphic',
    category: 'Luxury',
    subType: 'Concert & Fandom',
    typeBadge: 'Concert & Fandom',
    priceRange: 'Rp145.000 – Rp175.000',
    recommendedShape: 'Oval - Short',
    description:
      'Paduan merah menyala, putih, dan hitam dengan lukisan detail ikonik yang tampil stand-out di konser maupun acara malam.',
    img: '/images/catalog/luxury/luxury-2.webp',
  },
  {
    id: 'luxury-3',
    name: 'Midnight Ocean Cat Eye',
    category: 'Luxury',
    subType: 'Cat Eye & Ocean',
    typeBadge: 'Cat Eye & Ocean',
    priceRange: 'Rp135.000 – Rp165.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Efek magnetik biru laut dalam dipadukan tekstur ombak 3D dan ornamen emas halus bernuansa samudra malam.',
    img: '/images/catalog/luxury/luxury-3.webp',
  },
  {
    id: 'luxury-4',
    name: 'Sapphire Swan Artistry',
    category: 'Luxury',
    subType: 'Cat Eye & Ocean',
    typeBadge: 'Cat Eye & Ocean',
    priceRange: 'Rp155.000 – Rp184.690',
    recommendedShape: 'Almond - Medium',
    description:
      'Lukisan tangan angsa putih elegan di atas gradasi biru safir dan es dengan garis emas mikro yang puitis.',
    img: '/images/catalog/luxury/luxury-4.webp',
  },
  {
    id: 'luxury-5',
    name: 'Y2K Monochrome Square',
    category: 'Luxury',
    subType: '3D Ribbon & Charm',
    typeBadge: '3D Ribbon & Charm',
    priceRange: 'Rp139.000 – Rp169.000',
    recommendedShape: 'Square - Medium',
    description:
      'Kuku square bernuansa Y2K dengan aksen angka, pita mini, salib metalik, dan charm kristal yang edgy sekaligus chic.',
    img: '/images/catalog/luxury/luxury-5.webp',
  },
  {
    id: 'luxury-6',
    name: 'Pastel Dream Character',
    category: 'Luxury',
    subType: 'Artistic & Character',
    typeBadge: 'Artistic & Character',
    priceRange: 'Rp115.000 – Rp145.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Warna putih lilac lembut dihiasi ilustrasi karakter imut lukis tangan dan aksen titik kristal yang manis.',
    img: '/images/catalog/luxury/luxury-6.webp',
  },
  {
    id: 'luxury-7',
    name: 'Gothic Bloom Obsidian',
    category: 'Luxury',
    subType: 'Floral & Pearl',
    typeBadge: 'Floral & Pearl',
    priceRange: 'Rp149.000 – Rp179.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Perpaduan hitam pekat dan merah gelap dengan bunga 3D biru kobalt, mawar merah, serta detail gothic elegan.',
    img: '/images/catalog/luxury/luxury-7.webp',
  },
  {
    id: 'luxury-8',
    name: 'Coquette Ribbon & Shell',
    category: 'Luxury',
    subType: '3D Ribbon & Charm',
    typeBadge: '3D Ribbon & Charm',
    priceRange: 'Rp145.000 – Rp175.000',
    recommendedShape: 'Coffin - Medium',
    description:
      'Desain coquette pink pastel lengkap dengan pita 3D, tekstur kerang, mutiara mini, dan kristal berkilau yang feminin.',
    img: '/images/catalog/luxury/luxury-8.webp',
  },
  {
    id: 'luxury-9',
    name: 'Velvet Berry 3D Emboss',
    category: 'Luxury',
    subType: '3D Ribbon & Charm',
    typeBadge: '3D Ribbon & Charm',
    priceRange: 'Rp155.000 – Rp184.690',
    recommendedShape: 'Coffin - Long',
    description:
      'Warna merah berry dan putih susu dengan teknik 3D swirl, tekstur emboss, dan gel transparan berdimensi tinggi.',
    img: '/images/catalog/luxury/luxury-9.webp',
  },
  {
    id: 'luxury-10',
    name: 'Nocturne Botanical Swan',
    category: 'Luxury',
    subType: 'Artistic & Character',
    typeBadge: 'Artistic & Character',
    priceRange: 'Rp155.000 – Rp184.690',
    recommendedShape: 'Almond - Medium',
    description:
      'Lukisan tangan bunga lily putih, poppy merah, dan angsa di atas latar biru malam nan dramatis dan puitis.',
    img: '/images/catalog/luxury/luxury-10.webp',
  },
  {
    id: 'luxury-11',
    name: 'Baroque Sculpture Gold',
    category: 'Luxury',
    subType: 'Artistic & Character',
    typeBadge: 'Artistic & Character',
    priceRange: 'Rp159.000 – Rp184.690',
    recommendedShape: 'Almond - Medium',
    description:
      'Karya nail art bergaya barok artistik memadukan pahatan relief, aksen daun emas, dan palet zaitun-hitam eksklusif.',
    img: '/images/catalog/luxury/luxury-11.webp',
  },
  {
    id: 'luxury-12',
    name: 'Ruby Heart Cat Eye',
    category: 'Luxury',
    subType: 'Cat Eye & Ocean',
    typeBadge: 'Cat Eye & Ocean',
    priceRange: 'Rp125.000 – Rp155.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Efek cat eye merah ruby berpadu kilau perak dengan motif hati lukis tangan yang romantis dan playful.',
    img: '/images/catalog/luxury/luxury-12.webp',
  },
  {
    id: 'luxury-13',
    name: 'Midnight Melody Art',
    category: 'Luxury',
    subType: 'Concert & Fandom',
    typeBadge: 'Concert & Fandom',
    priceRange: 'Rp135.000 – Rp165.000',
    recommendedShape: 'Almond - Short',
    description:
      'Perpaduan biru dongker dan maroon dengan ilustrasi tuts piano, bintang emas, dan aksen hati bernuansa musikal.',
    img: '/images/catalog/luxury/luxury-13.webp',
  },
  {
    id: 'luxury-14',
    name: 'Celestial Starry Script',
    category: 'Luxury',
    subType: 'Concert & Fandom',
    typeBadge: 'Concert & Fandom',
    priceRange: 'Rp139.000 – Rp169.000',
    recommendedShape: 'Almond - Short',
    description:
      'Latar langit malam biru gelap diperkaya garis konstelasi emas, kaligrafi tipis, dan ilustrasi mikro penuh detail.',
    img: '/images/catalog/luxury/luxury-14.webp',
  },
  {
    id: 'luxury-15',
    name: 'Burgundy 3D Sakura Bloom',
    category: 'Luxury',
    subType: 'Floral & Pearl',
    typeBadge: 'Floral & Pearl',
    priceRange: 'Rp149.000 – Rp179.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Kelopak bunga sakura 3D berwarna berry-maroon di atas gradasi pink lembut dengan putik mutiara emas yang mewah.',
    img: '/images/catalog/luxury/luxury-15.webp',
  },
  {
    id: 'luxury-16',
    name: 'Cherry Blossom 3D Couture',
    category: 'Luxury',
    subType: 'Floral & Pearl',
    typeBadge: 'Floral & Pearl',
    priceRange: 'Rp155.000 – Rp184.690',
    recommendedShape: 'Almond - Medium',
    description:
      'Kombinasi bunga pahatan 3D emas, ilustrasi ceri manis, dan aksen polkadot lembut bergaya editorial yang elegan.',
    img: '/images/catalog/luxury/luxury-16.webp',
  },
  {
    id: 'luxury-17',
    name: 'Playful 3D Cartoon Art',
    category: 'Luxury',
    subType: 'Artistic & Character',
    typeBadge: 'Artistic & Character',
    priceRange: 'Rp159.000 – Rp184.690',
    recommendedShape: 'Almond - Short',
    description:
      'Desain karakter kartun 3D buatan tangan yang ekspresif dengan detail warna cerah dan penuh keceriaan.',
    img: '/images/catalog/luxury/luxury-17.webp',
  },
  {
    id: 'luxury-18',
    name: 'Retro Crimson Pop Art',
    category: 'Luxury',
    subType: 'Artistic & Character',
    typeBadge: 'Artistic & Character',
    priceRange: 'Rp155.000 – Rp184.690',
    recommendedShape: 'Almond - Medium',
    description:
      'Ilustrasi pop-art retro bernuansa merah, hitam, dan pink dengan polkadot, pita kupu-kupu, serta lukisan karakter klasik.',
    img: '/images/catalog/luxury/luxury-18.webp',
  },

  // ── PRESTIGE TIER (8 Desain) ─────────────────────────────────────────────────
  {
    id: 'prestige-1',
    name: 'Crimson Anime Portrait Edition',
    category: 'Prestige',
    subType: 'Anime & Portrait',
    typeBadge: 'Anime & Portrait',
    priceRange: 'Rp225.000 – Rp289.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Lukisan mikro karakter anime berpresisi tinggi dengan detail nomor jersey, ornamen merah-hitam, dan finishing gel kaca.',
    img: '/images/catalog/prestige/prestige-1.webp',
  },
  {
    id: 'prestige-2',
    name: 'Obsidian Manga Brushwork',
    category: 'Prestige',
    subType: 'Anime & Portrait',
    typeBadge: 'Anime & Portrait',
    priceRange: 'Rp225.000 – Rp289.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Karya lukis tangan panel manga mikro berwarna burgundy dan hitam pekat dengan aksen sayap dan tipografi artistik.',
    img: '/images/catalog/prestige/prestige-2.webp',
  },
  {
    id: 'prestige-3',
    name: 'Vintage Crimson Mixed Media',
    category: 'Prestige',
    subType: 'Editorial Couture',
    typeBadge: 'Editorial Couture',
    priceRange: 'Rp189.000 – Rp245.000',
    recommendedShape: 'Almond - Medium',
    description:
      'Eksplorasi mixed-media merah ruby dan kolase vintage sepia berpadu charm metalik 3D bergaya editorial avant-garde.',
    img: '/images/catalog/prestige/prestige-3.webp',
  },
  {
    id: 'prestige-4',
    name: 'Amber Leopard Couture',
    category: 'Prestige',
    subType: 'Editorial Couture',
    typeBadge: 'Editorial Couture',
    priceRange: 'Rp239.000 – Rp309.000',
    recommendedShape: 'Stiletto - Long',
    description:
      'Desain couture bernuansa amber, cokelat tua, dan motif leopard diperkaya pita 3D, stud emas, serta rantai mutiara mewah.',
    img: '/images/catalog/prestige/prestige-4.webp',
  },
  {
    id: 'prestige-5',
    name: 'Sculpted 3D Marine Clay',
    category: 'Prestige',
    subType: 'Sculpted 3D Clay',
    typeBadge: 'Sculpted 3D Clay',
    priceRange: 'Rp249.000 – Rp324.470',
    recommendedShape: 'Oval - Short',
    description:
      'Pahatan clay 3D hewan laut buatan tangan penuh dimensi di atas warna pastel biru es yang menggemaskan dan unik.',
    img: '/images/catalog/prestige/prestige-5.webp',
  },
  {
    id: 'prestige-6',
    name: 'Kawaii 3D Patisserie Clay',
    category: 'Prestige',
    subType: 'Sculpted 3D Clay',
    typeBadge: 'Sculpted 3D Clay',
    priceRange: 'Rp259.000 – Rp324.470',
    recommendedShape: 'Almond - Short',
    description:
      'Figur pahatan 3D es krim pastel, beruang imut, dan pita pink buatan tangan level artisan khusus kolektor desain kawaii.',
    img: '/images/catalog/prestige/prestige-6.webp',
  },
  {
    id: 'prestige-7',
    name: 'Tropical Hibiscus 3D Glass',
    category: 'Prestige',
    subType: 'Tropical & Mixed Media',
    typeBadge: 'Tropical & Mixed Media',
    priceRange: 'Rp219.000 – Rp285.000',
    recommendedShape: 'Stiletto - Long',
    description:
      'Kuku kaca transparan bernuansa toska laut dan jingga senja dengan pahatan bunga kembang sepatu 3D dan butiran emas.',
    img: '/images/catalog/prestige/prestige-7.webp',
  },
  {
    id: 'prestige-8',
    name: 'Savanna Floral 3D Couture',
    category: 'Prestige',
    subType: 'Editorial Couture',
    typeBadge: 'Editorial Couture',
    priceRange: 'Rp249.000 – Rp324.470',
    recommendedShape: 'Stiletto - Long',
    description:
      'Perpaduan motif leopard krem, gradasi karamel, bunga pahatan 3D, dan charm cincin emas berstandar high-end salon.',
    img: '/images/catalog/prestige/prestige-8.webp',
  },
];
