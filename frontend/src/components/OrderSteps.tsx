'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';
import RevealTitle from '@/components/RevealTitle';

const rowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const arcVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      delay: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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
    <motion.svg
      variants={arcVariants}
      className="order-orbital-arc"
      viewBox="0 0 120 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: isFirstArc ? '130px' : '108px',
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
    </motion.svg>
  );
}

function StepCard({ step, colInRow }: { step: typeof STEPS[0]; colInRow: number }) {
  const isMiddleCol = colInRow === 1; // Langkah 02 (col 1) & Langkah 05 (col 1)
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
    <motion.div
      variants={stepVariants}
      className={isMiddleCol ? 'order-step-card order-step-middle' : 'order-step-card'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* Orbital arc connector between Col 1 -> Col 2 and Col 2 -> Col 3 on desktop */}
      {colInRow < 2 && <RowOrbitalArc colInRow={colInRow} />}

      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
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
        }}
      >

      {/* 1. Angka Nomor (01 - 06) dalam Alur Normal di Atas Foto Lingkaran */}
      <div
        style={{
          position: 'relative',
          fontSize: '46px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: '#D8D2CA',
          marginBottom: '14px',
          userSelect: 'none',
          pointerEvents: 'none',
          textAlign: 'center',
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
      </motion.div>
    </motion.div>
  );
}

function MobileStepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const { openModal } = useRole();

  const handleStepClick = (e: React.MouseEvent) => {
    if (step.num === '01') {
      e.preventDefault();
      openModal();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* 1. Angka Nomor */}
      <div
        className="text-[30px] mb-2"
        style={{
          fontSize: '30px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: '#D8D2CA',
          marginBottom: '8px',
          userSelect: 'none',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        {step.num}
      </div>

      {/* 2. Foto Lingkaran + Tombol Panah Bulat */}
      <div
        className="w-[120px] h-[120px]"
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          margin: '0 auto 14px',
          flexShrink: 0,
        }}
      >
        <Link
          href={step.href}
          onClick={handleStepClick}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0px 14px 30px 0px rgba(0,0,0,0.09)',
            display: 'block',
          }}
        >
          <Image
            src={step.img}
            alt={`Langkah ${step.num}: ${step.title}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="120px"
          />
        </Link>

        <Link
          href={step.href}
          onClick={handleStepClick}
          aria-label={`Lanjut ke ${step.title}`}
          className="w-8 h-8"
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 4px 12px rgba(20, 20, 19, 0.14)',
            zIndex: 3,
            color: '#141413',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#141413"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block' }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* 3. Area Teks */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 2px',
          width: '100%',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1,
            color: '#141413',
            marginBottom: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          LANGKAH {step.num}
        </p>

        <h3
          className="text-[14.5px] leading-snug"
          style={{
            fontSize: '14.5px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#141413',
            lineHeight: 1.32,
            margin: '0 auto 6px',
            whiteSpace: 'normal',
            maxWidth: '175px',
          }}
        >
          {step.title}
        </h3>

        <p
          className="text-[12px] leading-relaxed"
          style={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: 1.55,
            color: '#696969',
            margin: '0 auto',
            maxWidth: '175px',
            whiteSpace: 'normal',
          }}
        >
          {step.desc}
        </p>
      </div>
    </motion.div>
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
              TATA CARA PEMESANAN
            </p>
            <RevealTitle
              as="h2"
              text="6 Langkah Menuju Kuku Cantik & Presisi"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#141413',
              }}
            />
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
          </button>
        </div>

        {/* 1. Blok Desktop (>= 1024px) — 100% Utuh 2 Baris x 3 Kolom Staggered + Garis Putus-putus */}
        <div className="hidden lg:block order-steps-desktop-only">
          <div className="order-steps-rows">
            {[STEPS.slice(0, 3), STEPS.slice(3, 6)].map((rowSteps, rowIndex) => (
              <motion.div
                key={`step-row-${rowIndex + 1}`}
                className="order-steps-row"
                variants={rowVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                {rowSteps.map((step, colInRow) => (
                  <StepCard key={step.num} step={step} colInRow={colInRow} />
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. Blok Khusus Mobile & Tablet (< 1024px) — Grid 2 Kolom x 3 Baris Lurus & Rapi */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:hidden order-steps-mobile-grid">
          {STEPS.map((step, index) => (
            <MobileStepCard key={`mobile-step-${step.num}`} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
