'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

const SHAPE_OPTIONS = [
  { label: 'Almond', length: 'Short' },
  { label: 'Almond', length: 'Medium' },
  { label: 'Oval', length: 'Short' },
  { label: 'Oval', length: 'Medium' },
  { label: 'Coffin', length: 'Short' },
  { label: 'Coffin', length: 'Medium' },
  { label: 'Stiletto', length: 'Long' },
  { label: 'Square', length: 'Extra Long' },
  { label: 'Squoval', length: 'Short' },
];

// HELPERS

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

// TIER CARD COMPONENT

function TierCard({ pkg }: { pkg: TierPackage }) {
  const isHighlight = pkg.highlight;

  return (
    <article
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
      }}
    >
      {/* Badge MOST POPULAR */}
      {isHighlight && pkg.badge && (
        <div
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
          ★ {pkg.badge}
        </div>
      )}

      {/* Cover Image — 1:1 ratio */}
      <div
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
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 400px"
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
      <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>

        {/* Stats Row */}
        <div
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
            <span style={{ fontSize: 12, color: '#696969' }}>
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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
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
          style={{
            margin: '6px 0 22px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
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
            <p style={{ fontSize: 12.5, color: '#969696', fontWeight: 400, margin: 0, lineHeight: 1.4 }}>
              Harga normal:{' '}
              <span style={{ textDecoration: 'line-through', color: '#A09B95' }}>
                {formatRupiah(pkg.priceFromNormal ?? pkg.priceFrom)} – {formatRupiah(pkg.priceToNormal)}
              </span>
            </p>
          )}
        </div>

        {/* Shipping Info */}
        <div
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
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href="/profil#konsultasi"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Konsultasi Paket Ini</span>
            <span aria-hidden="true">→</span>
          </Link>
          <a
            href={pkg.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Lihat di Shopee ↗</span>
          </a>
        </div>
      </div>
    </article>
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
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#141413',
              lineHeight: 1.05,
              marginBottom: 14,
            }}
          >
            9 Pilihan Shape &amp; Length
          </h2>
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {SHAPE_OPTIONS.map((s, i) => {
            const bg = shapeColors[s.label] ?? '#F3F0EE';
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E2DA',
                  borderRadius: 24,
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Shape icon placeholder */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#141413" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3h10a2 2 0 0 1 2 2v10a7 7 0 0 1-14 0V5a2 2 0 0 1 2-2z" />
                    <line x1="12" y1="3" x2="12" y2="9" />
                  </svg>
                </div>
                <div>
                  <p
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
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div
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

  const filters = ['Semua', 'Basic', 'Classic', 'Luxury', 'Prestige'];

  const filteredPackages = TIER_PACKAGES.filter((pkg) => {
    if (activeFilter === 'Semua') return true;
    return pkg.id === activeFilter.toLowerCase();
  });

  return (
    <main style={{ backgroundColor: '#F3F0EE', minHeight: '100vh' }}>
      <Navbar />

      {/* HEADER SECTION */}
      <section
        style={{
          paddingTop: 148,
          paddingBottom: 56,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
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
          <h1
            style={{
              fontSize: 'clamp(30px, 5vw, 54px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#141413',
              lineHeight: 1.05,
              maxWidth: 780,
              margin: '0 auto 18px',
            }}
          >
            Transparansi Harga untuk Setiap Detail Seni Kuku.
          </h1>

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

          {/* Filter Pill Bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
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
        style={{
          paddingBottom: 72,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 28,
              alignItems: 'stretch',
            }}
          >
            {filteredPackages.map((pkg) => (
              <TierCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

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
