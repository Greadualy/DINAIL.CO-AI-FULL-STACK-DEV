'use client';

import { useEffect, useRef, useState } from 'react';
import { testimonials as INITIAL_TESTIMONIALS, type TestimonialItem } from '@/data/mockData';
import RevealTitle from '@/components/RevealTitle';

function StarRating({
  count,
  interactive = false,
  onSelect,
}: {
  count: number;
  interactive?: boolean;
  onSelect?: (r: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? (hoverRating || count) >= star : count >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect && onSelect(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? 24 : 15,
              color: filled ? '#F37338' : '#D1CDC7',
              lineHeight: 1,
              transition: 'transform 0.1s, color 0.15s',
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function CircleArrowButton({
  direction,
  onClick,
  ariaLabel,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  ariaLabel: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: isHovered ? '1.5px solid #F37338' : '1.5px solid #E8E2DA',
        backgroundColor: isHovered ? '#F37338' : '#FFFFFF',
        color: '#141413',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1,
        flexShrink: 0,
        boxShadow: isHovered
          ? '0px 8px 20px rgba(243, 115, 56, 0.30)'
          : '0px 4px 12px rgba(20, 20, 19, 0.08)',
        transform: isPressed ? 'scale(0.96)' : isHovered ? 'scale(1.06)' : 'scale(1)',
        transition:
          'background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.28s ease',
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
          transform: isHovered
            ? direction === 'right'
              ? 'translateX(2px)'
              : 'translateX(-2px)'
            : 'translateX(0px)',
          transition: 'transform 0.25s ease',
        }}
      >
        {direction === 'left' ? (
          <path d="M19 12H5M12 19l-7-7 7-7" />
        ) : (
          <path d="M5 12h14M12 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

const displayItems =
  INITIAL_TESTIMONIALS.length < 8
    ? [...INITIAL_TESTIMONIALS, ...INITIAL_TESTIMONIALS]
    : INITIAL_TESTIMONIALS;

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fullReviewItem, setFullReviewItem] = useState<TestimonialItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = displayItems.length;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    const timer = setTimeout(update, 0);
    mq.addEventListener('change', update);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', update);
    };
  }, []);

  // Autoplay handler
  useEffect(() => {
    if (isPaused || fullReviewItem) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, fullReviewItem, total]);

  const goTo = (i: number) => {
    setActiveIndex(((i % total) + total) % total);
  };

  // Hitung circular offset terhadap activeIndex
  const getCardOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;
    return offset;
  };

  // Compute card 3D ring positioning dengan center anchor (-50%, -50%) & jarak proporsional
  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = getCardOffset(index);
    const absOffset = Math.abs(offset);
    const sign = offset < 0 ? -1 : 1;

    let transform = `perspective(1100px) translate3d(calc(-50% + ${sign * (isMobile ? 280 : 600)}px), -50%, 0) scale(0.65) rotateY(${sign * -20}deg)`;
    let zIndex = 1;
    let opacity = 0;
    let pointerEvents: React.CSSProperties['pointerEvents'] = 'none';
    let visibility: React.CSSProperties['visibility'] = 'visible';

    if (isMobile) {
      if (offset === 0) {
        transform = 'translate3d(-50%, -50%, 0) scale(1)';
        zIndex = 30;
        opacity = 1;
        pointerEvents = 'auto';
        visibility = 'visible';
      } else {
        transform = `translate3d(calc(-50% + ${sign * 48}px), -50%, 0) scale(0.96)`;
        zIndex = 1;
        opacity = 0;
        pointerEvents = 'none';
        visibility = 'hidden';
      }
    } else if (offset === 0) {
      transform = 'perspective(1100px) translate3d(-50%, -50%, 0) scale(1) rotateY(0deg)';
      zIndex = 30;
      opacity = 1;
      pointerEvents = 'auto';
    } else if (absOffset === 1) {
      transform = `perspective(1100px) translate3d(calc(-50% + ${sign * 260}px), -50%, 0) scale(0.88) rotateY(${sign * -10}deg)`;
      zIndex = 20;
      opacity = 0.85;
      pointerEvents = 'auto';
    } else if (absOffset === 2) {
      transform = `perspective(1100px) translate3d(calc(-50% + ${sign * 480}px), -50%, 0) scale(0.76) rotateY(${sign * -16}deg)`;
      zIndex = 10;
      opacity = 0.4;
      pointerEvents = 'auto';
    }

    // Kartu jauh di luar layar (absOffset >= 4) berpindah diam-diam tanpa melintas visual
    const transition =
      isMobile
        ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease'
        : absOffset >= 4
        ? 'opacity 0.55s ease'
        : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease';

    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: isMobile ? 'min(320px, 86vw)' : '340px',
      maxWidth: '86vw',
      transform,
      zIndex,
      opacity,
      visibility,
      pointerEvents,
      cursor: offset === 0 ? 'default' : 'pointer',
      transition,
      willChange: 'transform, opacity',
    };
  };

  const getInitials = (name: string) => {
    const clean = name.replace(/[^a-zA-Z0-9]/g, '');
    return (clean.slice(0, 1) || name.slice(0, 1) || 'D').toUpperCase();
  };

  return (
    <section
      id="testimoni"
      style={{
        backgroundColor: '#FCFBFA',
        paddingTop: 96,
        paddingBottom: 110,
        paddingLeft: 24,
        paddingRight: 24,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section Header with Summary badge & Action Button */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 48,
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
            PENILAIAN &amp; CERITA PELANGGAN
          </p>
          <RevealTitle
            as="h2"
            text="Kuku Sempurna, Hati Bahagia."
            style={{
              fontSize: 'clamp(28px, 4.5vw, 42px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#141413',
              lineHeight: 1.05,
              maxWidth: 680,
              marginBottom: 16,
            }}
          />
          <p
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: '#141413',
              maxWidth: 540,
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            Ulasan nyata dari pembeli Shopee yang telah membuktikan detail pengerjaan, ketepatan ukuran, dan kenyamanan press-on nails dinail.co.
          </p>

          {/* Rating Summary Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: 999,
                boxShadow: '0px 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #E8E2DA',
              }}
            >
              <span style={{ color: '#F37338', fontWeight: 700, fontSize: 16 }}>★ 5.0 </span>
              <span style={{ color: '#696969', fontSize: 13 }}>dari 900+ ulasan Shopee</span>
            </div>
          </div>
        </div>

        {/* 3D Ring Carousel Stage (Center-Anchored; tanpa fade di Mobile) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            height: '306px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            transformStyle: 'flat',
            ...(isMobile
              ? {}
              : {
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                }),
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {displayItems.map((t, i) => {
            const offset = getCardOffset(i);
            const isLongReview = t.review.length > 145;

            return (
              <div
                key={`${t.id}-ring-${i}`}
                style={getCardStyle(i)}
                onClick={() => offset !== 0 && goTo(i)}
              >
                <div
                  className="shadow-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '28px',
                    padding: '22px 24px',
                    height: '262px',
                    boxShadow: 'none',
                    border: offset === 0 ? '1.5px solid #F37338' : '1px solid #E8E2DA',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                  }}
                >
                  <div>
                    {/* User Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: offset === 0 ? '#FFF1EB' : '#F3F0EE',
                          border: offset === 0 ? '1.5px solid #F37338' : '1.5px solid #E8E2DA',
                          color: '#141413',
                          fontSize: 16,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        {getInitials(t.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: '#141413',
                            marginBottom: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: '#F37338',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.variant}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <StarRating count={t.rating} />
                    </div>

                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        lineHeight: 1.58,
                        color: '#262627',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>

                  {/* Verification Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 10,
                      borderTop: '1px solid #F3F0EE',
                    }}
                  >
                    {isLongReview && offset === 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullReviewItem(t);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#141413',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        Baca selengkapnya
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#696969' }}>Pembeli Shopee</span>
                    )}
                    <span style={{ fontSize: 12, color: '#CF4500', fontWeight: 600 }}>
                      dinail.co ✓
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Controls (Minimal Arrows Only) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <CircleArrowButton
            direction="left"
            onClick={() => goTo(activeIndex - 1)}
            ariaLabel="Sebelumnya"
          />

          <CircleArrowButton
            direction="right"
            onClick={() => goTo(activeIndex + 1)}
            ariaLabel="Berikutnya"
          />
        </div>
      </div>

      {/* MODAL BACA ULASAN LENGKAP */}
      {fullReviewItem && (
        <div
          onClick={() => setFullReviewItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20,20,19,0.5)',
            backdropFilter: 'blur(6px)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dinail-modal-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 32,
              padding: '32px 28px',
              maxWidth: 'min(480px, 92vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              boxShadow: '0px 24px 60px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setFullReviewItem(null)}
              aria-label="Tutup ulasan"
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1.5px solid #E2DFDA',
                backgroundColor: '#FFFFFF',
                color: '#141413',
                cursor: 'pointer',
                fontSize: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  backgroundColor: '#FFF1EB',
                  border: '1.5px solid #F37338',
                  color: '#141413',
                  fontSize: 17,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getInitials(fullReviewItem.name)}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, color: '#141413', marginBottom: 2 }}>
                  {fullReviewItem.name}
                </p>
                <p style={{ fontSize: 13, color: '#F37338', fontWeight: 500 }}>
                  {fullReviewItem.variant}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <StarRating count={fullReviewItem.rating} />
            </div>

            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: '#262627',
                marginBottom: 20,
              }}
            >
              &ldquo;{fullReviewItem.review}&rdquo;
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 14,
                borderTop: '1px solid #F3F0EE',
              }}
            >
              <span style={{ fontSize: 12, color: '#696969' }}>Terverifikasi Pembeli Shopee</span>
              <span style={{ fontSize: 12, color: '#CF4500', fontWeight: 600 }}>dinail.co ✓</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
