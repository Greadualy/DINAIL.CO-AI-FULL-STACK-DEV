'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DINAIL_ASSETS } from '@/constants/assets';

// TYPES & DATA KATALOG RESMI DINAIL.CO

type MainCategory = 'Semua' | 'Basic' | 'Classic' | 'Luxury' | 'Prestige';

interface CatalogDesignItem {
  id: string;
  name: string;
  category: Exclude<MainCategory, 'Semua'>;
  /** Varian atau gaya desain kuku */
  subType: string;
  /** Label badge varian pada card gambar */
  typeBadge: string;
  priceRange: string;
  recommendedShape: string;
  description: string;
  img: string;
}

const MAIN_CATEGORIES: MainCategory[] = [
  'Semua',
  'Basic',
  'Classic',
  'Luxury',
  'Prestige',
];

const CATEGORY_SUBFILTERS: Record<Exclude<MainCategory, 'Semua'>, string[]> = {
  Basic: ['Solid Jelly', 'French Gloss', 'Velvet Cat Eye'],
  Classic: ['Milky French', 'Blush Chrome', 'Tortoiseshell', 'Coquette Ribbon'],
  Luxury: ['Mirror Chrome', 'Velvet Cat Eye', 'Bridal Pearl', 'Floral Crystal'],
  Prestige: ['Glass Aurora', 'Gold Foil Art', 'Royal Bridal', 'Botanical 3D', 'Freestyle Art'],
};

const CATALOG_DESIGNS: CatalogDesignItem[] = [
  // BASIC CATEGORY
  {
    id: 'basic-solid-jelly',
    name: 'Sheer Jelly Rose',
    category: 'Basic',
    subType: 'Solid Jelly',
    typeBadge: 'Solid Jelly',
    priceRange: 'Rp59.999 – Rp75.000',
    recommendedShape: 'Squoval - Short',
    description: 'Warna jelly rose solid dengan top coat kaca ultra-glossy yang rapi dan ringan dipakai.',
    img: DINAIL_ASSETS.priceList.basic,
  },
  {
    id: 'basic-french-gloss',
    name: 'Classic French Gloss',
    category: 'Basic',
    subType: 'French Gloss',
    typeBadge: 'French Gloss',
    priceRange: 'Rp75.000 – Rp95.000',
    recommendedShape: 'Oval - Short',
    description: 'Custom French manicure presisi dengan pilihan warna ujung klasik maupun pastel favoritmu.',
    img: DINAIL_ASSETS.catalogPreviews[0],
  },
  {
    id: 'basic-velvet-cat-eye',
    name: 'Velvet Cat Eye Basic',
    category: 'Basic',
    subType: 'Velvet Cat Eye',
    typeBadge: 'Velvet Cat Eye',
    priceRange: 'Rp95.000 – Rp110.160',
    recommendedShape: 'Almond - Medium',
    description: 'Efek magnetik velvet cat eye lembut yang berkilau halus mengikuti setiap gerakan jari.',
    img: DINAIL_ASSETS.catalogPreviews[3],
  },

  // CLASSIC CATEGORY
  {
    id: 'classic-milky-french',
    name: 'Milky French Pearl',
    category: 'Classic',
    subType: 'Milky French',
    typeBadge: 'Milky French',
    priceRange: 'Rp69.999 – Rp89.000',
    recommendedShape: 'Almond - Short',
    description: 'Perpaduan klasik milky French dengan kilap mutiara halus untuk acara formal maupun kasual.',
    img: DINAIL_ASSETS.priceList.classic,
  },
  {
    id: 'classic-blush-chrome',
    name: 'Blush Chrome Aura',
    category: 'Classic',
    subType: 'Blush Chrome',
    typeBadge: 'Blush Chrome',
    priceRange: 'Rp89.000 – Rp109.000',
    recommendedShape: 'Almond - Medium',
    description: 'Teknik airbrush aura blush dipadukan serbuk mirror chrome tipis yang modern dan glowing.',
    img: DINAIL_ASSETS.catalogPreviews[2],
  },
  {
    id: 'classic-tortoiseshell',
    name: 'Tortoiseshell Glaze',
    category: 'Classic',
    subType: 'Tortoiseshell',
    typeBadge: 'Tortoiseshell',
    priceRange: 'Rp109.000 – Rp124.000',
    recommendedShape: 'Oval - Medium',
    description: 'Motif amber tortoiseshell berlapis gel transparan dengan aksen emas tipis bernuansa hangat.',
    img: DINAIL_ASSETS.catalogPreviews[4],
  },
  {
    id: 'classic-coquette-ribbon',
    name: 'Coquette Ribbon Charm',
    category: 'Classic',
    subType: 'Coquette Ribbon',
    typeBadge: 'Coquette Ribbon',
    priceRange: 'Rp120.000 – Rp134.900',
    recommendedShape: 'Coffin - Medium',
    description: 'Detail pita 3D, pearl mini, dan lukisan tangan halus untuk tampilan coquette paling populer.',
    img: DINAIL_ASSETS.catalogPreviews[5],
  },

  // LUXURY CATEGORY
  {
    id: 'luxury-mirror-chrome',
    name: 'Champagne Mirror Chrome',
    category: 'Luxury',
    subType: 'Mirror Chrome',
    typeBadge: 'Mirror Chrome',
    priceRange: 'Rp89.999 – Rp115.000',
    recommendedShape: 'Almond - Medium',
    description: 'Kilau chrome rose-champagne berkelas dengan lapisan penguat ekstra untuk acara spesial.',
    img: DINAIL_ASSETS.priceList.luxury,
  },
  {
    id: 'luxury-velvet-luxe',
    name: 'Velvet Cat Eye Luxe',
    category: 'Luxury',
    subType: 'Velvet Cat Eye',
    typeBadge: 'Velvet Cat Eye',
    priceRange: 'Rp115.000 – Rp139.000',
    recommendedShape: 'Coffin - Short',
    description: 'Efek cat eye dua dimensi dengan kilau kristal magnetik mendalam dan aksen garis tipis.',
    img: DINAIL_ASSETS.catalogPreviews[3],
  },
  {
    id: 'luxury-bridal-pearl',
    name: 'Bridal 3D Pearl Glow',
    category: 'Luxury',
    subType: 'Bridal Pearl',
    typeBadge: 'Bridal Pearl',
    priceRange: 'Rp139.000 – Rp165.000',
    recommendedShape: 'Almond - Medium',
    description: 'Dirancang khusus untuk pengantin dan lamaran dengan mutiara premium serta kilap satin.',
    img: DINAIL_ASSETS.catalogPreviews[1],
  },
  {
    id: 'luxury-floral-crystal',
    name: 'Bridal 3D Floral Crystal',
    category: 'Luxury',
    subType: 'Floral Crystal',
    typeBadge: 'Floral Crystal',
    priceRange: 'Rp165.000 – Rp184.690',
    recommendedShape: 'Coffin - Medium',
    description: 'Kelopak bunga 3D ukiran tangan berpadu kristal berkilau yang memukau di setiap foto.',
    img: DINAIL_ASSETS.heroNailArt,
  },

  // PRESTIGE CATEGORY
  {
    id: 'prestige-glass-aurora',
    name: 'Sculpted Glass Aurora',
    category: 'Prestige',
    subType: 'Glass Aurora',
    typeBadge: 'Glass Aurora',
    priceRange: 'Rp100.999 – Rp145.000',
    recommendedShape: 'Almond - Medium',
    description: 'Lapisan film aurora prismatik yang memancarkan kilau pelangi lembut seperti kaca kristal.',
    img: DINAIL_ASSETS.priceList.prestige,
  },
  {
    id: 'prestige-gold-foil',
    name: 'Couture Gold Foil Art',
    category: 'Prestige',
    subType: 'Gold Foil Art',
    typeBadge: 'Gold Foil Art',
    priceRange: 'Rp145.000 – Rp189.000',
    recommendedShape: 'Coffin - Medium',
    description: 'Komposisi gold leaf couture, marble gel berlapis, dan finishing tekstur emboss eksklusif.',
    img: DINAIL_ASSETS.catalogPreviews[4],
  },
  {
    id: 'prestige-royal-bridal',
    name: 'Royal Bridal Encapsulated',
    category: 'Prestige',
    subType: 'Royal Bridal',
    typeBadge: 'Royal Bridal',
    priceRange: 'Rp189.000 – Rp239.000',
    recommendedShape: 'Stiletto - Long',
    description: 'Teknik encapsulated glitter, mutiara barok, dan detail ornamen mewah berpresisi tinggi.',
    img: DINAIL_ASSETS.catalogPreviews[1],
  },
  {
    id: 'prestige-botanical-3d',
    name: 'Handpainted Botanical 3D',
    category: 'Prestige',
    subType: 'Botanical 3D',
    typeBadge: 'Botanical 3D',
    priceRange: 'Rp239.000 – Rp289.000',
    recommendedShape: 'Square - Extra Long',
    description: 'Karya lukis tangan mikro-detail dengan elemen pahatan 3D khusus kolektor nail art.',
    img: DINAIL_ASSETS.catalogPreviews[5],
  },
  {
    id: 'prestige-freestyle',
    name: 'Signature Artist Freestyle',
    category: 'Prestige',
    subType: 'Freestyle Art',
    typeBadge: 'Freestyle Art',
    priceRange: 'Rp265.000 – Rp324.470',
    recommendedShape: 'Stiletto - Long',
    description: 'Desain one-of-a-kind hasil kolaborasi penuh bersama lead nail artist dinail.co sesuai moodboard-mu.',
    img: DINAIL_ASSETS.catalogPreviews[2],
  },
];

// PAGE COMPONENT

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Semua');
  const [activeSubType, setActiveSubType] = useState<string>('Semua');
  const [previewItem, setPreviewItem] = useState<CatalogDesignItem | null>(null);

  const handleCategoryChange = (cat: MainCategory) => {
    setActiveCategory(cat);
    setActiveSubType('Semua');
  };

  const currentSubFilters =
    activeCategory === 'Semua' ? [] : CATEGORY_SUBFILTERS[activeCategory];

  const filteredDesigns = CATALOG_DESIGNS.filter((item) => {
    const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSubType = activeSubType === 'Semua' || item.subType === activeSubType;
    return matchCategory && matchSubType;
  });

  const buildConsultHref = (item: CatalogDesignItem) =>
    `/profil?design=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category)}&type=${encodeURIComponent(item.subType)}#konsultasi`;

  return (
    <main style={{ backgroundColor: '#F3F0EE', minHeight: '100vh' }}>
      <Navbar />

      {/* 1. HEADER SECTION */}
      <section
        style={{
          paddingTop: 148,
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow Label */}
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#141413',
              marginBottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#F37338',
                flexShrink: 0,
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
            KOLEKSI DESAIN DINAIL.CO
          </p>

          {/* Headline (H1) */}
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#141413',
              maxWidth: 780,
              margin: '0 auto 18px',
            }}
          >
            Eksplorasi Desain Kuku Sesuai Karaktermu.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 1.55,
              color: '#141413',
              maxWidth: 620,
              margin: '0 auto 40px',
            }}
          >
            Pilih inspirasi desain favorit dari 4 kategori tier kustom dinail.co, atau ajukan referensi desain kustom impianmu saat sesi konsultasi.
          </p>

          {/* 2. MAIN CATEGORY FILTER TABS (FULL-PILL) */}
          <div
            role="tablist"
            aria-label="Filter Kategori Desain"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {MAIN_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    borderRadius: '999px',
                    padding: '10px 28px',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? '#141413' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#141413',
                    border: isActive ? '1.5px solid #141413' : '1.5px solid #E2DFDA',
                    cursor: 'pointer',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isActive
                      ? '0px 8px 20px rgba(20, 20, 19, 0.14)'
                      : '0px 2px 8px rgba(20, 20, 19, 0.03)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 3. SUB-FILTER CHIPS BERDASARKAN TIPE / KODE DESAIN */}
          {activeCategory !== 'Semua' && (
            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: '1px solid #E5DFD7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#696969',
                }}
              >
                PILIH VARIAN DESAIN ({activeCategory.toUpperCase()})
              </span>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {['Semua', ...currentSubFilters].map((sub) => {
                  const isSubActive = activeSubType === sub;
                  const label = sub === 'Semua' ? 'Semua Varian' : sub;

                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setActiveSubType(sub)}
                      style={{
                        borderRadius: '999px',
                        padding: '7px 18px',
                        fontSize: '13px',
                        fontWeight: isSubActive ? 600 : 500,
                        backgroundColor: isSubActive ? '#F37338' : '#FCFBFA',
                        color: isSubActive ? '#FFFFFF' : '#141413',
                        border: isSubActive ? '1.5px solid #F37338' : '1px solid #DDD7CE',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. CATALOG GRID SECTION */}
      <section style={{ paddingTop: 12, paddingBottom: 112, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Result Summary Strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 14, color: '#696969', fontWeight: 500 }}>
              Menampilkan{' '}
              <strong style={{ color: '#141413', fontWeight: 600 }}>
                {filteredDesigns.length} desain
              </strong>
              {activeCategory !== 'Semua' && (
                <>
                  {' '}
                  pada kategori{' '}
                  <strong style={{ color: '#141413', fontWeight: 600 }}>{activeCategory}</strong>
                </>
              )}
              {activeSubType !== 'Semua' && (
                <>
                  {' '}
                  ·{' '}
                  <strong style={{ color: '#CF4500', fontWeight: 600 }}>
                    {activeSubType}
                  </strong>
                </>
              )}
            </p>

            <Link
              href="/pricelist"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#141413',
                textDecoration: 'none',
                borderBottom: '1.5px solid #F37338',
                paddingBottom: 2,
              }}
            >
              Lihat Detail Price List &amp; 9 Shape Kuku &rarr;
            </Link>
          </div>

          {/* Responsive Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '28px',
              alignItems: 'stretch',
            }}
          >
            {filteredDesigns.map((item) => (
              <article
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '32px',
                  padding: '16px',
                  boxShadow: '0px 12px 32px rgba(20, 20, 19, 0.05)',
                  border: '1px solid #EBE6DF',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0px 20px 44px rgba(20, 20, 19, 0.09)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0px 12px 32px rgba(20, 20, 19, 0.05)';
                }}
              >
                {/* Image Area (1:1 Ratio, radius 24px) */}
                <div
                  onClick={() => setPreviewItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewItem(item);
                    }
                  }}
                  aria-label={`Lihat pratinjau ${item.name}`}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    backgroundColor: '#F3F0EE',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.img}
                    alt={`${item.name} — ${item.category} ${item.typeBadge}`}
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 300px"
                  />

                  {/* Top-Left Badge: Nama Kategori */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(8px)',
                      color: '#141413',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '999px',
                      letterSpacing: '0.02em',
                      boxShadow: '0px 4px 12px rgba(20, 20, 19, 0.08)',
                    }}
                  >
                    {item.category}
                  </span>

                  {/* Top-Right Badge: Varian Desain */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor:
                        item.subType === 'Freestyle Art'
                          ? '#F37338'
                          : 'rgba(20, 20, 19, 0.86)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: '999px',
                      letterSpacing: '0.02em',
                      boxShadow: '0px 4px 12px rgba(20, 20, 19, 0.12)',
                    }}
                  >
                    {item.typeBadge}
                  </span>
                </div>

                {/* Info di Bawah Gambar */}
                <div
                  style={{
                    padding: '18px 8px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  {/* Nama Desain */}
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.25,
                      color: '#141413',
                      marginBottom: 8,
                    }}
                  >
                    {item.name}
                  </h2>

                  {/* Estimasi Harga & Bentuk Kuku Rekomendasi */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 18,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#141413',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.priceRange}
                    </p>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        width: 'fit-content',
                        backgroundColor: '#F3F0EE',
                        borderRadius: '999px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#262627',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#F37338',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      Rekomendasi: <strong style={{ fontWeight: 600 }}>{item.recommendedShape}</strong>
                    </div>
                  </div>

                  {/* Full-width Action Button */}
                  <Link
                    href={buildConsultHref(item)}
                    className="btn-secondary"
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <span>Gunakan Desain Ini untuk Konsultasi</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Custom Reference Banner — Outline Pill */}
          <div
            style={{
              marginTop: 64,
              backgroundColor: 'transparent',
              border: '1.5px solid rgba(243, 115, 56, 0.4)',
              borderRadius: '100px',
              padding: 'clamp(32px, 4.5vw, 48px) clamp(28px, 5.5vw, 64px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 28,
              color: '#141413',
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  color: '#141413',
                  marginBottom: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#F37338',
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                PUNYA REFERENSI DESAIN SENDIRI?
              </p>
              <h2
                style={{
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#141413',
                  marginBottom: 12,
                }}
              >
                Bawa Foto Inspirasimu, Kami Wujudkan Presisi di Jarimu.
              </h2>
              <p style={{ fontSize: 15, fontWeight: 400, color: '#141413', lineHeight: 1.55 }}>
                Unggah gambar dari Pinterest atau sketsa kustommu di halaman konsultasi. Tim nail artist dinail.co akan merekomendasikan tier &amp; shape terbaik untukmu.
              </p>
            </div>

            <Link
              href="/profil#konsultasi"
              className="btn-secondary"
              style={{
                padding: '14px 30px',
                fontSize: '14px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <span>Ajukan Desain Kustom</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK PREVIEW MODAL */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 20, 19, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '36px',
              maxWidth: 520,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0px 28px 64px rgba(0, 0, 0, 0.24)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              aria-label="Tutup pratinjau"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: '#141413',
                fontSize: 20,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
              }}
            >
              ×
            </button>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', backgroundColor: '#F3F0EE' }}>
              <Image
                src={previewItem.img}
                alt={previewItem.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="520px"
              />
            </div>

            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#141413',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#F37338',
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  {previewItem.category}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#141413',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '999px',
                  }}
                >
                  {previewItem.typeBadge}
                </span>
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#141413', marginBottom: 8 }}>
                {previewItem.name}
              </h3>
              <p style={{ fontSize: 14, color: '#696969', lineHeight: 1.6, marginBottom: 16 }}>
                {previewItem.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  backgroundColor: '#F3F0EE',
                  borderRadius: '20px',
                  padding: '12px 16px',
                  marginBottom: 20,
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: 11, color: '#696969', fontWeight: 600 }}>
                    ESTIMASI HARGA
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#141413' }}>
                    {previewItem.priceRange}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: 11, color: '#696969', fontWeight: 600 }}>
                    SHAPE REKOMENDASI
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#CF4500' }}>
                    {previewItem.recommendedShape}
                  </span>
                </div>
              </div>

              <Link
                href={buildConsultHref(previewItem)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <span>Gunakan Desain Ini untuk Konsultasi</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
