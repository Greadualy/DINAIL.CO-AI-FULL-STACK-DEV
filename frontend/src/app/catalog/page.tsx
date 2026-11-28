'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealTitle from '@/components/RevealTitle';
import Skeleton from '@/components/Skeleton';
import {
  MAIN_CATEGORIES,
  CATALOG_DESIGNS,
  type MainCategory,
  type CatalogDesignItem,
} from '@/data/catalogData';

// PAGE COMPONENT

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Semua');
  const [previewItem, setPreviewItem] = useState<CatalogDesignItem | null>(null);
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tierDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => {
      clearTimeout(timer);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
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

  const triggerLoading = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingTimerRef.current = null;
    }, 360);
  };

  const handleCategoryChange = (cat: MainCategory) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    triggerLoading();
  };

  const filteredDesigns = CATALOG_DESIGNS.filter(
    (item) => activeCategory === 'Semua' || item.category === activeCategory
  );

  const buildConsultHref = (item: CatalogDesignItem) =>
    `/profil?design=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category)}#konsultasi`;

  return (
    <main style={{ backgroundColor: '#F3F0EE', minHeight: '100vh', overflowX: 'clip' }}>
      <Navbar />

      {/* 1. HEADER SECTION */}
      <section
        className="catalog-header-section"
        style={{
          paddingTop: 148,
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div className="catalog-header-intro">
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
            KOLEKSI DESAIN DINAIL.CO
          </p>

          {/* Headline (H1) */}
          <RevealTitle
            as="h1"
            text="Eksplorasi Desain Kuku Sesuai Karaktermu."
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#141413',
              maxWidth: 780,
              margin: '0 auto 18px',
            }}
          />

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
          </div>

          {/* 2A. MOBILE TIER DROPDOWN (< 640px) */}
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
                <strong style={{ color: '#141413', fontWeight: 600 }}>{activeCategory}</strong>
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
                  {MAIN_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={`mobile-cat-${cat}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          handleCategoryChange(cat);
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
                        <span>{cat}</span>
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

          {/* 2B. MAIN CATEGORY FILTER TABS (FULL-PILL — >= 640px) */}
          <div
            role="tablist"
            aria-label="Filter Kategori Desain"
            className="hidden sm:flex catalog-filter-tabs scrollbar-hidden"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
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
        </div>
      </section>

      {/* 4. CATALOG GRID SECTION */}
      <section className="catalog-grid-section" style={{ paddingTop: 12, paddingBottom: 112, paddingLeft: 24, paddingRight: 24 }}>
        <div className="max-w-[1280px] mx-auto" style={{ maxWidth: 1280, margin: '0 auto' }}>
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
              Lihat Detail Price List &amp; 9 Shape Kuku
            </Link>
          </div>

          {/* Responsive Cards Grid with Warm Skeleton Loading */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="catalog-skeleton-grid"
                className="catalog-cards-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '20px',
                  alignItems: 'stretch',
                }}
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`cat-skel-${idx}`}
                    className="catalog-skel-card"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '24px',
                      padding: '16px',
                      boxShadow: '0px 12px 32px rgba(20, 20, 19, 0.05)',
                      border: '1px solid #EBE6DF',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Skeleton
                      className="rounded-3xl catalog-skel-img aspect-[4/5]"
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 5',
                        borderRadius: '24px',
                      }}
                    />
                    <div className="catalog-skel-body lg:p-3.5" style={{ padding: '18px 8px 6px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      <Skeleton style={{ width: '78%', height: 18, borderRadius: 8 }} />
                      <Skeleton style={{ width: '58%', height: 14, borderRadius: 8 }} />
                      <Skeleton style={{ width: '66%', height: 22, borderRadius: 999, marginBottom: 4 }} />
                      <Skeleton style={{ width: '100%', height: 38, borderRadius: 999, marginTop: 'auto' }} />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`catalog-grid-${activeCategory}`}
                className="catalog-cards-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '20px',
                  alignItems: 'stretch',
                }}
              >
                {filteredDesigns.map((item, index) => (
              <motion.div
                key={item.id}
                className="catalog-card-motion-wrap"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: Math.min(index, 7) * 0.06,
                }}
                style={{ display: 'flex', height: '100%', minWidth: 0 }}
              >
                <motion.article
                  className="catalog-card"
                  whileHover={{
                    y: -4,
                    boxShadow: '0px 20px 44px rgba(20, 20, 19, 0.09)',
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '32px',
                    padding: '16px',
                    boxShadow: '0px 12px 32px rgba(20, 20, 19, 0.05)',
                    border: '1px solid #EBE6DF',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                  }}
                >
                {/* Image Area (4:5 Portrait Ratio, radius 24px) */}
                <div
                  className="catalog-card-img aspect-[4/5] overflow-hidden"
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
                    aspectRatio: '4 / 5',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    backgroundColor: '#F3F0EE',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.img}
                    alt={`${item.name} — ${item.category} Tier dinail.co`}
                    fill
                    className="object-cover"
                    style={{
                      objectFit: 'cover',
                      objectPosition: item.imagePosition || 'center',
                      transform: item.imageScale ? `scale(${item.imageScale})` : undefined,
                      transition: 'transform 0.4s ease',
                    }}
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 25vw"
                  />

                  {/* Top-Left Badge: Nama Kategori */}
                  <span
                    className="catalog-card-badge-left lg:text-[11px] lg:px-2.5 lg:py-1"
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
                </div>

                {/* Info di Bawah Gambar */}
                <div
                  className="catalog-card-body lg:p-3.5"
                  style={{
                    padding: '18px 8px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  {/* Nama Desain */}
                  <h2
                    className="catalog-card-title lg:text-[16px] font-semibold line-clamp-1"
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
                    className="catalog-card-meta"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 18,
                    }}
                  >
                    <p
                      className="catalog-card-price lg:text-[14px] font-bold"
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
                      className="catalog-card-shape"
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
                      <span className="catalog-card-shape-prefix">Rekomendasi:&nbsp;</span>
                      <strong style={{ fontWeight: 600 }}>{item.recommendedShape}</strong>
                    </div>
                  </div>

                  {/* Full-width Action Button */}
                  <Link
                    href={buildConsultHref(item)}
                    className="btn-secondary catalog-card-cta lg:text-[13px] lg:py-2.5 whitespace-nowrap"
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <span className="cta-label-desktop">Konsultasi Desain</span>
                    <span className="cta-label-mobile">Konsultasi</span>
                  </Link>
                </div>
                </motion.article>
              </motion.div>
            ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Reference Banner — Outline Pill */}
          <div
            className="custom-outline-banner"
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
                PUNYA REFERENSI DESAIN SENDIRI?
              </p>
              <RevealTitle
                as="h2"
                text="Bawa Foto Inspirasimu, Kami Wujudkan Presisi di Jarimu."
                style={{
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#141413',
                  marginBottom: 12,
                }}
              />
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
              maxWidth: 'min(520px, 92vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
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

            <div
              className="aspect-[4/5] overflow-hidden"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 5',
                maxHeight: '56vh',
                overflow: 'hidden',
                backgroundColor: '#F3F0EE',
              }}
            >
              <Image
                src={previewItem.img}
                alt={previewItem.name}
                fill
                className="object-cover"
                style={{
                  objectFit: 'cover',
                  objectPosition: previewItem.imagePosition || 'center',
                  transform: previewItem.imageScale ? `scale(${previewItem.imageScale})` : undefined,
                }}
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
                    color: '#CF4500',
                    backgroundColor: '#FFF5F0',
                    border: '1px solid #F9D5C2',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {previewItem.category} Tier
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
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
