'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import RevealTitle from '@/components/RevealTitle';

interface FeaturedWorkItem {
  id: string;
  tier: string;
  title: string;
  img: string;
}

const FEATURED_WORKS: FeaturedWorkItem[] = [
  {
    id: 'classic-champagne-cat-eye',
    tier: 'Classic Tier',
    title: 'Champagne Cat Eye Floral',
    img: '/images/catalog/classic/classic-4.webp',
  },
  {
    id: 'luxury-burgundy-sakura',
    tier: 'Luxury Tier',
    title: 'Burgundy 3D Sakura Bloom',
    img: '/images/catalog/luxury/luxury-15.webp',
  },
  {
    id: 'prestige-savanna-couture',
    tier: 'Prestige Tier',
    title: 'Savanna Floral 3D Couture',
    img: '/images/catalog/prestige/prestige-8.webp',
  },
  {
    id: 'classic-espresso-starburst',
    tier: 'Classic Tier',
    title: 'Espresso Starburst Aura',
    img: '/images/catalog/classic/classic-9.webp',
  },
];

const CINEMATIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SLIDE_TRANSITION = {
  duration: 0.75,
  ease: CINEMATIC_EASE,
};

const SIDE_SCALE = 0.62;
const SIDE_Y = 10;
const DESKTOP_STEP_PCT = 86;
const AUTOPLAY_INTERVAL_MS = 4500;

interface SlideExitContext {
  direction: number;
  isMobile: boolean;
}

const slideExitVariants = {
  exit: ({ direction: exitDir, isMobile: mobile }: SlideExitContext) => ({
    x: mobile
      ? exitDir > 0
        ? '-105%'
        : '105%'
      : `${(exitDir > 0 ? -2 : 2) * DESKTOP_STEP_PCT}%`,
    scale: SIDE_SCALE,
    y: SIDE_Y + 4,
    opacity: 0,
    transition: SLIDE_TRANSITION,
  }),
};

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getExpandRatio(scrollProgress: number): number {
  // Starts pure circle when the image enters viewport (0.15) and reaches full pill at center (0.92)
  return clamp01((scrollProgress - 0.15) / 0.77);
}

function getSidePeekAlpha(scrollProgress: number): number {
  // Side peek cards smoothly fade in near full pill (0.68 -> 0.95) and fade out on scroll-up
  return clamp01((scrollProgress - 0.68) / 0.27);
}

interface SlidePillApertureProps {
  item: FeaturedWorkItem;
  slotVirtualIndex: number;
  isActive: boolean;
  circleStartPct: number;
  smoothProgress: MotionValue<number>;
}

/**
 * Dedicated scroll-scrubbed aperture per slide.
 * Always keeps MotionValues permanently bound to DOM style so real-time scrub
 * works smoothly in both directions (scroll down & scroll up) even while auto-sliding.
 */
function SlidePillAperture({
  item,
  slotVirtualIndex,
  isActive,
  circleStartPct,
  smoothProgress,
}: SlidePillApertureProps) {
  const initialProgress = smoothProgress.get();
  const initialWidth = isActive
    ? `${circleStartPct + (100 - circleStartPct) * getExpandRatio(initialProgress)}%`
    : '100%';
  const initialOpacity = isActive ? 1 : getSidePeekAlpha(initialProgress);

  const pillWidth = useMotionValue<string>(initialWidth);
  const apertureOpacity = useMotionValue<number>(initialOpacity);

  useEffect(() => {
    const syncInstant = (p: number) => {
      if (isActive) {
        const expand = getExpandRatio(p);
        const pct = circleStartPct + (100 - circleStartPct) * expand;
        pillWidth.set(`${pct}%`);
        apertureOpacity.set(1);
      } else {
        pillWidth.set('100%');
        apertureOpacity.set(getSidePeekAlpha(p));
      }
    };

    // Smoothly reconcile when a slide transitions between center <-> side while partially scrolled
    const currentP = smoothProgress.get();
    if (isActive) {
      const targetPct = circleStartPct + (100 - circleStartPct) * getExpandRatio(currentP);
      pillWidth.set(`${targetPct}%`);
      const opacityCtrl = animate(apertureOpacity, 1, {
        duration: 0.35,
        ease: CINEMATIC_EASE,
      });
      const unsubscribe = smoothProgress.on('change', (p) => {
        opacityCtrl.stop();
        syncInstant(p);
      });
      return () => {
        opacityCtrl.stop();
        unsubscribe();
      };
    } else {
      pillWidth.set('100%');
      const targetPeekAlpha = getSidePeekAlpha(currentP);
      const opacityCtrl = animate(apertureOpacity, targetPeekAlpha, {
        duration: 0.4,
        ease: CINEMATIC_EASE,
      });
      const unsubscribe = smoothProgress.on('change', (p) => {
        opacityCtrl.stop();
        syncInstant(p);
      });
      return () => {
        opacityCtrl.stop();
        unsubscribe();
      };
    }
  }, [isActive, circleStartPct, smoothProgress, pillWidth, apertureOpacity]);

  return (
    <motion.div
      className="featured-main-pill rounded-full"
      style={{
        position: 'relative',
        width: pillWidth,
        height: '100%',
        borderRadius: 9999,
        overflow: 'hidden',
        backgroundColor: '#E8E2DA',
        opacity: apertureOpacity,
        boxShadow: isActive
          ? '0px 26px 52px -14px rgba(20, 20, 19, 0.16), 0px 10px 20px -8px rgba(20, 20, 19, 0.08)'
          : '0px 14px 28px -10px rgba(20, 20, 19, 0.09)',
        willChange: 'width, opacity',
      }}
    >
      {/* Full-Width Photo Canvas (Stays Steady as Circle Expands/Contracts) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100cqi',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <Image
          src={item.img}
          alt={`${item.title} — ${item.tier} dinail.co`}
          fill
          priority={slotVirtualIndex === 0}
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 74vw, 920px"
          style={{ objectFit: 'cover', pointerEvents: 'none' }}
        />
      </div>

      {/* Clean Full-Card Link to /catalog (Active Slide Only, No Text Overlay) */}
      {isActive && (
        <Link
          href="/catalog"
          aria-label={`Lihat koleksi ${item.title} di halaman Catalog`}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            display: 'block',
            textDecoration: 'none',
          }}
        />
      )}
    </motion.div>
  );
}

export default function FeaturedWorksCarousel() {
  const total = FEATURED_WORKS.length;

  // Unbounded virtual index guarantees true infinite looping with continuous slide identities
  const [[virtualIndex, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const activeRealIndex = mod(virtualIndex, total);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Real-time bidirectional scroll-linked progress (0 at "start end" <-> 1 at "center center")
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // 16:9 circle width = 9/16 = 56.25%; 16:10 mobile circle width = 10/16 = 62.5%
  const circleStartPct = isMobile ? 62.5 : 56.25;

  // Orange outline circle on the right: fades out (1 -> 0) on scroll down, reappears (0 -> 1) on scroll up
  const orangeRingOpacity = useTransform(smoothProgress, [0, 0.72, 0.93], [1, 0.85, 0]);

  const paginate = useCallback((step: number) => {
    if (step === 0) return;
    setSlide(([prev]) => [prev + step, step > 0 ? 1 : -1]);
  }, []);

  const jumpToIndex = useCallback(
    (targetIdx: number) => {
      setSlide(([prev]) => {
        const currentIdx = mod(prev, total);
        if (targetIdx === currentIdx) return [prev, 1];

        const forwardDiff = mod(targetIdx - currentIdx, total);
        const backwardDiff = mod(currentIdx - targetIdx, total);

        if (forwardDiff <= backwardDiff) {
          return [prev + forwardDiff, 1];
        }
        return [prev - backwardDiff, -1];
      });
    },
    [total]
  );

  // Continuous uninterrupted auto-slide every 4500ms (resets cadence cleanly on manual slide clicks)
  useEffect(() => {
    const timer = window.setInterval(() => {
      paginate(1);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [virtualIndex, paginate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) >= 42) {
      paginate(deltaX < 0 ? 1 : -1);
    }
  };

  const visibleOffsets = isMobile ? [0] : [-1, 0, 1];

  return (
    <section
      ref={sectionRef}
      id="karya-unggulan"
      className="featured-works-section"
      style={{
        backgroundColor: '#F3F0EE',
        paddingTop: 40,
        paddingBottom: 96,
        position: 'relative',
        overflowX: 'clip',
      }}
    >
      {/* Header + Top-Right Navigation Controls */}
      <div
        className="featured-works-header"
        style={{
          margin: '0 auto 28px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
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
              marginBottom: 12,
            }}
          >
            KARYA UNGGULAN
          </p>
          <RevealTitle
            as="h2"
            text="Desain Pilihan yang Paling Dicari."
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: '#141413',
              margin: 0,
            }}
          />
        </div>

        {/* Navigation Arrows (← →) di Pojok Kanan Atas Carousel */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Karya unggulan sebelumnya"
            className="featured-nav-btn w-10 h-10 rounded-full border border-[#141413]/30 flex items-center justify-center hover:bg-[#F37338] hover:border-[#F37338] hover:text-white transition-colors duration-200"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(20, 20, 19, 0.3)',
              backgroundColor: 'transparent',
              color: '#141413',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition:
                'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.18s ease',
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Karya unggulan berikutnya"
            className="featured-nav-btn w-10 h-10 rounded-full border border-[#141413]/30 flex items-center justify-center hover:bg-[#F37338] hover:border-[#F37338] hover:text-white transition-colors duration-200"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(20, 20, 19, 0.3)',
              backgroundColor: 'transparent',
              color: '#141413',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition:
                'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.18s ease',
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editorial Infinite Pill Carousel Stage (Real-Time Scroll-Scrubbed Circle <-> Pill) */}
      <div
        className="featured-works-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: 8,
          paddingBottom: 38,
        }}
      >
        {/* Center Frame Sizer + Stationary Thin Orange Outline Circle on Right */}
        <div
          className="featured-card-frame"
          style={{
            position: 'relative',
            margin: '0 auto',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <motion.div
            className="border border-[#F37338]/70 rounded-full aspect-square"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 9999,
              border: '1.5px solid rgba(243, 115, 56, 0.7)',
              opacity: orangeRingOpacity,
              zIndex: 1,
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Animated Infinite Track */}
        <AnimatePresence initial={false} custom={{ direction, isMobile }}>
          {visibleOffsets.map((offset) => {
            const slotVirtualIndex = virtualIndex + offset;
            const item = FEATURED_WORKS[mod(slotVirtualIndex, total)];
            const isActive = offset === 0;

            const targetX = isMobile ? '0%' : `${offset * DESKTOP_STEP_PCT}%`;
            const targetScale = isActive ? 1 : SIDE_SCALE;
            const targetY = isActive ? 0 : SIDE_Y;
            const targetOpacity = isActive ? 1 : 0.72;

            const initialState = isMobile
              ? {
                  x: direction > 0 ? '105%' : '-105%',
                  scale: SIDE_SCALE,
                  y: SIDE_Y,
                  opacity: 0,
                }
              : offset === 0
                ? {
                    x: direction > 0 ? `${DESKTOP_STEP_PCT}%` : `-${DESKTOP_STEP_PCT}%`,
                    scale: SIDE_SCALE,
                    y: SIDE_Y,
                    opacity: 0,
                  }
                : {
                    x: `${(offset > 0 ? 2 : -2) * DESKTOP_STEP_PCT}%`,
                    scale: SIDE_SCALE,
                    y: SIDE_Y + 4,
                    opacity: 0,
                  };

            return (
              <motion.div
                key={slotVirtualIndex}
                custom={{ direction, isMobile }}
                variants={slideExitVariants}
                initial={initialState}
                animate={{
                  x: targetX,
                  scale: targetScale,
                  y: targetY,
                  opacity: targetOpacity,
                }}
                exit="exit"
                transition={SLIDE_TRANSITION}
                className={`featured-card-frame origin-bottom ${
                  !isActive ? 'featured-carousel-side-card' : ''
                }`}
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 0,
                  right: 0,
                  margin: '0 auto',
                  transformOrigin: '50% 100%',
                  overflow: 'visible',
                  zIndex: isActive ? 5 : 2,
                  cursor: 'pointer',
                  willChange: 'transform, opacity',
                }}
                onClick={() => {
                  if (!isActive) {
                    paginate(offset);
                  }
                }}
                role={!isActive ? 'button' : undefined}
                tabIndex={!isActive ? 0 : undefined}
                aria-label={
                  !isActive
                    ? offset < 0
                      ? `Geser ke karya sebelumnya: ${item.title}`
                      : `Geser ke karya berikutnya: ${item.title}`
                    : undefined
                }
                onKeyDown={(e) => {
                  if (!isActive && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    paginate(offset);
                  }
                }}
              >
                <SlidePillAperture
                  item={item}
                  slotVirtualIndex={slotVirtualIndex}
                  isActive={isActive}
                  circleStartPct={circleStartPct}
                  smoothProgress={smoothProgress}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Centered Pagination Dot Indicator + CTA */}
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
        }}
      >
        <div
          role="tablist"
          aria-label="Navigasi slide karya unggulan"
          className="flex items-center justify-center gap-2 mt-4"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4,
          }}
        >
          {FEATURED_WORKS.map((work, idx) => {
            const isCurrent = idx === activeRealIndex;
            return (
              <button
                key={work.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Tampilkan ${work.title}`}
                onClick={() => jumpToIndex(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className={
                    isCurrent
                      ? 'w-7 h-1.5 rounded-full bg-[#F37338]'
                      : 'w-1.5 h-1.5 rounded-full bg-[#141413]/25'
                  }
                  style={{
                    display: 'block',
                    width: isCurrent ? 28 : 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: isCurrent ? '#F37338' : 'rgba(20, 20, 19, 0.25)',
                    transition:
                      'width 0.38s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.25s ease',
                  }}
                />
              </button>
            );
          })}
        </div>

        <Link
          href="/catalog"
          className="btn-secondary"
          style={{
            padding: '12px 28px',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          <span>Lihat Semua Catalog</span>
        </Link>
      </div>
    </section>
  );
}
