'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';

const STEPS = [
  {
    num: '01',
    title: 'Login Website',
    desc: 'Masuk ke akun dinail.co untuk memulai sesi konsultasi pribadi dan menyimpan riwayat ukuran kukumu.',
    img: DINAIL_ASSETS.stepImages[1],
    href: '/profil',
  },
  {
    num: '02',
    title: 'Pengecekan Ukuran Kuku via Foto',
    desc: 'Unggah foto jari dan kukumu sesuai panduan di website agar tim kami dapat mengukur size kuku secara akurat.',
    img: DINAIL_ASSETS.stepImages[2],
    href: '/profil#ukuran',
  },
  {
    num: '03',
    title: 'Mengisi Data Diri',
    desc: 'Lengkapi profil dan data diri pemesan untuk pencatatan kartu ukuran dan pengiriman.',
    img: DINAIL_ASSETS.stepImages[3],
    href: '/profil#konsultasi',
  },
  {
    num: '04',
    title: 'Mengisi Form Konsultasi',
    desc: 'Pilih bentuk kuku, panjang, warna, serta unggah referensi desain pada form konsultasi yang tersedia.',
    img: DINAIL_ASSETS.stepImages[4],
    href: '/profil#konsultasi',
  },
  {
    num: '05',
    title: 'Menunggu Konfirmasi Admin',
    desc: 'Admin dinail.co akan memverifikasi ukuran kuku dan detail desainmu, lalu memperbarui status pesanan di akunmu.',
    img: DINAIL_ASSETS.stepImages[5],
    href: '/profil#status-tracker',
  },
  {
    num: '06',
    title: 'ACC & Pemesanan di Shopee',
    desc: 'Jika konsultasi telah di-ACC oleh Admin, tombol checkout khusus akan aktif dan kamu dapat menyelesaikan pemesanan melalui Shopee.',
    img: DINAIL_ASSETS.stepImages[6],
    href: '/profil#status-tracker',
  },
];

// Subtle curved dashed orbital arc between columns in desktop 3-col grid
function RowOrbitalArc({ colInRow }: { colInRow: number }) {
  // colInRow === 0 connects Col 1 -> Col 2 (curves gently downward into staggered middle)
  // colInRow === 1 connects Col 2 -> Col 3 (curves gently upward from staggered middle)
  const isFirstArc = colInRow === 0;
  return (
    <svg
      className="order-orbital-arc"
      viewBox="0 0 120 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: isFirstArc ? '118px' : '96px',
        left: 'calc(50% + 108px)',
        width: '112px',
        height: '72px',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <path
        d={isFirstArc ? 'M 4,24 Q 58,2 114,48' : 'M 4,48 Q 58,68 114,22'}
        fill="none"
        stroke="#F37338"
        strokeWidth="1.25"
        strokeDasharray="6,5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle
        cx={isFirstArc ? '114' : '114'}
        cy={isFirstArc ? '48' : '22'}
        r="3.2"
        fill="#F37338"
      />
    </svg>
  );
}

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const colInRow = index % 3;
  const isMiddleCol = colInRow === 1; // Langkah 02 (index 1) & Langkah 05 (index 4)
  const { openModal } = useRole();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleStepClick = (e: React.MouseEvent) => {
    if (step.num === '01') {
      e.preventDefault();
      openModal();
    }
  };

  return (
    <div
      className={isMiddleCol ? 'order-step-card order-step-middle' : 'order-step-card'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        paddingTop: '48px',
        overflow: 'visible',
      }}
    >
      {/* Orbital arc connector between Col 1 -> Col 2 and Col 2 -> Col 3 on desktop */}
      {colInRow < 2 && <RowOrbitalArc colInRow={colInRow} />}

      {/* 1. Angka Nomor (01 - 06) di Atas Gambar - Muncul utuh dan estetik */}
      <div
        style={{
          position: 'absolute',
          top: '-36px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '64px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: '#DED8D0',
          userSelect: 'none',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {step.num}
      </div>

      {/* 2. Photo Wrapper (190x190) khusus untuk foto & Satellite CTA */}
      <div
        style={{
          position: 'relative',
          width: '190px',
          height: '190px',
          margin: '0 auto 24px',
          flexShrink: 0,
        }}
      >
        {/* Lingkaran Foto Portrait */}
        <Link
          href={step.href}
          onClick={handleStepClick}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0px 24px 48px 0px rgba(0,0,0,0.10)',
            display: 'block',
            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Image
            src={step.img}
            alt={`Langkah ${step.num}: ${step.title}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="190px"
          />
        </Link>

        {/* Satellite CTA Button (->) Menempel di sudut kanan-bawah lingkaran foto */}
        <Link
          href={step.href}
          onClick={handleStepClick}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          aria-label={`Lanjut ke ${step.title}`}
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: isHovered ? '#F37338' : '#FFFFFF',
            boxShadow: isHovered
              ? '0px 8px 20px rgba(243, 115, 56, 0.32)'
              : '0px 6px 16px rgba(20, 20, 19, 0.12)',
            zIndex: 3,
            color: '#141413',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
            cursor: 'pointer',
            transform: isPressed ? 'scale(0.96)' : isHovered ? 'scale(1.06)' : 'scale(1)',
            transition:
              'background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#141413"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: 'block',
              transform: isHovered ? 'translateX(2px)' : 'translateX(0px)',
              transition: 'transform 0.25s ease',
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* 3. Area Teks di Bawah Lingkaran */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 8px',
          zIndex: 1,
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1,
            color: '#141413',
            marginBottom: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          LANGKAH {step.num}
        </p>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#141413',
            lineHeight: 1.3,
            margin: '0 auto 10px',
            whiteSpace: 'normal',
            maxWidth: '260px',
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#696969',
            margin: '0 auto',
            maxWidth: '280px',
            whiteSpace: 'normal',
          }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function OrderSteps() {
  const { openModal } = useRole();

  return (
    <section
      id="alur-pemesanan"
      style={{
        backgroundColor: '#F3F0EE',
        paddingTop: 88,
        paddingBottom: 108,
        paddingLeft: 24,
        paddingRight: 24,
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Section Header */}
        <div
          style={{
            marginBottom: 64,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 640 }}>
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
              TATA CARA PEMESANAN
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#141413',
              }}
            >
              6 Langkah Menuju Kuku Cantik &amp; Presisi
            </h2>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="btn-primary"
            style={{
              padding: '13px 28px',
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Mulai Alur Sekarang</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* 3 Columns x 2 Rows Spacious Grid */}
        <div className="order-steps-grid">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* Responsive Grid & Stagger Rules */}
      <style>{`
        .order-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 56px;
          row-gap: 64px;
          max-width: 1160px;
          margin: 0 auto;
          padding-top: 36px;
          overflow: visible;
        }
        .order-step-middle {
          margin-top: 32px;
        }
        @media (max-width: 960px) {
          .order-steps-grid {
            grid-template-columns: repeat(2, 1fr);
            column-gap: 36px;
            row-gap: 56px;
          }
          .order-step-middle {
            margin-top: 0;
          }
          .order-orbital-arc {
            display: none;
          }
        }
        @media (max-width: 600px) {
          .order-steps-grid {
            grid-template-columns: 1fr;
            row-gap: 48px;
          }
        }
      `}</style>
    </section>
  );
}
