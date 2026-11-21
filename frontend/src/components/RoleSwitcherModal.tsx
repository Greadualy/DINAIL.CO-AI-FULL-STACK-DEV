'use client';

import React from 'react';
import { useRole } from '@/context/RoleContext';

export default function RoleSwitcherModal() {
  const { isModalOpen, closeModal, login, loginWithGoogle } = useRole();

  if (!isModalOpen) return null;

  const handleLogin = () => {
    login('user');
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    /* 1. Overlay Popup */
    <div
      onClick={closeModal}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(20, 20, 19, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* 2. Container Card Popup */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '36px',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Tombol Tutup Silang (Close Button) */}
        <button
          onClick={closeModal}
          aria-label="Tutup"
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#F3F0EE',
            color: '#141413',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.75';
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          &times;
        </button>

        {/* Header / Brand Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 4 }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#141413',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            dinail.co
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#767676',
              margin: 0,
            }}
          >
            Welcome to customized nail art artistry
          </p>
        </div>

        {/* 3. Isi Card (3 Tombol Bertumpuk Vertikal) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* Tombol 1: Continue with Apple */}
          <button
            type="button"
            onClick={handleLogin}
            style={{
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.88';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Ikon Apple SVG Putih */}
            <span
              style={{
                position: 'absolute',
                left: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.63-.78 1.06-1.85.94-2.93-.93.04-2.02.63-2.67 1.4-.58.68-1.09 1.77-.95 2.83 1.03.08 2.05-.52 2.68-1.3z" />
              </svg>
            </span>
            <span>Continue with Apple</span>
          </button>

          {/* Tombol 2: Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              color: '#141413',
              fontWeight: 600,
              fontSize: '15px',
              border: '1.5px solid #E5E5E5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              letterSpacing: '-0.01em',
              transition: 'background-color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9F9F9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Ikon Google SVG Resmi Berwarna */}
            <span
              style={{
                position: 'absolute',
                left: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </span>
            <span>Continue with Google</span>
          </button>

          {/* Tombol 3: Continue with Email */}
          <button
            type="button"
            onClick={handleLogin}
            style={{
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              color: '#141413',
              fontWeight: 600,
              fontSize: '15px',
              border: '1.5px solid #E5E5E5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              letterSpacing: '-0.01em',
              transition: 'background-color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9F9F9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Ikon Amplop / Mail SVG Garis Hitam */}
            <span
              style={{
                position: 'absolute',
                left: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#141413"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <span>Continue with Email</span>
          </button>
        </div>

        {/* 4. Teks Bawah Card */}
        {/* Teks Tengah: Already a member? Log In */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#767676',
          }}
        >
          <span>Already a member? </span>
          <span
            onClick={handleLogin}
            style={{
              color: '#234E43',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Log In
          </span>
        </div>

        {/* Teks Paling Bawah: Terms and Privacy */}
        <div
          style={{
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#767676',
            lineHeight: 1.45,
          }}
        >
          By continuing you agree to our Terms and Privacy
        </div>
      </div>
    </div>
  );
}
