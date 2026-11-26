'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealTitle from '@/components/RevealTitle';
import Skeleton from '@/components/Skeleton';
import { DINAIL_ASSETS } from '@/constants/assets';

// DATA TIER HARGA RESMI SHOPEE DINAIL.CO

interface TierPackage {
  id: string;
  tier: string;
  fullName: string;
  img: string;
  priceFrom: number;
  priceTo: number;
  priceFromNormal?: number;
  priceToNormal?: number;
  discount?: number;
  shipping: string;
  tags: string[];
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
    tier: 'Custom Premium — Basic',
    fullName: 'CUSTOM PRESS ON NAILS PREMIUM BASIC by dinail.co',
    img: DINAIL_ASSETS.priceList.basic,
    priceFrom: 59999,
    priceTo: 110160,
    priceFromNormal: 59999,
    priceToNormal: 152999,
    discount: 28,
    shipping: 'Pengerjaan cepat — Reguler',
    tags: ['Handmade', 'Customable', 'Reusable'],
    rating: 5.0,
    reviewCount: 73,
    favorites: 234,
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-BASIC-by-dinail.co-i.902120451.29425085360?extraParams=%7B%22display_model_id%22%3A224729258638%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-82251-mjmid453g2kn42',
  },
  {
    id: 'classic',
    tier: 'Custom Premium — Classic',
    fullName: 'CUSTOM PRESS ON NAILS PREMIUM CLASSIC by dinail.co',
    img: DINAIL_ASSETS.priceList.classic,
    priceFrom: 69999,
    priceTo: 134900,
    priceFromNormal: 69999,
    priceToNormal: 189999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 10 hari',
    tags: ['Handmade', 'Customable', 'Reusable'],
    rating: 5.0,
    reviewCount: 452,
    favorites: 902,
    highlight: true,
    badge: 'MOST POPULAR',
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-CLASSIC-by-dinail.co-i.902120451.26175085711?extraParams=%7B%22display_model_id%22%3A272342011760%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-8224y-mjmid453hh53ef',
  },
  {
    id: 'luxury',
    tier: 'Custom Premium — Luxury',
    fullName: 'CUSTOM PRESS ON NAILS PREMIUM LUXURY by dinail.co',
    img: DINAIL_ASSETS.priceList.luxury,
    priceFrom: 89999,
    priceTo: 184690,
    priceFromNormal: 89999,
    priceToNormal: 252999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 13 hari',
    tags: ['Handmade', 'Customable', 'Reusable'],
    rating: 5.0,
    reviewCount: 333,
    favorites: 769,
    shopeeUrl: 'https://shopee.co.id/CUSTOM-PRESS-ON-NAILS-PREMIUM-LUXURY-by-dinail.co-i.902120451.28925095054?extraParams=%7B%22display_model_id%22%3A330447110589%2C%22model_selection_logic%22%3A3%7D&image_ids=id-11134207-8224o-mjmid453eo0712',
  },
  {
    id: 'prestige',
    tier: 'Custom Premium — Prestige',
    fullName: 'CUSTOM PRESS ON NAILS PREMIUM PRESTIGE by dinail.co',
    img: DINAIL_ASSETS.priceList.prestige,
    priceFrom: 100999,
    priceTo: 324470,
    priceFromNormal: 100999,
    priceToNormal: 456999,
    discount: 29,
    shipping: 'Pre-Order · dikirim dalam 15 hari',
    tags: ['Handmade', 'Customable', 'Reusable'],
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
  const isHighlight = pkg.highlight;

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
        className="pricelist-card"
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
        className="pricelist-card-img"
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
          alt={pkg.fullName}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 48vw, (max-width: 1200px) 50vw, 400px"
        />
        {/* Overlay gradient bawah untuk legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 55%, rgba(20,20,19,0.28) 100%)',
          }}
        />
        {/* Tier badge di dalam gambar */}
        <div
          className="pricelist-tier-badge"
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#141413',
            letterSpacing: '0.03em',
          }}
        >
          {pkg.tier}
        </div>
      </div>

      {/* Card Body */}
      <div className="pricelist-card-body" style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>

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
          className="pricelist-card-title"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#141413',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            marginBottom: 16,
          }}
        >
          {pkg.fullName}
        </h3>

        {/* Tags */}
        <div className="pricelist-tags-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {pkg.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#141413',
                backgroundColor: '#F3F0EE',
                border: '1px solid #DED8D0',
                borderRadius: 999,
                padding: '3px 10px',
                letterSpacing: '0.03em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price Block — Flat Typography (No Box / No Border) */}
        <div
          className="pricelist-price-block"
          style={{
            margin: '6px 0 22px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              className="pricelist-price-main"
              style={{
                fontSize: 'clamp(21px, 2.2vw, 25px)',
                fontWeight: 700,
                color: '#141413',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
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

          {/* Harga normal dicoret tanpa pembatas atau sekat box */}
          {pkg.priceToNormal && pkg.priceToNormal !== pkg.priceTo && (
            <p className="pricelist-price-normal" style={{ fontSize: 12.5, color: '#969696', fontWeight: 400, margin: 0, lineHeight: 1.4 }}>
              <span className="pricelist-price-normal-prefix">Harga normal:{' '}</span>
              <span style={{ textDecoration: 'line-through', color: '#A09B95' }}>
                {formatRupiah(pkg.priceFromNormal ?? pkg.priceFrom)} – {formatRupiah(pkg.priceToNormal)}
              </span>
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
            marginBottom: 24,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#696969" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <p style={{ fontSize: 12, color: '#696969', lineHeight: 1.5 }}>{pkg.shipping}</p>
        </div>

        {/* CTA Buttons — push to bottom */}
        <div className="pricelist-cta-group" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href="/profil#konsultasi"
            className="btn-primary pricelist-cta-btn"
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span className="cta-label-desktop">Konsultasi Paket Ini →</span>
            <span className="cta-label-mobile">Konsultasi →</span>
          </Link>
          <a
            href={pkg.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary pricelist-cta-btn"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span className="cta-label-desktop">Lihat di Shopee ↗</span>
            <span className="cta-label-mobile">Shopee ↗</span>
          </a>
        </div>
      </div>
      </motion.article>
    </motion.div>
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
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: '#F37338',
                flexShrink: 0,
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
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
          className="shape-guide-grid grid-cols-3 gap-2.5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
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
            href="/profil#konsultasi"
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
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// PAGE

export default function PriceListPage() {
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tierDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(e.target as Node)) {
        setIsTierDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  const filters = ['Semua', 'Basic', 'Classic', 'Luxury', 'Prestige'];

  const filteredPackages = TIER_PACKAGES.filter((pkg) => {
    if (activeFilter === 'Semua') return true;
    return pkg.id === activeFilter.toLowerCase();
  });

  return (
    <main style={{ backgroundColor: '#F3F0EE', minHeight: '100vh', overflowX: 'clip' }}>
      <Navbar />

      {/* HEADER SECTION */}
      <section
        className="pricelist-header-section"
        style={{
          paddingTop: 148,
          paddingBottom: 56,
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
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: '#F37338',
                flexShrink: 0,
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
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
              margin: '0 auto 18px',
            }}
          />

          {/* Subheadline */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: '#141413',
              maxWidth: 580,
              margin: '0 auto 40px',
              lineHeight: 1.55,
            }}
          >
            Seluruh paket dinail.co adalah <strong style={{ color: '#141413', fontWeight: 600 }}>handmade</strong>, <strong style={{ color: '#141413', fontWeight: 600 }}>customable</strong>, dan <strong style={{ color: '#141413', fontWeight: 600 }}>reusable</strong> — dikerjakan dengan ukuran presisi sesuai kuku kamu.
          </p>

          {/* Rating Summary Badge */}
          <div
            className="pricelist-rating-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E2DA',
              borderRadius: 999,
              padding: '10px 22px',
              marginBottom: 40,
              boxShadow: '0px 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: '#F37338' }}>★ 5.0</span>
            <span style={{ width: 1, height: 18, backgroundColor: '#E8E2DA' }} />
            <span style={{ fontSize: 13, color: '#696969' }}>900+ Penilaian Terverifikasi di Shopee</span>
            <span style={{ width: 1, height: 18, backgroundColor: '#E8E2DA' }} />
            <span style={{ fontSize: 13, color: '#141413', fontWeight: 600 }}>2.326 Favorit</span>
          </div>
          </div>

          {/* Mobile Tier Dropdown (< 640px) */}
          <div ref={tierDropdownRef} className="block sm:hidden mobile-tier-dropdown-wrap">
            <button
              type="button"
              onClick={() => setIsTierDropdownOpen((prev) => !prev)}
              aria-expanded={isTierDropdownOpen}
              aria-haspopup="listbox"
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E0DA',
                borderRadius: 999,
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: 500,
                color: '#141413',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0px 2px 10px rgba(20, 20, 19, 0.04)',
              }}
            >
              <span>
                <span style={{ color: '#6B6B6B', fontWeight: 400 }}>Kategori Tier: </span>
                <strong style={{ color: '#141413', fontWeight: 600 }}>{activeFilter}</strong>
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#141413"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transform: isTierDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <AnimatePresence>
              {isTierDropdownOpen && (
                <motion.div
                  role="listbox"
                  aria-label="Pilih Kategori Tier"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E0DA',
                    borderRadius: 18,
                    padding: 6,
                    boxShadow: '0px 14px 32px rgba(20, 20, 19, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {filters.map((f) => {
                    const isActive = activeFilter === f;
                    return (
                      <button
                        key={`mobile-tier-${f}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setActiveFilter(f);
                          setIsTierDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: 'none',
                          backgroundColor: isActive ? '#FAF7F5' : 'transparent',
                          color: isActive ? '#F37338' : '#141413',
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>{f}</span>
                        {isActive && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: '#F37338',
                            }}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Pill Bar (>= 640px) */}
          <div
            className="hidden sm:flex catalog-filter-tabs scrollbar-hidden"
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {filters.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 999,
                    border: isActive ? '1.5px solid #141413' : '1px solid #D1CDC7',
                    backgroundColor: isActive ? '#141413' : '#FFFFFF',
                    color: isActive ? '#F3F0EE' : '#141413',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER CARDS GRID */}
      <section
        className="pricelist-grid-section"
        style={{
          paddingBottom: 72,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="pricelist-skeleton-grid"
                className="pricelist-cards-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 28,
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
                    <div className="pricelist-skel-body" style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Skeleton style={{ width: 52, height: 12, borderRadius: 6 }} />
                        <Skeleton style={{ width: 72, height: 12, borderRadius: 6 }} />
                      </div>
                      <Skeleton style={{ width: '88%', height: 16, borderRadius: 8 }} />
                      <div className="pricelist-skel-tags" style={{ display: 'flex', gap: 6 }}>
                        <Skeleton style={{ width: 72, height: 22, borderRadius: 999 }} />
                        <Skeleton style={{ width: 82, height: 22, borderRadius: 999 }} />
                        <Skeleton style={{ width: 68, height: 22, borderRadius: 999 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <Skeleton style={{ width: '74%', height: 22, borderRadius: 8 }} />
                      </div>
                      <Skeleton style={{ width: '60%', height: 12, borderRadius: 6 }} />
                      <div className="pricelist-cta-group" style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Skeleton style={{ width: '100%', height: 36, borderRadius: 999 }} />
                        <Skeleton style={{ width: '100%', height: 34, borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`pricelist-grid-${activeFilter}`}
                className="pricelist-cards-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 28,
                  alignItems: 'stretch',
                }}
              >
                {filteredPackages.map((pkg, index) => (
                  <TierCard key={pkg.id} pkg={pkg} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {filteredPackages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#696969' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1CDC7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p style={{ fontSize: 16 }}>Tidak ada paket yang cocok dengan filter ini.</p>
            </div>
          )}
        </div>
      </section>

      {/*SHAPE & LENGTH GUIDE*/}
      <ShapeGuideSection />

      <Footer />
    </main>
  );
}
