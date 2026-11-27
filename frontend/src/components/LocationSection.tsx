'use client';

import { motion } from 'motion/react';
import RevealTitle from '@/components/RevealTitle';

export default function LocationSection() {
  const iconBadgeStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2DFDA',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0px 4px 12px rgba(20, 20, 19, 0.04)',
  };

  return (
    <section
      id="lokasi"
      style={{
        backgroundColor: '#F3F0EE',
        paddingTop: 96,
        paddingBottom: 96,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          className="location-card-grid"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
          style={{
            backgroundColor: '#FCFBFA',
            borderRadius: 40,
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0px 24px 48px 0px rgba(0,0,0,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* Info Column */}
          <div>
            <p style={{
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
            }}>
              STUDIO &amp; WORKSHOP
            </p>
            <RevealTitle
              as="h2"
              text="Lokasi dinail.co"
              style={{
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                color: '#141413',
                lineHeight: 1.05,
                marginBottom: 32,
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Address */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={iconBadgeStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F37338"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'block' }}
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#141413', marginBottom: 4 }}>Alamat Studio</p>
                  <p style={{ fontSize: 14, color: '#696969', lineHeight: 1.6 }}>
                    Kendal, RT03, RW.11, Kendal, Bangun Kerto,<br />
                    Kec. Turi, Kabupaten Sleman,<br />
                    Daerah Istimewa Yogyakarta 55551, Indonesia
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={iconBadgeStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F37338"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'block' }}
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#141413', marginBottom: 4 }}>Jam Operasional</p>
                  <p style={{ fontSize: 14, color: '#696969', lineHeight: 1.6 }}>
                    Senin – Sabtu: 09.00 – 18.00 WIB<br />
                    Minggu: 10.00 – 15.00 WIB
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={iconBadgeStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F37338"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'block' }}
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#141413', marginBottom: 4 }}>Hubungi via WhatsApp</p>
                  <a
                    href="https://wa.me/62882008903525"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 14,
                      color: '#141413',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      borderBottom: '1px solid #F37338',
                      paddingBottom: 2,
                    }}
                  >
                    +62 8820-0890-3525 ↗
                  </a>
                </div>
              </div>

              {/* CTA Maps */}
              <div style={{ marginTop: 8 }}>
                <a
                  href="https://maps.app.goo.gl/w9FeUmFHwzkjxF118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: '11px 26px',
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  }}
                >
                  <span>Buka di Google Maps ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Map Column */}
          <div
            className="location-map-box"
            style={{
              borderRadius: 32,
              overflow: 'hidden',
              height: 'clamp(280px, 35vw, 420px)',
              backgroundColor: '#E8E2DA',
              position: 'relative',
            }}
          >
            {/* Embedded Google Maps iframe placeholder */}
            <iframe
              src="https://www.google.com/maps?q=-7.654784,110.3491832&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Studio dinail.co"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

