'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';
import RevealTitle from '@/components/RevealTitle';

export default function HeroSection() {
  const { currentUser, openModal } = useRole();
  const router = useRouter();

  const handleConsultationClick = () => {
    if (currentUser) {
      router.push('/profil?tab=konsultasi');
    } else {
      openModal({ redirectAfterLogin: '/profil?tab=konsultasi' });
    }
  };

  return (
    <section
      id="home"
      className="hero-section"
      style={{
        backgroundColor: '#F3F0EE',
        paddingTop: 'clamp(120px, 11vw, 150px)',
        paddingBottom: 'clamp(60px, 7vw, 90px)',
        paddingLeft: 24,
        paddingRight: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mobile-only Background Layer (< 1024px) */}
      <div className="hero-mobile-bg" aria-hidden="true">
        <Image
          src={DINAIL_ASSETS.heroNailArt}
          alt=""
          fill
          preload
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '75% center', zIndex: 0 }}
        />
        <div className="hero-mobile-bg-overlay" />
      </div>

      <div className="hero-split-container" style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Left Column: Text & CTA Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
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
            DINAIL.CO ARTISTRY
          </p>

          {/* Headline */}
          <RevealTitle
            as="h1"
            className="hero-headline"
            text="Karya Nail Art Presisi yang Didesain Khusus untuk Jari Kamu."
            style={{
              fontSize: 'clamp(34px, 4.4vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#141413',
              marginBottom: 20,
              maxWidth: 580,
            }}
          />

          {/* Description */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 1.55,
              color: '#141413',
              maxWidth: 520,
              marginBottom: 36,
            }}
          >
            Mulai dari pengecekan ukuran kuku lewat foto hingga konsultasi desain impian sebelum memesan dengan aman di Shopee.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleConsultationClick}
              className="btn-primary"
              style={{
                padding: '13px 30px',
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              <span>Mulai Konsultasi</span>
            </button>
            <Link
              href="/catalog"
              className="btn-secondary hero-btn-secondary"
              style={{
                padding: '12px 28px',
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              <span>Lihat Catalog</span>
            </Link>
            <Link
              href="/pricelist"
              style={{
                color: '#141413',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '12px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Daftar Harga</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Seamless Gradient-Blended Nail Art Image */}
        <div className="hero-image-blend">
          <Image
            src={DINAIL_ASSETS.heroNailArt}
            alt="Showcase karya nail art dinail.co"
            fill
            style={{ objectFit: 'cover', objectPosition: '82% center' }}
            preload
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
