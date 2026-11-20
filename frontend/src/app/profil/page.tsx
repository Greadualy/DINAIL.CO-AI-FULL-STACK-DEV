'use client';

import { useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';

function IconUser({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconRuler({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0l-6-6c-.4-.4-.4-1 0-1.4L13.9 1.3c.4-.4 1-.4 1.4 0l6 6c.4.4.4 1 0 1.4z" />
      <path d="m14.5 7.5-2 2" />
      <path d="m11.5 10.5-3 3" />
      <path d="m8.5 13.5-2 2" />
    </svg>
  );
}

function IconConsultation({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconBell({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconLogOut({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconEdit({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconCamera({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconShoppingBag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconSparkle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconBrush({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.34-3 3 0 1.66-1.34 3-3 3 2.76 0 5-2.24 5-5 0-.34-.04-.67-.1-.99" />
    </svg>
  );
}

function IconEmptyBox({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export type OrderStatus =
  | 'menunggu'
  | 'proses'
  | 'siap_checkout'
  | 'selesai'
  | 'dibatalkan';

export interface OrderCard {
  consultationId: string;
  submittedAt: string;
  status: OrderStatus;
  serviceType: string;
  designName: string;
  variant: string;
  notes: string;
  estimasiHarga: string;
  photoUrl: string;
  shopeeUrl?: string;
}

export type ActiveMenu = 'akun' | 'ukuran' | 'konsultasi' | 'notifikasi';

export interface NailFingers {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export type SizePreset = 'XS' | 'S' | 'M' | 'L' | 'Custom';

export interface NailSizeData {
  preset: SizePreset;
  leftHand: NailFingers;
  rightHand: NailFingers;
  syncHands: boolean;
  photoUrl: string | null;
  updatedAt?: string;
}

const SIZE_PRESETS: Record<Exclude<SizePreset, 'Custom'>, NailFingers> = {
  XS: { thumb: 14, index: 10, middle: 11, ring: 10, pinky: 8 },
  S: { thumb: 15, index: 11, middle: 12, ring: 11, pinky: 8 },
  M: { thumb: 16, index: 12, middle: 13, ring: 12, pinky: 9 },
  L: { thumb: 17, index: 13, middle: 14, ring: 13, pinky: 10 },
};

const DEFAULT_NAIL_DATA: NailSizeData = {
  preset: 'M',
  leftHand: { ...SIZE_PRESETS.M },
  rightHand: { ...SIZE_PRESETS.M },
  syncHands: true,
  photoUrl: null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: 'MENUNGGU REVIEW',
  proses: 'PROSES DESAIN',
  siap_checkout: 'SIAP CHECKOUT',
  selesai: 'SELESAI',
  dibatalkan: 'DIBATALKAN',
};

const TAB_LIST: { key: OrderStatus | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: 'Menunggu Review' },
  { key: 'proses', label: 'Proses Desain' },
  { key: 'siap_checkout', label: 'Siap Checkout' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
];

// Urutan Menu: Akun Saya -> Ukuran Kuku Saya -> Konsultasi Saya -> Notifikasi -> Keluar
const MENU_ITEMS: { key: ActiveMenu | 'keluar'; label: string; icon: React.ReactNode }[] = [
  { key: 'akun', label: 'Akun Saya', icon: <IconUser /> },
  { key: 'ukuran', label: 'Ukuran Kuku Saya', icon: <IconRuler /> },
  { key: 'konsultasi', label: 'Konsultasi Saya', icon: <IconConsultation /> },
  { key: 'notifikasi', label: 'Notifikasi', icon: <IconBell /> },
  { key: 'keluar', label: 'Keluar', icon: <IconLogOut /> },
];

const generateConsultationId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const seq = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
  return `DNL-KNS-${dateStr}-${seq}`;
};

const SEED_ORDERS: OrderCard[] = [
  {
    consultationId: 'DNL-KNS-20261114-01',
    submittedAt: '14 Nov 2026, 09:30',
    status: 'proses',
    serviceType: 'Custom Press-On Nails',
    designName: 'Milky French Classic',
    variant: 'Hard, Oval - Medium',
    notes: 'Mohon dibuat tipis dan natural, untuk acara wisuda.',
    estimasiHarga: 'Rp 99.900',
    photoUrl: DINAIL_ASSETS.catalogPreviews[0],
  },
  {
    consultationId: 'DNL-KNS-20261115-03',
    submittedAt: '15 Nov 2026, 14:20',
    status: 'siap_checkout',
    serviceType: 'Custom Press-On Nails',
    designName: 'Blush Chrome Gradient',
    variant: 'Hard, Coffin - Extra Long',
    notes: 'Gradient dari blush ke rose gold dengan efek chrome magnetic.',
    estimasiHarga: 'Rp 134.900',
    photoUrl: DINAIL_ASSETS.catalogPreviews[2],
    shopeeUrl: 'https://shopee.co.id/dinail.co',
  },
  {
    consultationId: 'DNL-KNS-20261116-02',
    submittedAt: '16 Nov 2026, 11:00',
    status: 'selesai',
    serviceType: 'Custom Press-On Nails',
    designName: 'Cat Eye Pink Luxe',
    variant: 'Hard, Almond - Medium',
    notes: 'Efek cat eye magnetic, warna pink dusty rose.',
    estimasiHarga: 'Rp 119.900',
    photoUrl: DINAIL_ASSETS.catalogPreviews[3],
  },
];

const LS_KEY_ORDERS = 'dinail_orders';
const LS_KEY_NAIL_SIZE = 'dinail_nail_sizes';

function loadOrders(): OrderCard[] {
  try {
    const raw = localStorage.getItem(LS_KEY_ORDERS);
    if (raw) return JSON.parse(raw) as OrderCard[];
  } catch { }
  return [];
}

function saveOrders(orders: OrderCard[]) {
  try {
    localStorage.setItem(LS_KEY_ORDERS, JSON.stringify(orders));
  } catch { }
}

function loadNailData(): NailSizeData {
  try {
    const raw = localStorage.getItem(LS_KEY_NAIL_SIZE);
    if (raw) return JSON.parse(raw) as NailSizeData;
  } catch { }
  return DEFAULT_NAIL_DATA;
}

function saveNailData(data: NailSizeData) {
  try {
    localStorage.setItem(LS_KEY_NAIL_SIZE, JSON.stringify(data));
  } catch { }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Salin ke clipboard"
      aria-label="Salin"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        color: copied ? '#16A34A' : '#767676',
        fontSize: 13,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        transition: 'color 0.2s ease',
      }}
    >
      {copied ? (
        <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Tersalin ✓</span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function SubmitConfirmationModal({
  order,
  onClose,
}: {
  order: OrderCard;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        backgroundColor: 'rgba(20, 20, 19, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '32px 28px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#FFF7F3',
            border: '2px solid #FDDCC8',
            color: '#F37338',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
          }}
        >
          ✓
        </div>

        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#141413',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          Konsultasi Berhasil Diajukan!
        </h3>
        <p
          style={{
            fontSize: 13,
            color: '#696969',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Tim nail artist dinail.co akan segera meninjau referensi desain dan detail kuku kamu.
        </p>

        {/* Highlighted ID Card */}
        <div
          style={{
            background: '#F3F0EE',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 22,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid #EAE6E1',
            }}
          >
            <span style={{ fontSize: 12, color: '#696969', fontWeight: 500 }}>
              ID Konsultasi Anda
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#F37338',
                  fontFamily: 'monospace',
                }}
              >
                {order.consultationId}
              </span>
              <CopyButton text={order.consultationId} />
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#141413', lineHeight: 1.6 }}>
            <p><strong>Desain:</strong> {order.designName}</p>
            <p><strong>Variasi:</strong> {order.variant}</p>
            <p><strong>Status:</strong> <span style={{ color: '#F37338', fontWeight: 600 }}>{STATUS_LABEL[order.status]}</span></p>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '13px 20px', fontSize: 14, fontWeight: 600 }}
          onClick={onClose}
        >
          Lihat di Riwayat Konsultasi →
        </button>
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderCard;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        backgroundColor: 'rgba(20, 20, 19, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 28px',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: 16,
            borderBottom: '1px solid #EAE6E1',
            marginBottom: 20,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
              Detail Pengajuan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', fontFamily: 'monospace' }}>
                {order.consultationId}
              </h3>
              <CopyButton text={order.consultationId} />
            </div>
            <p style={{ fontSize: 12, color: '#767676', marginTop: 2 }}>
              Diajukan pada: {order.submittedAt}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            style={{
              background: '#F3F0EE',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 20, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 12,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#F3F0EE',
            }}
          >
            <Image
              src={order.photoUrl}
              alt={order.designName}
              width={110}
              height={110}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
              {order.serviceType}
            </span>
            <h4 style={{ fontSize: 17, fontWeight: 700, color: '#141413', margin: '2px 0 6px' }}>
              {order.designName}
            </h4>
            <p style={{ fontSize: 13, color: '#696969', marginBottom: 4 }}>
              <strong>Variasi:</strong> {order.variant}
            </p>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#F37338',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ● {STATUS_LABEL[order.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div
            style={{
              background: '#F3F0EE',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#141413',
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', display: 'block', marginBottom: 4 }}>
              CATATAN KUSTOMISASI:
            </span>
            &ldquo;{order.notes}&rdquo;
          </div>
        )}

        {/* Price & Action */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid #EAE6E1',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: '#696969', display: 'block' }}>Estimasi Biaya:</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#141413' }}>
              {order.estimasiHarga}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: 13 }}
              onClick={onClose}
            >
              Tutup
            </button>
            {order.status === 'siap_checkout' && order.shopeeUrl && (
              <a
                href={order.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                Checkout Shopee →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCardItem({
  order,
  onOpenDetail,
}: {
  order: OrderCard;
  onOpenDetail: (order: OrderCard) => void;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EAE6E1',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* 1. Header Kartu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #EAE6E1',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#696969' }}>
            ID Konsultasi:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#141413',
              fontFamily: 'monospace',
            }}
          >
            {order.consultationId}
          </span>
          <CopyButton text={order.consultationId} />
          <span style={{ fontSize: 12, color: '#888888', marginLeft: 4 }}>
            · {order.submittedAt}
          </span>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#F37338',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* 2. Isi Kartu */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '18px 20px',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            background: '#F3F0EE',
          }}
        >
          <Image
            src={order.photoUrl}
            alt={order.designName}
            width={80}
            height={80}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#767676',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 2,
            }}
          >
            {order.serviceType}
          </p>
          <h4
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#141413',
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {order.designName}
          </h4>
          <p style={{ fontSize: 13, color: '#696969', marginBottom: 4 }}>
            Variasi: <strong>{order.variant}</strong>
          </p>
          {order.notes && (
            <p
              style={{
                fontSize: 12,
                color: '#767676',
                fontStyle: 'italic',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              Catatan: &ldquo;{order.notes}&rdquo;
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#141413',
              whiteSpace: 'nowrap',
            }}
          >
            {order.estimasiHarga}
          </p>
          <p style={{ fontSize: 11, color: '#767676', marginTop: 2 }}>
            Estimasi harga
          </p>
        </div>
      </div>

      {/* 3. Footer Kartu */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderTop: '1px solid #EAE6E1',
          background: '#FAFAFA',
        }}
      >
        <button
          className="btn-secondary"
          style={{ padding: '8px 20px', fontSize: 13 }}
          onClick={() => onOpenDetail(order)}
        >
          Lihat Detail
        </button>

        {order.status === 'siap_checkout' && order.shopeeUrl && (
          <a
            href={order.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            Checkout Shopee →
          </a>
        )}
      </div>
    </div>
  );
}

// Konten Tab: Ukuran Kuku Saya (FITUR PENGUKURAN KUKU)

function UkuranKukuTab() {
  const [nailData, setNailData] = useState<NailSizeData>(() => {
    if (typeof window !== 'undefined') {
      return loadNailData();
    }
    return DEFAULT_NAIL_DATA;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Preset Select
  const handleSelectPreset = (preset: SizePreset) => {
    if (preset === 'Custom') {
      setNailData((prev) => ({ ...prev, preset: 'Custom' }));
      return;
    }
    const template = SIZE_PRESETS[preset];
    setNailData((prev) => ({
      ...prev,
      preset,
      leftHand: { ...template },
      rightHand: prev.syncHands ? { ...template } : prev.rightHand,
    }));
  };

  // Handle Single Finger Input
  const handleFingerChange = (
    hand: 'leftHand' | 'rightHand',
    finger: keyof NailFingers,
    value: number
  ) => {
    setNailData((prev) => {
      const updatedHand = { ...prev[hand], [finger]: value };
      if (hand === 'leftHand' && prev.syncHands) {
        return {
          ...prev,
          preset: 'Custom',
          leftHand: updatedHand,
          rightHand: { ...updatedHand },
        };
      }
      return {
        ...prev,
        preset: 'Custom',
        [hand]: updatedHand,
      };
    });
  };

  // Toggle Sync Hands
  const handleToggleSync = (checked: boolean) => {
    setNailData((prev) => ({
      ...prev,
      syncHands: checked,
      rightHand: checked ? { ...prev.leftHand } : prev.rightHand,
    }));
  };

  // Upload Foto Kuku
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNailData((prev) => ({ ...prev, photoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setNailData((prev) => ({ ...prev, photoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Simpan Data Ukuran Kuku
  const handleSave = () => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const finalData: NailSizeData = {
      ...nailData,
      updatedAt: dateLabel,
    };
    saveNailData(finalData);
    setNailData(finalData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const FINGER_LABELS: { key: keyof NailFingers; label: string; desc: string }[] = [
    { key: 'thumb', label: 'Ibu Jari', desc: 'Jari 1' },
    { key: 'index', label: 'Telunjuk', desc: 'Jari 2' },
    { key: 'middle', label: 'Jari Tengah', desc: 'Jari 3' },
    { key: 'ring', label: 'Jari Manis', desc: 'Jari 4' },
    { key: 'pinky', label: 'Kelingking', desc: 'Jari 5' },
  ];

  return (
    <div>
      {/* 1. Header Bagian */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', margin: 0 }}>
          Ukuran Kuku Saya
        </h2>
        <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0', lineHeight: 1.5 }}>
          Simpan data ukuran kuku presisi untuk memastikan press-on nails pas dan nyaman di setiap jarimu.
        </p>
      </div>

      {/* Info Status Ukuran Tersimpan */}
      <div
        style={{
          background: '#FFF7F3',
          border: '1.5px solid #FDDCC8',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
            STATUS UKURAN TERSIMPAN
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#141413' }}>
              {nailData.preset === 'Custom' ? 'Ukuran Kustom Mandiri' : `Size Preset ${nailData.preset}`}
            </span>
            <span
              style={{
                fontSize: 12,
                color: '#F37338',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              ({nailData.leftHand.thumb}-{nailData.leftHand.index}-{nailData.leftHand.middle}-{nailData.leftHand.ring}-{nailData.leftHand.pinky} mm)
            </span>
          </div>
          {nailData.updatedAt && (
            <p style={{ fontSize: 11, color: '#696969', margin: '3px 0 0' }}>
              Terakhir diperbarui: {nailData.updatedAt}
            </p>
          )}
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#16A34A',
            background: '#F0FDF4',
            padding: '5px 12px',
            borderRadius: 999,
            border: '1px solid #BBF7D0',
          }}
        >
          ✓ DATA AKTIF DIGUNAKAN
        </span>
      </div>

      {/* 2. Pilihan Preset Cepat */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#141413' }}>
            Pilih Estimasi Preset Cepat
          </label>
          <span style={{ fontSize: 12, color: '#767676' }}>
            Klik salah satu untuk mengisi otomatis
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['XS', 'S', 'M', 'L', 'Custom'] as const).map((sz) => {
            const isSelected = nailData.preset === sz;
            const subtitle = sz !== 'Custom'
              ? `${SIZE_PRESETS[sz].thumb}/${SIZE_PRESETS[sz].index}/${SIZE_PRESETS[sz].middle}/${SIZE_PRESETS[sz].ring}/${SIZE_PRESETS[sz].pinky}mm`
              : 'Manual';

            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSelectPreset(sz)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  border: isSelected ? '1.5px solid #F37338' : '1px solid #EAE6E1',
                  background: isSelected ? '#FFF7F3' : '#FFFFFF',
                  color: isSelected ? '#F37338' : '#141413',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  minWidth: 90,
                }}
              >
                <span>Size {sz}</span>
                <span style={{ fontSize: 10, color: isSelected ? '#F37338' : '#767676' }}>
                  {subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detail Ukuran Tiap Jari (Kiri & Kanan) */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#141413', margin: 0 }}>
            Detail Ukuran Lebar Kuku Per Jari (Milimeter)
          </h3>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#141413',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={nailData.syncHands}
              onChange={(e) => handleToggleSync(e.target.checked)}
              style={{ accentColor: '#F37338', width: 16, height: 16 }}
            />
            <span>Samakan Tangan Kanan dengan Kiri</span>
          </label>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {/* Card Tangan Kiri */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #EAE6E1',
              borderRadius: 16,
              padding: '20px',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: 0 }}>
                Tangan Kiri (Left Hand)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FINGER_LABELS.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#F3F0EE',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#141413' }}>
                      {f.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#767676', marginLeft: 6 }}>
                      ({f.desc})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      value={nailData.leftHand[f.key]}
                      onChange={(e) => handleFingerChange('leftHand', f.key, Number(e.target.value))}
                      style={{
                        width: 54,
                        padding: '6px 8px',
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'center',
                        border: '1px solid #D1CDC7',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        color: '#141413',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#696969', fontWeight: 600 }}>mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Tangan Kanan */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #EAE6E1',
              borderRadius: 16,
              padding: '20px',
              opacity: nailData.syncHands ? 0.85 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: 0 }}>
                  Tangan Kanan (Right Hand)
                </h4>
              </div>
              {nailData.syncHands && (
                <span style={{ fontSize: 11, color: '#F37338', fontWeight: 600 }}>
                  (Disamakan dengan Kiri)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FINGER_LABELS.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#F3F0EE',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#141413' }}>
                      {f.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#767676', marginLeft: 6 }}>
                      ({f.desc})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      value={nailData.rightHand[f.key]}
                      disabled={nailData.syncHands}
                      onChange={(e) => handleFingerChange('rightHand', f.key, Number(e.target.value))}
                      style={{
                        width: 54,
                        padding: '6px 8px',
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'center',
                        border: '1px solid #D1CDC7',
                        borderRadius: 8,
                        background: nailData.syncHands ? '#F3F0EE' : '#FFFFFF',
                        color: nailData.syncHands ? '#767676' : '#141413',
                        outline: 'none',
                        cursor: nailData.syncHands ? 'not-allowed' : 'text',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#696969', fontWeight: 600 }}>mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Panduan & Unggah Foto Pengecekan Ukuran Kuku */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #EAE6E1',
          borderRadius: 18,
          padding: '24px',
          marginBottom: 32,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F37338',
              marginBottom: 4,
            }}
          >
            VERIFIKASI AKURASI
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#141413', margin: 0 }}>
            Pengecekan Ukuran Kuku via Foto
          </h3>
          <p style={{ fontSize: 13, color: '#696969', marginTop: 4 }}>
            Unggah foto kuku Anda bersama koin pecahan Rp 500 atau penggaris agar nail artist kami dapat memverifikasi skala kelengkungan dan ukuran kuku asli secara presisi.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'center',
          }}
        >
          {/* Panduan Foto */}
          <div
            style={{
              background: '#F3F0EE',
              borderRadius: 14,
              padding: '20px',
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#141413', marginBottom: 12 }}>
              Panduan Pengambilan Foto Presisi:
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#444444' }}>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#F37338', fontWeight: 700 }}>1.</span>
                <span>Posisikan jari tangan mendatar di atas permukaan meja yang rata.</span>
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#F37338', fontWeight: 700 }}>2.</span>
                <span>Letakkan <strong>koin Rp 500</strong> atau penggaris tepat di samping kuku sebagai pembanding skala.</span>
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#F37338', fontWeight: 700 }}>3.</span>
                <span>Ambil foto tegak lurus (90 derajat tepat dari atas kuku).</span>
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#F37338', fontWeight: 700 }}>4.</span>
                <span>Pastikan pencahayaan terang dan foto tidak buram (*blurry*).</span>
              </li>
            </ul>
          </div>

          {/* Area Upload Foto */}
          <div
            style={{
              border: '2px dashed #D1CDC7',
              borderRadius: 16,
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
            }}
          >
            {nailData.photoUrl ? (
              <div>
                <div
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '0 auto 12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <Image
                    src={nailData.photoUrl}
                    alt="Pratinjau Foto Ukuran Kuku"
                    width={130}
                    height={130}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>
                  ✓ Foto Ukuran Kuku Berhasil Diunggah
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      color: '#F37338',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Ganti Foto
                  </button>
                  <span style={{ color: '#D1CDC7' }}>·</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      color: '#DC2626',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#141413' }}>
                  <IconCamera size={32} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#141413', marginBottom: 4 }}>
                  Unggah Foto Jari &amp; Kuku Anda
                </p>
                <p style={{ fontSize: 12, color: '#767676', marginBottom: 14 }}>
                  Mendukung format JPG atau PNG (Maks. 5 MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  Pilih File Foto
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 5. Tombol Simpan & Alert Feedback */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {saveSuccess && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 12,
              padding: '12px 18px',
              fontSize: 13,
              color: '#15803D',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✓</span>
            <span>Data ukuran kuku dan foto berhasil disimpan ke profil Anda! Ukuran ini akan otomatis digunakan saat konsultasi.</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '13px 32px', fontSize: 14, fontWeight: 600 }}
            onClick={handleSave}
          >
            Simpan Ukuran Kuku
          </button>
          <span style={{ fontSize: 12, color: '#767676' }}>
            Data tersimpan aman di browser Anda
          </span>
        </div>
      </div>
    </div>
  );
}

function KonsultasiTab({
  initialDesign,
}: {
  initialDesign?: string;
}) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderCard[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = loadOrders();
      if (stored.length > 0) return stored;
      saveOrders(SEED_ORDERS);
      return SEED_ORDERS;
    }
    return SEED_ORDERS;
  });
  const [showNewForm, setShowNewForm] = useState(Boolean(initialDesign));

  // Form states
  const [newDesign, setNewDesign] = useState(initialDesign || '');
  const [newVariant, setNewVariant] = useState('Hard, Almond - Medium');
  const [newNotes, setNewNotes] = useState('');

  // Modals state
  const [submittedOrder, setSubmittedOrder] = useState<OrderCard | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderCard | null>(null);

  // Filter real-time berdasarkan Tab Status dan Search Bar
  const filtered = orders.filter((o) => {
    const matchStatus = activeStatus === 'semua' || o.status === activeStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.consultationId.toLowerCase().includes(q) ||
      o.designName.toLowerCase().includes(q) ||
      o.variant.toLowerCase().includes(q) ||
      o.serviceType.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleSubmitNew = () => {
    if (!newDesign.trim()) return;

    const newId = generateConsultationId();
    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeLabel = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newOrder: OrderCard = {
      consultationId: newId,
      submittedAt: `${dateLabel}, ${timeLabel}`,
      status: 'menunggu',
      serviceType: 'Custom Press-On Nails',
      designName: newDesign.trim(),
      variant: newVariant.trim(),
      notes: newNotes.trim(),
      estimasiHarga: 'Menunggu estimasi',
      photoUrl: DINAIL_ASSETS.catalogPreviews[0],
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);

    // Open confirmation modal
    setSubmittedOrder(newOrder);

    // Reset form
    setShowNewForm(false);
    setNewDesign('');
    setNewNotes('');
    setActiveStatus('menunggu');
  };

  return (
    <div>
      {/* Judul + tombol tambah */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', margin: 0 }}>
            Konsultasi Saya
          </h2>
          <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0' }}>
            Pantau status pesanan dan proses kustomisasi kuku Anda
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: 13 }}
          onClick={() => setShowNewForm((v) => !v)}
        >
          {showNewForm ? '✕ Tutup Form' : '+ Konsultasi Desain Baru'}
        </button>
      </div>

      {/* Form Tambah Konsultasi Baru */}
      {showNewForm && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #F37338',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 24,
            boxShadow: '0 8px 24px rgba(243, 115, 56, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
              Formulir Pengajuan Konsultasi Kuku
            </h3>
            <span style={{ fontSize: 12, color: '#F37338', fontWeight: 600 }}>
              ID Otomatis Digenerate
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 5 }}>
                Nama Desain / Referensi Gaya *
              </label>
              <input
                type="text"
                placeholder="Contoh: Milky French Classic, Blush Chrome Gradient..."
                value={newDesign}
                onChange={(e) => setNewDesign(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: 13,
                  border: '1px solid #EAE6E1',
                  borderRadius: 10,
                  background: '#F3F0EE',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 5 }}>
                Variasi Kuku (Bentuk &amp; Panjang)
              </label>
              <input
                type="text"
                placeholder="Contoh: Hard, Almond - Medium atau Oval - Short"
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: 13,
                  border: '1px solid #EAE6E1',
                  borderRadius: 10,
                  background: '#F3F0EE',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 5 }}>
                Catatan Tambahan / Preferensi
              </label>
              <textarea
                placeholder="Tuliskan jika ada acara khusus, preferensi warna, atau bentuk jari tertentu..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: 13,
                  border: '1px solid #EAE6E1',
                  borderRadius: 10,
                  background: '#F3F0EE',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                className="btn-secondary"
                style={{ padding: '9px 20px', fontSize: 13 }}
                onClick={() => setShowNewForm(false)}
              >
                Batal
              </button>
              <button
                className="btn-primary"
                style={{ padding: '9px 24px', fontSize: 13 }}
                onClick={handleSubmitNew}
                disabled={!newDesign.trim()}
              >
                Kirim Pengajuan Konsultasi →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Baris Tab Status Horizontal */}
      <div className="profil-status-tabs" style={{ marginBottom: 16 }}>
        {TAB_LIST.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key as OrderStatus | 'semua')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#F37338' : '#696969',
                borderBottom: isActive ? '2.5px solid #F37338' : '2.5px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease, border-color 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar Full-Width dengan background lembut #F3F0EE */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#696969',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSearch size={16} />
        </span>
        <input
          type="text"
          placeholder="Cari berdasarkan ID Konsultasi, nama desain, atau variasi kuku..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 14px 13px 42px',
            fontSize: 13,
            border: '1px solid #EAE6E1',
            borderRadius: 12,
            background: '#F3F0EE',
            color: '#141413',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#696969',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Daftar Kartu Riwayat Konsultasi */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '54px 20px',
            color: '#696969',
            fontSize: 14,
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE6E1',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#D1CDC7' }}>
            <IconEmptyBox size={40} />
          </div>
          <p style={{ fontWeight: 700, color: '#141413', fontSize: 16, marginBottom: 6 }}>
            Tidak ada riwayat konsultasi
          </p>
          <p style={{ maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
            {searchQuery
              ? `Tidak ditemukan hasil yang cocok dengan "${searchQuery}".`
              : 'Belum ada pesanan pada kategori status ini. Mulai ajukan desain kuku kustom Anda sekarang!'}
          </p>
          {!showNewForm && (
            <button
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: 13 }}
              onClick={() => setShowNewForm(true)}
            >
              + Konsultasi Baru Sekarang
            </button>
          )}
        </div>
      ) : (
        filtered.map((order) => (
          <OrderCardItem
            key={order.consultationId}
            order={order}
            onOpenDetail={setSelectedDetailOrder}
          />
        ))
      )}

      {/* Modal Konfirmasi Setelah Submit */}
      {submittedOrder && (
        <SubmitConfirmationModal
          order={submittedOrder}
          onClose={() => setSubmittedOrder(null)}
        />
      )}

      {/* Modal Detail Konsultasi */}
      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
        />
      )}
    </div>
  );
}

function AkunTab({
  currentUser,
  userId,
}: {
  currentUser: { name: string; email: string } | null;
  userId: string | null;
}) {
  const [name, setName] = useState(currentUser?.name || 'Sari Dewi');
  const [phone, setPhone] = useState('081298765432');
  const [city, setCity] = useState('Yogyakarta');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
        Akun Saya
      </h2>
      <p style={{ fontSize: 13, color: '#696969', marginBottom: 24 }}>
        Informasi profil pribadi dan ID keanggotaan Anda di dinail.co
      </p>

      {/* ID User Card */}
      {userId && (
        <div
          style={{
            background: '#FFF7F3',
            border: '1.5px solid #FDDCC8',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            maxWidth: 520,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
              ID Pengguna Terdaftar
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#F37338',
                  fontFamily: 'monospace',
                  letterSpacing: '0.04em',
                }}
              >
                {userId}
              </span>
              <CopyButton text={userId} />
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#F37338',
              background: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 999,
              border: '1px solid #FDDCC8',
            }}
          >
            MEMBER TERVERIFIKASI
          </span>
        </div>
      )}

      {/* Form Data Diri */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
        {[
          { label: 'Nama Lengkap', value: name, setter: setName, type: 'text', readOnly: false },
          { label: 'Email Terdaftar', value: currentUser?.email || 'sari@example.com', setter: () => { }, type: 'email', readOnly: true },
          { label: 'Nomor WhatsApp', value: phone, setter: setPhone, type: 'tel', readOnly: false },
          { label: 'Kota / Wilayah', value: city, setter: setCity, type: 'text', readOnly: false },
        ].map((field) => (
          <div key={field.label}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#141413',
                display: 'block',
                marginBottom: 6,
              }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => !field.readOnly && (field.setter as (v: string) => void)(e.target.value)}
              readOnly={field.readOnly}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                border: '1px solid #EAE6E1',
                borderRadius: 10,
                background: field.readOnly ? '#F3F0EE' : '#FFFFFF',
                color: field.readOnly ? '#696969' : '#141413',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: field.readOnly ? 'default' : 'text',
              }}
            />
          </div>
        ))}

        {saved && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 13,
              color: '#15803D',
              fontWeight: 600,
            }}
          >
            ✓ Perubahan data profil berhasil disimpan!
          </div>
        )}

        <button
          className="btn-primary"
          style={{ padding: '13px 32px', fontSize: 14, alignSelf: 'flex-start', marginTop: 4 }}
          onClick={handleSave}
        >
          Simpan Perubahan Profil
        </button>
      </div>
    </div>
  );
}

function NotifikasiTab() {
  const notifs = [
    {
      id: 1,
      icon: <IconBrush size={20} />,
      title: 'Konsultasi kamu sedang diproses tim artist',
      desc: 'DNL-KNS-20261114-01 · Milky French Classic sedang dalam antrean pengerjaan desain kuku.',
      time: '1 jam yang lalu',
    },
    {
      id: 2,
      icon: <IconShoppingBag size={20} />,
      title: 'Desain ACC! Pesanan kamu siap checkout',
      desc: 'DNL-KNS-20261115-03 · Blush Chrome Gradient telah disetujui. Silakan lanjut checkout melalui toko Shopee dinail.co.',
      time: 'Kemarin',
    },
    {
      id: 3,
      icon: <IconSparkle size={20} />,
      title: 'Selamat datang di dinail.co!',
      desc: 'Akun Anda berhasil terhubung. Mulai konsultasi gratis untuk kustomisasi press-on nails impian Anda.',
      time: '5 hari yang lalu',
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
        Notifikasi
      </h2>
      <p style={{ fontSize: 13, color: '#696969', marginBottom: 24 }}>
        Pemberitahuan terkini seputar pesanan dan status konsultasi kuku Anda
      </p>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {notifs.map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              gap: 16,
              padding: '18px 0',
              borderBottom: '1px solid #EAE6E1',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F37338', flexShrink: 0, marginTop: 2 }}>
              {n.icon}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#141413', marginBottom: 4 }}>
                {n.title}
              </p>
              <p style={{ fontSize: 13, color: '#696969', lineHeight: 1.5 }}>
                {n.desc}
              </p>
            </div>
            <span style={{ fontSize: 12, color: '#767676', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {n.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContent() {
  const { currentUser, userId, logout, openModal } = useRole();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialDesignParam = searchParams.get('design') || undefined;

  // Tentukan tab awal (default ke 'konsultasi', atau 'ukuran' jika URL memintanya)
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
    if (tabParam === 'ukuran') return 'ukuran';
    if (tabParam === 'akun') return 'akun';
    if (tabParam === 'notifikasi') return 'notifikasi';
    return 'konsultasi';
  });

  const displayName = currentUser?.name || 'Sari Dewi';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleMenuClick = (key: string) => {
    if (key === 'keluar') {
      logout();
      return;
    }
    setActiveMenu(key as ActiveMenu);
  };

  return (
    <div style={{ background: '#F3F0EE', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '120px 20px 80px' }}>

        {/* State: Belum Login */}
        {!currentUser && (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #EAE6E1',
              maxWidth: 540,
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#F37338' }}>
              <IconUser size={44} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', marginBottom: 10 }}>
              Login untuk Mengakses Profil
            </h2>
            <p style={{ fontSize: 14, color: '#696969', marginBottom: 28, lineHeight: 1.5 }}>
              Masuk dengan akun Anda untuk melihat ID User, menyimpan ukuran kuku, dan memantau riwayat pesanan.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '13px 34px', fontSize: 15 }}
              onClick={openModal}
            >
              Masuk / Daftar Sekarang →
            </button>
          </div>
        )}

        {/* State: Sudah Login (Layout 2 Kolom) */}
        {currentUser && (
          <div className="profil-layout">

            {/* ── 1. SIDEBAR KIRI (~240px–260px di Desktop) ── */}
            <aside className="profil-sidebar">

              {/* Header Profil: Avatar bulat di kiri, nama user, Ubah Profil, badge ID User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#F37338',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  {displayInitial}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#141413',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {displayName}
                  </p>
                  <button
                    onClick={() => setActiveMenu('akun')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 12,
                      color: '#696969',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'color 0.2s',
                    }}
                  >
                    <IconEdit size={12} />
                    <span>Ubah Profil</span>
                  </button>
                </div>
              </div>

              {/* Badge ID User */}
              {userId && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                    background: '#FFF7F3',
                    border: '1px solid #FDDCC8',
                    borderRadius: 8,
                    padding: '7px 10px',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#767676', fontWeight: 500 }}>ID:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#F37338',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {userId}
                    </span>
                  </div>
                  <CopyButton text={userId} />
                </div>
              )}

              {/* Garis Pembatas Tipis (1px solid #EAE6E1) */}
              <div style={{ height: 1, background: '#EAE6E1', marginBottom: 18 }} />

              {/* Menu Navigasi Vertikal: Akun Saya -> Ukuran Kuku Saya -> Konsultasi Saya -> Notifikasi -> Keluar */}
              <nav className="profil-nav-menu">
                {MENU_ITEMS.map((item) => {
                  const isActive = activeMenu === item.key;
                  const isLogout = item.key === 'keluar';
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleMenuClick(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        background: isActive ? '#FFF7F3' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 400,
                        color: isLogout ? '#DC2626' : isActive ? '#F37338' : '#141413',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'background-color 0.2s, color 0.2s',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'currentColor' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && !isLogout && (
                        <span style={{ marginLeft: 'auto', color: '#F37338', fontSize: 12, fontWeight: 700 }}>
                          ›
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick links ke Catalog & Price List */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #EAE6E1' }}>
                <Link
                  href="/catalog"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#696969',
                    textDecoration: 'none',
                    padding: '5px 0',
                    transition: 'color 0.2s',
                  }}
                >
                  → Lihat Catalog
                </Link>
                <Link
                  href="/pricelist"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#696969',
                    textDecoration: 'none',
                    padding: '5px 0',
                    transition: 'color 0.2s',
                  }}
                >
                  → Cek Daftar Harga
                </Link>
              </div>
            </aside>

            {/* ── 2. AREA KONTEN KANAN ── */}
            <section className="profil-content">
              {activeMenu === 'akun' && (
                <AkunTab currentUser={currentUser} userId={userId} />
              )}
              {activeMenu === 'ukuran' && (
                <UkuranKukuTab />
              )}
              {activeMenu === 'konsultasi' && (
                <KonsultasiTab initialDesign={initialDesignParam} />
              )}
              {activeMenu === 'notifikasi' && (
                <NotifikasiTab />
              )}
            </section>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F3F0EE' }} />}>
      <ProfileContent />
    </Suspense>
  );
}
