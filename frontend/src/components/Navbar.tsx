'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { currentUser, openModal } = useRole();
  const navRef = useRef<HTMLElement>(null);
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

  // Click outside to collapse if opened via click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsClicked(false);
        setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      {/* 4.1. Dynamic Floating Pill Navbar */}
      <nav
        ref={navRef}
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
              priority
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

      {/* Mobile Bottom Nav (Khusus Layar HP <= 640px) */}
      <div
        className="mobile-bottom-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          backgroundColor: '#141413',
          borderRadius: 999,
          padding: '8px 16px',
          boxShadow: '0px 8px 32px rgba(0,0,0,0.25)',
          gap: 6,
        }}
      >
        {[
          {
            label: 'Home',
            href: '/',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            label: 'Catalog',
            href: '/catalog',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            ),
          },
          {
            label: 'Price List',
            href: '/pricelist',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            ),
          },
          {
            label: 'Profil',
            href: '#',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ),
            isProfile: true,
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={(e) => {
              if (item.isProfile) {
                handleProfileClick(e);
              } else {
                router.push(item.href);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: isActive(item.href) ? '#F37338' : 'rgba(255,255,255,0.7)',
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
