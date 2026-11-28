'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealTitle from '@/components/RevealTitle';
import Skeleton from '@/components/Skeleton';
import { DINAIL_ASSETS } from '@/constants/assets';
import { useRole } from '@/context/RoleContext';

// DATA TIER HARGA RESMI SHOPEE DINAIL.CO

interface TierPackage {
  id: string;
  fullName: string;
  img: string;
  priceFrom: number;
  priceTo: number;
  priceFromNormal?: number;
  priceToNormal?: number;
  discount?: number;
  shipping: string;
  rating: number;
  reviewCount?: number;
  favorites: number;
  highlight?: boolean;
  badge?: string;
  shopeeUrl: string;
}

const TIER_PACKAGES: TierPackage[] = [
  {
    id: 'basic',
    fullName: 'Basic Tier',
    img: DINAIL_ASSETS.priceList.basic,
    priceFrom: 59999,
    priceTo: 110160,
    priceFromNormal: 59999,
    priceToNormal: 152999,
    discount: 28,
    shipping: 'Pengerjaan cepat — Reguler',
    rating: 5.0,
    reviewCount: 73,
    favorites: 234,
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-BASIC-by-dinail.co-i.902120451.29425085360?extraParams=%7B%22display_model_id%22%3A224729258638%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-82251-mjmid453g2kn42',
  },
  {
    id: 'classic',
    fullName: 'Classic Tier',
    img: DINAIL_ASSETS.priceList.classic,
    priceFrom: 69999,
    priceTo: 134900,
    priceFromNormal: 69999,
    priceToNormal: 189999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 10 hari',
    rating: 5.0,
    reviewCount: 452,
    favorites: 902,
    highlight: true,
    badge: 'MOST POPULAR',
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-CLASSIC-by-dinail.co-i.902120451.26175085711?extraParams=%7B%22display_model_id%22%3A272342011760%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-8224y-mjmid453hh53ef',
  },
  {
    id: 'luxury',
    fullName: 'Luxury Tier',
    img: DINAIL_ASSETS.priceList.luxury,
    priceFrom: 89999,
    priceTo: 184690,
    priceFromNormal: 89999,
    priceToNormal: 252999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 13 hari',
    rating: 5.0,
    reviewCount: 333,
    favorites: 769,
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-LUXURY-by-dinail.co-i.902120451.28925095054?extraParams=%7B%22display_model_id%22%3A330447110589%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-8224o-mjmid453eo0712',
  },
  {
    id: 'prestige',
    fullName: 'Prestige Tier',
    img: DINAIL_ASSETS.priceList.prestige,
    priceFrom: 100999,
    priceTo: 324470,
    priceFromNormal: 100999,
    priceToNormal: 456999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 15 hari',
    rating: 5.0,
    reviewCount: 45,
    favorites: 400,
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-PRESTIGE-by-dinail.co-i.902120451.29125084671?extraParams=%7B%22display_model_id%22%3A400449355761%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-8224v-mjmid453agave6',
  },
];

type NailShapeKey = keyof typeof DINAIL_ASSETS.nailShapes;

interface ShapeOptionItem {
  key: NailShapeKey;
  label: string;
  length: string;
}

const SHAPE_OPTIONS: ShapeOptionItem[] = [
  { key: 'almondShort', label: 'Almond', length: 'Short' },
  { key: 'almondMedium', label: 'Almond', length: 'Medium' },
  { key: 'ovalShort', label: 'Oval', length: 'Short' },
  { key: 'ovalMedium', label: 'Oval', length: 'Medium' },
  { key: 'coffinShort', label: 'Coffin', length: 'Short' },
  { key: 'coffinMedium', label: 'Coffin', length: 'Medium' },
  { key: 'stilettoLong', label: 'Stiletto', length: 'Long' },
  { key: 'squareExtraLong', label: 'Square', length: 'Extra Long' },
  { key: 'squovalShort', label: 'Squoval', length: 'Short' },
];

const NAIL_SHAPE_SVG_PATHS: Record<NailShapeKey, { outline: string; lunula: string }> = {
  // Almond - Short (y: 38 -> 18)
  almondShort: {
    outline: 'M 9 35 C 9 27 12.5 21 18 18 C 23.5 21 27 27 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Almond - Medium (y: 38 -> 11)
  almondMedium: {
    outline: 'M 9 35 C 9 24 12.5 15.5 18 11 C 23.5 15.5 27 24 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Oval - Short (y: 38 -> 18)
  ovalShort: {
    outline: 'M 9 35 L 9 26 C 9 20.5 13 18 18 18 C 23 18 27 20.5 27 26 L 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Oval - Medium (y: 38 -> 11)
  ovalMedium: {
    outline: 'M 9 35 L 9 20 C 9 13.8 13 11 18 11 C 23 11 27 13.8 27 20 L 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Coffin - Short (y: 38 -> 18, trapezoid flat tip)
  coffinShort: {
    outline: 'M 9 35 L 12.5 18 L 23.5 18 L 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Coffin - Medium (y: 38 -> 11, trapezoid flat tip)
  coffinMedium: {
    outline: 'M 9 35 L 13 11 L 23 11 L 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Stiletto - Long (y: 38 -> 6, sharp pointed tip)
  stilettoLong: {
    outline: 'M 9 35 C 9.2 25 13 14 18 6 C 23 14 26.8 25 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
  // Square - Extra Long (y: 40 -> 4, straight parallel sides & crisp flat top)
  squareExtraLong: {
    outline: 'M 9.5 37 L 9.5 4 L 26.5 4 L 26.5 37 Q 26.5 40 18 40 Q 9.5 40 9.5 37 Z',
    lunula: 'M 12.5 37.5 Q 18 34.5 23.5 37.5',
  },
  // Squoval - Short (y: 38 -> 18, parallel sides & softly rounded top corners)
  squovalShort: {
    outline: 'M 9 35 L 9 21.5 Q 9 18 12.5 18 L 23.5 18 Q 27 18 27 21.5 L 27 35 Q 27 38 18 38 Q 9 38 9 35 Z',
    lunula: 'M 12.5 35.5 Q 18 32.5 23.5 35.5',
  },
};

function NailShapeIcon({ shape }: { shape: ShapeOptionItem }) {
  const webpSrc = DINAIL_ASSETS.nailShapes[shape.key];
  const [imgFailed, setImgFailed] = useState(false);
  const paths = NAIL_SHAPE_SVG_PATHS[shape.key];

  if (webpSrc && !imgFailed) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
        <Image
          src={webpSrc}
          alt={`Bentuk kuku ${shape.label} ${shape.length}`}
          fill
          sizes="48px"
          style={{ objectFit: 'contain' }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <svg
      width="26"
      height="32"
      viewBox="0 0 36 44"
      fill="none"
      stroke="#141413"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths.outline} />
      <path d={paths.lunula} opacity="0.35" />
    </svg>
  );
}

// HELPERS

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

// TIER CARD COMPONENT

function TierCard({ pkg, index }: { pkg: TierPackage; index: number }) {
  const { currentUser, openModal } = useRole();
  const isHighlight = pkg.highlight;
  const consultHref = `/profil?tab=konsultasi&design=${encodeURIComponent(pkg.fullName)}`;

  const handleConsultClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      openModal({ redirectAfterLogin: consultHref });
    }
  };

  return (
    <motion.div
      className="pricelist-card-motion-wrap"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      style={{ display: 'flex', height: '100%', minWidth: 0 }}
    >
      <motion.article
        className="pricelist-card flex flex-col justify-between h-full"
        whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 32,
          border: isHighlight ? '2px solid #F37338' : '1px solid #E8E2DA',
          boxShadow: isHighlight
            ? '0px 32px 64px 0px rgba(243,115,56,0.10), 0px 8px 24px rgba(0,0,0,0.06)'
            : '0px 8px 32px 0px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
      >
      {/* Badge Diskon Compact di Pojok Gambar (Khusus Mobile < 640px) */}
      {pkg.discount && (
        <span className="pricelist-mobile-discount-badge">-{pkg.discount}%</span>
      )}

      {/* Badge MOST POPULAR */}
      {isHighlight && pkg.badge && (
        <div
          className="pricelist-popular-badge"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: '#F37338',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.07em',
            padding: '5px 14px',
            borderRadius: 999,
            zIndex: 2,
          }}
        >
          <span className="popular-label-desktop">★ {pkg.badge}</span>
          <span className="popular-label-mobile">POPULAR</span>
        </div>
      )}

      {/* Cover Image — 1:1 ratio */}
      <div
        className="pricelist-card-img aspect-square w-full"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Image
          src={pkg.img}
          alt={`${pkg.fullName} — Custom Press On Nails dinail.co`}
          fill
          className="object-cover"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 48vw, 25vw"
        />
      </div>

      {/* Card Body */}
      <div className="pricelist-card-body lg:p-4 flex flex-col justify-between flex-1" style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 0 }}>
        <div style={{ minWidth: 0 }}>
        {/* Stats Row */}
        <div
          className="pricelist-stats-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#141413', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#F37338' }}>★</span>
            <span>{pkg.rating.toFixed(1)}</span>
          </span>
          {pkg.reviewCount && (
            <span className="pricelist-review-count" style={{ fontSize: 12, color: '#696969' }}>
              ({pkg.reviewCount.toLocaleString('id-ID')} Penilaian)
            </span>
          )}
          <span
            style={{
              fontSize: 12,
              color: '#CF4500',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#CF4500" stroke="#CF4500" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{pkg.favorites.toLocaleString('id-ID')} Favorit</span>
          </span>
        </div>

        {/* Product Name */}
        <h3
          className="pricelist-card-title lg:text-[18px]"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#141413',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          {pkg.fullName}
        </h3>

        {/* Price Block — Flat Typography (No Box / No Border) */}
        <div
          className="pricelist-price-block"
          style={{
            margin: '0 0 18px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              className="pricelist-price-main lg:text-[16px] font-bold"
              style={{
                fontSize: 'clamp(18px, 2vw, 22px)',
                fontWeight: 700,
                color: '#141413',
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
              }}
            >
              {formatRupiah(pkg.priceFrom)} – {formatRupiah(pkg.priceTo)}
            </span>
            {pkg.discount && (
              <span
                className="pricelist-inline-discount"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: '#F37338',
                  borderRadius: 999,
                  padding: '3px 10px',
                  letterSpacing: '0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  lineHeight: 1,
                }}
              >
                -{pkg.discount}%
              </span>
            )}
          </div>

          {/* Harga normal dicoret ringkas */}
          {pkg.priceToNormal && pkg.priceToNormal !== pkg.priceTo && (
            <p
              className="pricelist-price-normal text-[11px] text-[#71717A]"
              style={{
                fontSize: 11,
                color: '#71717A',
                fontWeight: 400,
                margin: 0,
                lineHeight: 1.4,
                textDecoration: 'line-through',
              }}
            >
              {formatRupiah(pkg.priceFromNormal ?? pkg.priceFrom)} – {formatRupiah(pkg.priceToNormal)}
            </p>
          )}
        </div>

        {/* Shipping Info */}
        <div
          className="pricelist-shipping-row"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 22,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#696969" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <p className="lg:text-[12px]" style={{ fontSize: 12, color: '#696969', lineHeight: 1.5 }}>{pkg.shipping}</p>
        </div>
        </div>

        {/* CTA Buttons — push to bottom */}
        <div className="pricelist-cta-group mt-auto" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href={consultHref}
            onClick={handleConsultClick}
            className="btn-primary pricelist-cta-btn w-full lg:text-[13px] lg:py-2.5"
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span className="cta-label-desktop">Konsultasi Paket Ini</span>
            <span className="cta-label-mobile">Konsultasi</span>
          </Link>
          <a
            href={pkg.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary pricelist-cta-btn w-full lg:text-[13px] lg:py-2.5"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span className="cta-label-desktop">Lihat di Shopee</span>
            <span className="cta-label-mobile">Shopee</span>
          </a>
        </div>
      </div>
      </motion.article>
    </motion.div>
  );
}

// SERIES DETAILS & COMPLIMENTARY TOOL KIT SECTION

interface SeriesDetail {
  id: 'basic' | 'classic' | 'luxury' | 'prestige';
  tabLabel: string;
  title: string;
  tierTag: string;
  description: ReactNode;
  highlights: string[];
  toolKitItems: string[];
}

const SERIES_DETAILS: SeriesDetail[] = [
  {
    id: 'basic',
    tabLabel: 'Basic',
    title: 'Basic Custom Premium Series',
    tierTag: 'Basic Tier',
    description: (
      <>
        Dirancang untuk tampilan simpel, bersih, dan <em>timeless</em> dengan warna polos serta gratis 2 <em>easy art</em>. Dibuat <em>handmade</em> secara kustom menggunakan gel berkualitas sehingga terasa ringan, halus, nyaman, dan <em>polished</em> untuk pemakaian sehari-hari. Dapat digunakan kembali (<em>reusable</em>) dengan kualitas setara salon dari rumah.
      </>
    ),
    highlights: ['Warna Polos + Gratis 2 Easy Art', 'Handmade Gel Ringan', 'Reusable & Nyaman Harian'],
    toolKitItems: [
      '24 pcs Lem stiker',
      '12 pcs Lem stiker premium',
      '1 pcs Buffer',
      '1 pcs Pendorong kutikula',
      'Thank you card',
      'Sticker eksklusif',
      'Instruction card',
    ],
  },
  {
    id: 'classic',
    tabLabel: 'Classic',
    title: 'Classic Custom Premium Series',
    tierTag: 'Classic Tier',
    description: (
      <>
        Menghadirkan karakter klasik yang elegan dan berkelas dengan pilihan desain <em>cat eye</em>, <em>air brush</em>, <em>chrome</em>, serta <em>easy</em> hingga <em>very hard art</em> yang dapat dipadukan dengan aksesori. Diproduksi <em>handmade</em> dari gel berkualitas dengan detail rapi, proporsi seimbang, <em>timeless</em>, dan <em>reusable</em> untuk harian maupun momen spesial.
      </>
    ),
    highlights: ['Cat Eye, Air Brush & Chrome', 'Easy hingga Very Hard Art', 'Termasuk Kotak Akrilik Eksklusif'],
    toolKitItems: [
      '24 pcs Lem stiker',
      '12 pcs Lem stiker premium',
      '1 pcs Buffer',
      '1 pcs Pendorong kutikula',
      'Kotak akrilik eksklusif',
      'Thank you card',
      'Sticker eksklusif',
      'Guide card perawatan & pemakaian',
    ],
  },
  {
    id: 'luxury',
    tabLabel: 'Luxury',
    title: 'Luxury Custom Premium Series',
    tierTag: 'Luxury Tier',
    description: (
      <>
        Menawarkan pengalaman kustom premium yang elegan, <em>elevated</em>, dan <em>refined</em> secara <em>personalized</em>. Mencakup pilihan <em>cat eye</em>, <em>air brush</em>, <em>chrome</em>, <em>french</em>, <em>ombre</em>, hingga <em>hard art</em> dengan aksesori terkurasi. Dibuat <em>handmade</em> menggunakan gel berkualitas tinggi dengan struktur kuku kokoh namun ringan, <em>reusable</em>, dan ideal untuk acara formal maupun momen istimewa.
      </>
    ),
    highlights: ['French, Ombre & Hard Art', 'Aksesori Terkurasi & Kokoh', 'Loyalty Card + Mystery Gift'],
    toolKitItems: [
      '24 pcs Lem stiker',
      '12 pcs Lem stiker premium',
      '1 pcs Buffer',
      '1 pcs Pendorong kutikula',
      'Kotak akrilik eksklusif',
      'Thank you card',
      'Loyalty card',
      'Sticker eksklusif',
      'Guide card perawatan & pemakaian',
      'Special mystery gift',
    ],
  },
  {
    id: 'prestige',
    tabLabel: 'Prestige',
    title: 'Prestige Custom Premium Series',
    tierTag: 'Prestige Tier',
    description: (
      <>
        Tier tertinggi yang <em>ultra-personalized</em>, <em>bold</em>, dan <em>one of a kind</em>. Mencakup eksplorasi desain tanpa batas termasuk <em>advanced 3D design</em>, <em>complex charm arrangement</em>, <em>picture print on nails</em>, <em>freestyle</em>, hingga <em>mixed media art</em>. Diproduksi <em>fully handmade</em> dengan standar <em>artisan-level</em> dan material premium pilihan untuk detail ekstrem dan <em>finishing</em> setara salon <em>high-end</em> yang tetap <em>reusable</em>.
      </>
    ),
    highlights: ['Advanced 3D & Complex Charm', 'Picture Print & Mixed Media', 'Artisan-Level High-End Finish'],
    toolKitItems: [
      '24 pcs Lem stiker',
      '12 pcs Lem stiker premium',
      '1 pcs Buffer',
      '1 pcs Pendorong kutikula',
      'Kotak akrilik eksklusif',
      'Thank you card',
      'Loyalty card',
      'Sticker eksklusif',
      'Guide card perawatan & pemakaian',
      'Special mystery gift',
    ],
  },
];

function SeriesDetailsSection() {
  const [activeSeriesId, setActiveSeriesId] = useState<SeriesDetail['id']>('basic');
  const activeSeries =
    SERIES_DETAILS.find((item) => item.id === activeSeriesId) ?? SERIES_DETAILS[0];

  return (
    <section
      id="detail-series"
      className="series-details-section my-14 sm:my-20"
      style={{
        backgroundColor: '#F3F0EE',
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#141413',
              marginBottom: 14,
            }}
          >
            DETAIL SERIES &amp; KELENGKAPAN
          </p>
          <RevealTitle
            as="h2"
            text="Kenali Perbedaan Setiap Series"
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#141413',
              lineHeight: 1.08,
              margin: '0 auto',
            }}
          />
        </div>

        {/* 4 Pill Tabs */}
        <div
          role="tablist"
          aria-label="Pilihan Series dinail.co"
          className="series-tabs-bar grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-2.5"
          style={{
            marginBottom: 28,
          }}
        >
          {SERIES_DETAILS.map((series) => {
            const isActive = series.id === activeSeriesId;
            return (
              <button
                key={series.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSeriesId(series.id)}
                className="series-tab-pill"
                style={{
                  backgroundColor: isActive ? '#141413' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#141413',
                  border: isActive ? '1px solid #141413' : '1px solid #EAE6E1',
                  borderRadius: 9999,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  transition:
                    'background-color 0.22s ease, color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
                  boxShadow: isActive
                    ? '0px 8px 20px rgba(20, 20, 19, 0.14)'
                    : '0px 2px 6px rgba(20, 20, 19, 0.03)',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                }}
              >
                {series.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Main White Detail Card */}
        <div
          className="series-detail-card bg-white border border-[#EAE6E1] rounded-3xl p-6 sm:p-8 max-w-[1040px] mx-auto"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE6E1',
            borderRadius: 24,
            maxWidth: 1040,
            margin: '0 auto',
            boxShadow: '0px 8px 32px 0px rgba(20, 20, 19, 0.04)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeries.id}
              role="tabpanel"
              aria-label={activeSeries.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="series-detail-grid grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10"
            >
              {/* Kolom Kiri (lg:col-span-7): Deskripsi Series */}
              <div
                className="series-detail-left lg:col-span-7"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 'fit-content',
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#CF4500',
                    backgroundColor: '#FFF5F0',
                    border: '1px solid #F9D5C2',
                    borderRadius: 9999,
                    padding: '4px 12px',
                    marginBottom: 14,
                  }}
                >
                  {activeSeries.tierTag}
                </span>

                <h3
                  style={{
                    fontSize: 'clamp(22px, 2.8vw, 28px)',
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    color: '#141413',
                    marginBottom: 16,
                  }}
                >
                  {activeSeries.title}
                </h3>

                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    lineHeight: 1.75,
                    color: '#3F3E3C',
                    marginBottom: 22,
                  }}
                >
                  {activeSeries.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    paddingTop: 18,
                    borderTop: '1px solid #F0ECE7',
                  }}
                >
                  {activeSeries.highlights.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#262627',
                        backgroundColor: '#F3F0EE',
                        borderRadius: 9999,
                        padding: '6px 13px',
                        lineHeight: 1.2,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Kolom Kanan (lg:col-span-5): Complimentary Tool Kit & Exclusive Packaging */}
              <div
                className="series-toolkit-box lg:col-span-5 bg-[#FAF9F7] border border-[#EAE6E1] rounded-2xl p-5"
                style={{
                  backgroundColor: '#FAF9F7',
                  border: '1px solid #EAE6E1',
                  borderRadius: 16,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                    color: '#141413',
                    marginBottom: 14,
                    paddingBottom: 12,
                    borderBottom: '1px solid #EAE6E1',
                  }}
                >
                  Complimentary Nail Application Tool Kit &amp; Exclusive Packaging
                </p>

                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 9,
                  }}
                >
                  {activeSeries.toolKitItems.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 13.5,
                        lineHeight: 1.45,
                        color: '#262627',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F37338"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: 2 }}
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// SHAPE GUIDE COMPONENT

function ShapeGuideSection() {
  const shapeColors: Record<string, string> = {
    Almond: '#F9E8DC',
    Oval: '#E8F0F9',
    Coffin: '#EAE8F9',
    Stiletto: '#F9E8EE',
    Square: '#E8F9EE',
    Squoval: '#F9F5E8',
  };
  const { currentUser, openModal } = useRole();

  const handleShapeConsultClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      openModal({ redirectAfterLogin: '/profil?tab=konsultasi' });
    }
  };

  return (
    <section
      className="shape-guide-section"
      style={{
        backgroundColor: '#FCFBFA',
        paddingTop: 80,
        paddingBottom: 96,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
            PANDUAN BENTUK &amp; PANJANG KUKU
          </p>
          <RevealTitle
            as="h2"
            text="9 Pilihan Shape & Length"
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#141413',
              lineHeight: 1.05,
              marginBottom: 14,
            }}
          />
          <p
            style={{
              fontSize: 15,
              color: '#696969',
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Tersedia di semua paket Custom. Pilih bentuk dan panjang kuku yang paling sesuai sebelum mengisi form konsultasi.
          </p>
        </div>

        {/* Shape Grid */}
        <div
          className="shape-guide-grid grid grid-cols-1 sm:grid-cols-2 lg:grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 max-w-[960px] mx-auto"
          style={{
            maxWidth: 960,
            margin: '0 auto',
          }}
        >
          {SHAPE_OPTIONS.map((s, i) => {
            const bg = shapeColors[s.label] ?? '#F3F0EE';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
                style={{ display: 'flex', height: '100%', minWidth: 0 }}
              >
                <motion.div
                  className="shape-guide-card"
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E2DA',
                    borderRadius: 24,
                    padding: '22px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'default',
                    width: '100%',
                  }}
                >
                {/* Hybrid Nail Shape Icon (.webp utama + 9 SVG kustom fallback) */}
                <div
                  className="shape-guide-icon"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  <NailShapeIcon shape={s} />
                </div>
                <div className="shape-guide-text" style={{ minWidth: 0 }}>
                  <p
                    className="shape-guide-label"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#141413',
                      letterSpacing: '-0.01em',
                      marginBottom: 2,
                    }}
                  >
                    {s.label}
                  </p>
                  <span
                    className="shape-guide-length"
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#CF4500',
                      backgroundColor: '#FFF1EB',
                      border: '1px solid #F9D5C2',
                      borderRadius: 999,
                      padding: '2px 10px',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {s.length}
                  </span>
                </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div
          className="custom-outline-banner"
          style={{
            marginTop: 40,
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
          <div>
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
              INFO BENTUK KUKU
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: '#141413',
                lineHeight: 1.55,
                maxWidth: 580,
              }}
            >
              Semua pilihan Shape &amp; Length di atas tersedia untuk paket Basic, Classic, Luxury, dan Prestige. Konsultasikan dengan tim kami untuk rekomendasi terbaik sesuai bentuk jarimu.
            </p>
          </div>
          <Link
            href="/profil?tab=konsultasi"
            onClick={handleShapeConsultClick}
            className="btn-secondary"
            style={{
              padding: '14px 30px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              flexShrink: 0,
            }}
          >
            <span>Mulai Konsultasi</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// PAGE

export default function PriceListPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ backgroundColor: '#F3F0EE', minHeight: '100vh', overflowX: 'clip' }}>
      <Navbar />

      {/* HEADER SECTION */}
      <section
        className="pricelist-header-section"
        style={{
          paddingTop: 128,
          paddingBottom: 0,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <div className="pricelist-header-intro">
            {/* Eyebrow */}
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
              PRICE LIST &amp; TIER KUSTOMISASI
            </p>

            {/* Headline */}
            <RevealTitle
              as="h1"
              text="Transparansi Harga untuk Setiap Detail Seni Kuku."
              style={{
                fontSize: 'clamp(30px, 5vw, 54px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                color: '#141413',
                lineHeight: 1.05,
                maxWidth: 780,
                margin: '0 auto 16px',
              }}
            />

            {/* Subheadline */}
            <p
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: '#141413',
                maxWidth: 580,
                margin: '0 auto',
                lineHeight: 1.55,
              }}
            >
              Seluruh paket dinail.co adalah <strong style={{ color: '#141413', fontWeight: 600 }}>handmade</strong>, <strong style={{ color: '#141413', fontWeight: 600 }}>customable</strong>, dan <strong style={{ color: '#141413', fontWeight: 600 }}>reusable</strong> — dikerjakan dengan ukuran presisi sesuai kuku kamu.
            </p>
          </div>
        </div>
      </section>

      {/* TIER CARDS GRID */}
      <section
        className="pricelist-grid-section"
        style={{
          paddingTop: 0,
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div
          className="pricelist-grid-wrap max-w-[1280px] mx-auto mt-6 sm:mt-8 lg:mt-10"
          style={{ maxWidth: 1280, margin: '40px auto 0' }}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="pricelist-skeleton-grid"
                className="pricelist-cards-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 20,
                  alignItems: 'stretch',
                }}
              >
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`tier-skel-${idx}`}
                    className="pricelist-skel-card"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 32,
                      border: '1px solid #E8E2DA',
                      boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      height: '100%',
                    }}
                  >
                    <Skeleton
                      className="pricelist-skel-img"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '28px 28px 0 0',
                      }}
                    />
                    <div className="pricelist-skel-body lg:p-4" style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Skeleton style={{ width: 52, height: 12, borderRadius: 6 }} />
                        <Skeleton style={{ width: 72, height: 12, borderRadius: 6 }} />
                      </div>
                      <Skeleton style={{ width: '58%', height: 18, borderRadius: 8 }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <Skeleton style={{ width: '74%', height: 20, borderRadius: 8 }} />
                      </div>
                      <Skeleton style={{ width: '54%', height: 11, borderRadius: 6 }} />
                      <Skeleton style={{ width: '68%', height: 12, borderRadius: 6 }} />
                      <div className="pricelist-cta-group" style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Skeleton style={{ width: '100%', height: 36, borderRadius: 999 }} />
                        <Skeleton style={{ width: '100%', height: 34, borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="pricelist-grid"
                className="pricelist-cards-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 20,
                  alignItems: 'stretch',
                }}
              >
                {TIER_PACKAGES.map((pkg, index) => (
                  <TierCard key={pkg.id} pkg={pkg} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* DETAIL & KELENGKAPAN SERIES */}
      <SeriesDetailsSection />

      {/*SHAPE & LENGTH GUIDE*/}
      <ShapeGuideSection />

      <Footer />
    </main>
  );
}
