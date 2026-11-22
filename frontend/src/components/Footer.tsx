'use client';

import { useState } from 'react';
import Link from 'next/link';

// OUTLINE SVG ICONS (18px, White) FOR KOLOM 1

function HelpIcon({ type }: { type: 'chat' | 'ruler' | 'pin' | 'faq' }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#FFFFFF',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { display: 'block', flexShrink: 0 },
    'aria-hidden': true,
  };

  switch (type) {
    case 'chat':
      return (
        <svg {...commonProps}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'ruler':
      return (
        <svg {...commonProps}>
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...commonProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'faq':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}

// SOLID WHITE SVG ICONS (18px) FOR BOTTOM BAR

function SocialIcon({ type }: { type: 'instagram' | 'tiktok' | 'shopee' | 'whatsapp' }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: '#FFFFFF',
    style: { display: 'block' },
    'aria-hidden': true,
  };

  switch (type) {
    case 'instagram':
      return (
        <svg {...commonProps}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...commonProps}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'shopee':
      return (
        <svg {...commonProps}>
          <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm3.45 12.14c-.35.87-1.18 1.48-2.29 1.61-.35.04-.71.06-1.08.06-1.35 0-2.55-.46-3.37-1.29a.75.75 0 0 1 1.07-1.05c.55.56 1.38.84 2.3.84.99 0 1.76-.37 1.98-.93.19-.48-.02-.95-.61-1.22-.45-.2-1.03-.34-1.63-.49-1.18-.29-2.51-.62-2.79-1.91-.24-1.11.45-2.31 1.66-2.74.51-.18 1.09-.27 1.69-.27 1.09 0 2.13.34 2.87.98a.75.75 0 1 1-.98 1.13c-.48-.41-1.16-.61-1.89-.61-.89 0-1.76.33-1.88.94-.11.55.44.78 1.55 1.06 1.24.31 2.69.67 2.99 2.02.12.52.04 1.04-.19 1.53z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...commonProps}>
          <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.461 3.484 1.336 5l-1.406 5.141 5.266-1.383a9.923 9.923 0 0 0 4.773 1.219h.004c5.512 0 9.969-4.457 9.969-9.973 0-2.664-1.039-5.168-2.922-7.051A9.91 9.91 0 0 0 12.031 2zm5.82 14.129c-.246.691-1.434 1.324-1.992 1.406-.512.074-1.176.105-1.898-.121-.441-.141-1.008-.328-1.734-.641-3.051-1.316-5.043-4.387-5.195-4.59-.152-.203-1.242-1.652-1.242-3.152s.785-2.238 1.066-2.543c.281-.305.613-.383.816-.383.203 0 .406.004.586.012.188.008.438-.07.688.527.254.609.863 2.105.938 2.258.074.152.125.332.023.535-.102.203-.152.328-.305.508-.152.18-.32.402-.457.539-.152.152-.312.316-.133.621.18.305.797 1.312 1.711 2.129 1.176 1.047 2.168 1.371 2.473 1.523.305.152.484.129.66-.074.18-.203.762-.891.965-1.195.203-.305.406-.254.688-.152.281.102 1.781.84 2.086.992.305.152.508.227.582.355.078.129.078.738-.168 1.43z" />
        </svg>
      );
  }
}

// COLUMN DATA

const HELP_LINKS: Array<{
  label: string;
  href: string;
  icon: 'chat' | 'ruler' | 'pin' | 'faq';
  external?: boolean;
}> = [
    { label: 'Konsultasi via WhatsApp', href: 'https://wa.me/6281234567890', icon: 'chat', external: true },
    { label: 'Panduan Cek Ukuran Kuku', href: '/profil#ukuran', icon: 'ruler' },
    { label: 'Lokasi Studio Yogyakarta', href: '/#lokasi', icon: 'pin' },
    { label: 'Pertanyaan Umum (FAQ)', href: '/pricelist', icon: 'faq' },
  ];

const TEXT_COLUMNS: Array<{
  header: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
}> = [
    {
      header: 'TENTANG DINAIL.CO',
      links: [
        { label: 'Siapa Kami', href: '/#home' },
        { label: 'Proses Pembuatan', href: '/#alur-pemesanan' },
        { label: 'Kualitas & Bahan', href: '/pricelist' },
        { label: 'Cerita Pelanggan', href: '/#testimoni' },
      ],
    },
    {
      header: 'MENU & LAYANAN',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Catalog Desain', href: '/catalog' },
        { label: 'Price List', href: '/pricelist' },
        { label: 'Profil & Konsultasi', href: '/profil' },
      ],
    },
    {
      header: 'MARKETPLACE & KANAL',
      links: [
        { label: 'Shopee Official Store', href: 'https://shopee.co.id/dinail.co', external: true },
        { label: 'Instagram @dinail.co', href: 'https://www.instagram.com/dinail.co/', external: true },
        { label: 'TikTok @dinail.co', href: 'https://www.tiktok.com/@dinail.co_', external: true },
        { label: 'Google Maps Studio', href: 'https://maps.app.goo.gl/d33TahtUiA6qvvMd9', external: true },
      ],
    },
  ];

const SOCIAL_ITEMS: Array<{
  name: string;
  type: 'instagram' | 'tiktok' | 'shopee' | 'whatsapp';
  href: string;
}> = [
    { name: 'Instagram dinail.co', type: 'instagram', href: 'https://www.instagram.com/dinail.co/' },
    { name: 'TikTok dinail.co', type: 'tiktok', href: 'https://www.tiktok.com/@dinail.co_' },
    { name: 'Shopee Official Store dinail.co', type: 'shopee', href: 'https://shopee.co.id/dinail.co' },
    { name: 'WhatsApp dinail.co', type: 'whatsapp', href: 'https://wa.me/62882008903525' },
  ];

// FOOTER COMPONENT

export default function Footer() {
  const [localeOpen, setLocaleOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState('ID (Indonesia)');

  const linkBaseStyle: React.CSSProperties = {
    color: '#FFFFFF',
    fontSize: '13.5px',
    fontWeight: 500,
    lineHeight: 1.4,
    textDecoration: 'none',
    transition: 'opacity 0.2s ease',
  };

  const columnTitleStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#B8B4AE',
    marginBottom: '24px',
  };

  return (
    <footer
      style={{
        backgroundColor: '#141413',
        color: '#FFFFFF',
        paddingTop: 64,
        paddingBottom: 44,
        paddingLeft: 'clamp(24px, 6vw, 96px)',
        paddingRight: 'clamp(24px, 6vw, 96px)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 1. Compact Conversational Headline */}
        <h2
          style={{
            fontSize: '23px',
            fontWeight: 500,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            marginBottom: '48px',
          }}
        >
          Kami selalu siap membantu
          <br />
          perjalanan nail art impianmu.
        </h2>

        {/* 2. 4-Column Navigation Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '40px 32px',
          }}
        >
          {/* Kolom 1: BUTUH BANTUAN? (With 18px White Outline SVG Icons) */}
          <div>
            <p style={columnTitleStyle}>BUTUH BANTUAN?</p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {HELP_LINKS.map((item) => {
                const content = (
                  <>
                    <HelpIcon type={item.icon} />
                    <span>{item.label}</span>
                  </>
                );
                const flexStyle: React.CSSProperties = {
                  ...linkBaseStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                };

                return (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={flexStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.72';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        style={flexStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.72';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Kolom 2, 3, 4 */}
          {TEXT_COLUMNS.map((col) => (
            <div key={col.header}>
              <p style={columnTitleStyle}>{col.header}</p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...linkBaseStyle, display: 'inline-block' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.72';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        style={{ ...linkBaseStyle, display: 'inline-block' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.72';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 3. Crisp Horizontal Divider Line */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            margin: '56px 0 32px',
          }}
        />

        {/* 4. Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Sisi Kiri: Copyright + Dot-Separated Links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '32px',
              color: '#FFFFFF',
              fontSize: '12.5px',
            }}
          >
            <span style={{ fontWeight: 400 }}>© 2026 dinail.co.</span>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Link
                href="/profil"
                style={{ color: '#FFFFFF', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.72';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Kebijakan Privasi
              </Link>
              <span aria-hidden="true" style={{ opacity: 0.7 }}>
                ·
              </span>
              <Link
                href="/pricelist"
                style={{ color: '#FFFFFF', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.72';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Syarat &amp; Ketentuan
              </Link>
              <span aria-hidden="true" style={{ opacity: 0.7 }}>
                ·
              </span>
              <Link
                href="/profil#ukuran"
                style={{ color: '#FFFFFF', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.72';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Panduan Ukuran
              </Link>
              <span aria-hidden="true" style={{ opacity: 0.7 }}>
                ·
              </span>
              <Link
                href="/admin"
                style={{ color: '#F37338', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.75';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Panel Admin
              </Link>
            </div>
          </div>

          {/* Sisi Kanan: Locale Pill Selector + 4 Solid White Social SVG Icons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            {/* Pill Selector Lokasi/Bahasa */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setLocaleOpen((prev) => !prev)}
                aria-expanded={localeOpen}
                aria-label="Pilih lokasi dan bahasa"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  minWidth: '215px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{selectedLocale}</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    display: 'block',
                    transform: localeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {localeOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#222220',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '18px',
                    padding: '6px',
                    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.35)',
                    zIndex: 20,
                  }}
                >
                  {['ID (Indonesia)', 'EN (English)'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedLocale(opt);
                        setLocaleOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor:
                          selectedLocale === opt ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: selectedLocale === opt ? 600 : 400,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Solid White Social SVG Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {SOCIAL_ITEMS.map((social) => (
                <a
                  key={social.type}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.72';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <SocialIcon type={social.type} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
