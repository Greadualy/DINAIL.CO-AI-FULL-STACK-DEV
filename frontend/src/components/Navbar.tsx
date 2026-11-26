'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { currentUser, openModal } = useRole();
  const navRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Scroll detection (scrollY > 80px)
  useEffect(() => {
    const handleScroll = () => {
      const isPast80 = window.scrollY > 80;
      setScrolled(isPast80);
      if (!isPast80) {
        setIsClicked(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click / touch outside to collapse desktop pill or close mobile dropdown
  useEffect(() => {
    const handlePointerOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setIsClicked(false);
        setIsHovered(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsClicked(false);
      }
    };
    document.addEventListener('mousedown', handlePointerOutside);
    document.addEventListener('touchstart', handlePointerOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute collapsed vs expanded state
  const isExpanded = !scrolled || isHovered || isClicked;
  const isCollapsed = !isExpanded;

  // Hover handlers with slight debounce for smooth navigation
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (scrolled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleNavClick = () => {
    if (isCollapsed) {
      setIsClicked(true);
    }
  };

  // Profile action handler: opens Auth popup modal or navigates to /profil
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClicked(false);
    setIsMobileMenuOpen(false);
    if (currentUser) {
      router.push('/profil');
    } else {
      openModal();
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 4.1. Dynamic Floating Pill Navbar (Desktop >= 768px) */}
      <nav
        ref={navRef}
        className="floating-pill-nav desktop-floating-nav"
        data-collapsed={isCollapsed ? 'true' : 'false'}
        onClick={handleNavClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Navigasi utama dinail.co"
        style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          // Shape & Dimensions
          width: isCollapsed ? 56 : 'auto',
          minWidth: isCollapsed ? 56 : 'min(600px, 92vw)',
          height: 56,
          borderRadius: isCollapsed ? '50%' : 999,
          padding: isCollapsed ? 0 : '12px 36px',
          boxSizing: 'border-box',
          // Styling & Surface (Frosted Glass / Glassmorphism)
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 8px 32px rgba(20, 20, 19, 0.06)',
          // Layout
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: isCollapsed ? 0 : 28,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          cursor: isCollapsed ? 'pointer' : 'default',
          // Smooth transition as specified in dinail spec
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Sisi Kiri: Logo dinail.co */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            if (isCollapsed) {
              e.preventDefault();
              setIsClicked(true);
            } else {
              router.push('/');
            }
          }}
        >
          {/* Logo Icon (Always visible & centered in circle) */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              transform: isCollapsed ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <Image
              src={DINAIL_ASSETS.logo}
              alt="Logo dinail.co"
              width={36}
              height={36}
              preload
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Teks Nama Brand (Disembunyikan saat collapsed) */}
          <span
            style={{
              fontWeight: 500,
              fontSize: 16,
              color: '#141413',
              letterSpacing: '-0.03em',
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? 0 : 100,
              marginLeft: isCollapsed ? 0 : 8,
              overflow: 'hidden',
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transition: 'opacity 0.25s ease, max-width 0.35s ease, margin 0.35s ease',
            }}
          >
            dinail.co
          </span>
        </div>

        {/* Item Navigasi: 1. Home, 2. Catalog, 3. Price List, 4. Profil */}
        <div
          className="floating-pill-nav-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? 0 : 540,
            overflow: 'hidden',
            pointerEvents: isCollapsed ? 'none' : 'auto',
            transition: 'opacity 0.25s ease, max-width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* 1. Home */}
          <Link
            href="/"
            onClick={() => setIsClicked(false)}
            className={`navbar-link${isActive('/') ? ' active' : ''}`}
          >
            Home
          </Link>

          {/* 2. Catalog */}
          <Link
            href="/catalog"
            onClick={() => setIsClicked(false)}
            className={`navbar-link${isActive('/catalog') ? ' active' : ''}`}
          >
            Catalog
          </Link>

          {/* 3. Price List */}
          <Link
            href="/pricelist"
            onClick={() => setIsClicked(false)}
            className={`navbar-link${isActive('/pricelist') ? ' active' : ''}`}
          >
            Price List
          </Link>

          {/* 4. Profil (Membuka Auth Card popup) */}
          <button
            type="button"
            onClick={handleProfileClick}
            className={`navbar-link${isActive('/profil') ? ' active' : ''}`}
          >
            Profil
          </button>

        </div>
      </nav>

      {/* Mobile Full-Width Glassmorphism Top Navbar + Dropdown (< 768px) */}
      <div ref={mobileNavRef} className="mobile-top-nav-wrapper">
        {/* 1. Bar Atas (Fixed Full-Width Top Bar) */}
        <header
          aria-label="Navigasi mobile dinail.co"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 68,
            padding: '0 20px',
            boxSizing: 'border-box',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(252, 251, 250, 0.68)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderBottom: '1px solid rgba(20, 20, 19, 0.08)',
            boxShadow: '0px 4px 20px rgba(20, 20, 19, 0.04)',
          }}
        >
          {/* Sisi Kiri: Logo Bulat + Brand dinail.co */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={DINAIL_ASSETS.logo}
                alt="Logo dinail.co"
                width={34}
                height={34}
                preload
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '-0.02em',
                color: '#141413',
                lineHeight: 1,
              }}
            >
              dinail.co
            </span>
          </Link>

          {/* Sisi Kanan: Tombol Pill Cepat + Hamburger Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleProfileClick}
              style={{
                borderRadius: 999,
                padding: '8px 18px',
                backgroundColor: '#141413',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              Profil
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              style={{
                width: 40,
                height: 40,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isMobileMenuOpen ? '1.5px solid #141413' : '1.5px solid transparent',
                borderRadius: 12,
                padding: 6,
                backgroundColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                color: '#141413',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#141413"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. Panel Dropdown Menu (Glassmorphism) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Area klik/sentuh di luar dropdown untuk menutup menu */}
              <motion.div
                key="mobile-nav-dismiss-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
                style={{
                  position: 'fixed',
                  top: 68,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998,
                  backgroundColor: 'rgba(20, 20, 19, 0.14)',
                }}
              />

              <motion.nav
                key="mobile-nav-dropdown"
                aria-label="Menu navigasi mobile"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'fixed',
                  top: 68,
                  left: 0,
                  right: 0,
                  width: '100%',
                  zIndex: 999,
                  backgroundColor: 'rgba(252, 251, 250, 0.82)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderBottom: '1px solid rgba(20, 20, 19, 0.1)',
                  boxShadow: '0px 16px 32px rgba(20, 20, 19, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '18px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive('/') ? '#F37338' : '#141413',
                    borderBottom: '1px solid rgba(20, 20, 19, 0.08)',
                  }}
                >
                  HOME
                </Link>

                <Link
                  href="/catalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '18px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive('/catalog') ? '#F37338' : '#141413',
                    borderBottom: '1px solid rgba(20, 20, 19, 0.08)',
                  }}
                >
                  CATALOG
                </Link>

                <Link
                  href="/pricelist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '18px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive('/pricelist') ? '#F37338' : '#141413',
                    borderBottom: '1px solid rgba(20, 20, 19, 0.08)',
                  }}
                >
                  PRICE LIST
                </Link>

                <button
                  type="button"
                  onClick={handleProfileClick}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(20, 20, 19, 0.08)',
                    padding: '18px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: isActive('/profil') ? '#F37338' : '#141413',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  PROFIL
                </button>

                {/* Garis aksen penutup tipis di paling bawah panel */}
                <div
                  aria-hidden="true"
                  style={{
                    height: 3,
                    backgroundColor: 'rgba(20, 20, 19, 0.18)',
                    borderRadius: 999,
                    margin: '12px 24px 16px',
                  }}
                />
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
