'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';
import { auth } from '@/config/firebase';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

function IconAlertTriangle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconUpload({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

export type OrderStatus =
  | 'menunggu'
  | 'proses'
  | 'siap_checkout'
  | 'selesai'
  | 'dibatalkan'
  | 'Antrian'
  | 'Disetujui'
  | 'Ditolak';

export interface OrderCard {
  consultationId: string;
  userId?: string;
  customerName?: string;
  nailSizeSummary?: string;
  referenceLink?: string;
  submittedAt: string;
  status: OrderStatus;
  serviceType: string;
  designName: string;
  variant: string;
  notes: string;
  estimasiHarga: string;
  photoUrl: string;
  shopeeUrl?: string;
  adminFeedback?: string;
  reviewedAt?: string;
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
  Antrian: 'MENUNGGU REVIEW',
  proses: 'PROSES DESAIN',
  siap_checkout: 'SIAP CHECKOUT',
  Disetujui: 'SIAP CHECKOUT',
  selesai: 'SELESAI',
  dibatalkan: 'DITOLAK',
  Ditolak: 'DITOLAK',
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

const getOrdersStorageKey = (userId?: string | null): string => {
  return userId ? `dinail_consultations_${userId}` : 'dinail_consultations_guest';
};

function loadOrders(userId?: string | null): OrderCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getOrdersStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as OrderCard[];
  } catch { }
  return [];
}

function saveOrders(orders: OrderCard[], userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getOrdersStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(orders));
  } catch { }
}

const LS_KEY_NAIL_SIZE = 'dinail_nail_sizes';

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

function getSavedNailData(): NailSizeData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY_NAIL_SIZE);
    if (raw) {
      const parsed = JSON.parse(raw) as NailSizeData;
      if (parsed && (parsed.updatedAt || parsed.photoUrl)) {
        return parsed;
      }
    }
  } catch { }
  return null;
}

function formatNailSizeSummary(data: NailSizeData): string {
  const { preset, leftHand, rightHand } = data;
  const leftStr = `${leftHand.thumb}-${leftHand.index}-${leftHand.middle}-${leftHand.ring}-${leftHand.pinky} mm`;
  const rightStr = `${rightHand.thumb}-${rightHand.index}-${rightHand.middle}-${rightHand.ring}-${rightHand.pinky} mm`;

  if (preset !== 'Custom') {
    return `Size ${preset} (${leftStr})`;
  }
  if (leftStr === rightStr) {
    return `Custom (${leftStr})`;
  }
  return `Custom (Kiri: ${leftStr} · Kanan: ${rightStr})`;
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
            {order.customerName && <p><strong>Pemesan:</strong> {order.customerName}</p>}
            <p><strong>Layanan:</strong> {order.designName}</p>
            {order.nailSizeSummary && <p><strong>Ukuran Kuku:</strong> {order.nailSizeSummary}</p>}
            {order.variant && order.variant !== 'Custom' && <p><strong>Variasi:</strong> {order.variant}</p>}
            {order.referenceLink && (
              <p style={{ wordBreak: 'break-all' }}>
                <strong>Link Referensi:</strong>{' '}
                <a
                  href={order.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#F37338', textDecoration: 'underline' }}
                >
                  {order.referenceLink}
                </a>
              </p>
            )}
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
              unoptimized={order.photoUrl.startsWith('data:')}
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
            {order.customerName && (
              <p style={{ fontSize: 13, color: '#696969', marginBottom: 3 }}>
                Pemesan: <strong>{order.customerName}</strong>
              </p>
            )}
            {order.nailSizeSummary && (
              <p style={{ fontSize: 13, color: '#696969', marginBottom: 3 }}>
                Ukuran: <strong>{order.nailSizeSummary}</strong>
              </p>
            )}
            {order.variant && order.variant !== 'Custom' && (
              <p style={{ fontSize: 13, color: '#696969', marginBottom: 4 }}>
                <strong>Variasi:</strong> {order.variant}
              </p>
            )}
            {order.referenceLink && (
              <p style={{ fontSize: 12, color: '#696969', marginBottom: 4, wordBreak: 'break-all' }}>
                <strong>Link:</strong>{' '}
                <a
                  href={order.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#F37338', textDecoration: 'underline' }}
                >
                  {order.referenceLink}
                </a>
              </p>
            )}
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

        {/* Admin Feedback */}
        {order.adminFeedback && (
          <div
            style={{
              background: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '#FFF1F2' : '#F0FDF4',
              border: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '1px solid #FECDD3' : '1px solid #BBF7D0',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#141413',
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '#E11D48' : '#16A34A',
                display: 'block',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Feedback dari Nail Artist / Admin:
            </span>
            <p style={{ margin: 0, fontWeight: 500 }}>
              &ldquo;{order.adminFeedback}&rdquo;
            </p>
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
            {(order.status === 'siap_checkout' || order.status === 'Disetujui') && order.shopeeUrl && (
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
            unoptimized={order.photoUrl.startsWith('data:')}
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
          {order.customerName && (
            <p style={{ fontSize: 12, color: '#696969', marginBottom: 2 }}>
              Pemesan: <strong>{order.customerName}</strong>
            </p>
          )}
          {order.nailSizeSummary && (
            <p style={{ fontSize: 12, color: '#696969', marginBottom: 2 }}>
              Ukuran: <strong>{order.nailSizeSummary}</strong>
            </p>
          )}
          {order.variant && order.variant !== 'Custom' && (
            <p style={{ fontSize: 13, color: '#696969', marginBottom: 4 }}>
              Variasi: <strong>{order.variant}</strong>
            </p>
          )}
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

          {order.adminFeedback && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '#FFF1F2' : '#F0FDF4',
                border: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '1px solid #FECDD3' : '1px solid #BBF7D0',
                fontSize: 12,
                color: order.status === 'dibatalkan' || order.status === 'Ditolak' ? '#9F1239' : '#166534',
                lineHeight: 1.4,
              }}
            >
              <strong>Feedback Admin:</strong> &ldquo;{order.adminFeedback}&rdquo;
            </div>
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

        {(order.status === 'siap_checkout' || order.status === 'Disetujui') && order.shopeeUrl && (
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

  const FINGERS: { key: keyof NailFingers; label: string }[] = [
    { key: 'thumb', label: 'Ibu Jari' },
    { key: 'index', label: 'Telunjuk' },
    { key: 'middle', label: 'Jari Tengah' },
    { key: 'ring', label: 'Jari Manis' },
    { key: 'pinky', label: 'Kelingking' },
  ];

  return (
    <div>
      {/* 1. Header Bagian */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', margin: 0 }}>
          Ukuran Kuku Saya
        </h2>
        <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0', lineHeight: 1.5 }}>
          Simpan data ukuran kuku presisi untuk memastikan press-on nails pas dan nyaman di setiap jarimu.
        </p>
      </div>

      {/* Ringkasan Status Ukuran Minimalis */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: '1px solid #EAE6E1',
          fontSize: 13,
          color: '#141413',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#F37338',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#696969' }}>Ukuran aktif:</span>
        <span style={{ fontWeight: 600 }}>
          {nailData.preset === 'Custom' ? 'Kustom' : `Size ${nailData.preset}`} ({nailData.leftHand.thumb}-{nailData.leftHand.index}-{nailData.leftHand.middle}-{nailData.leftHand.ring}-{nailData.leftHand.pinky} mm)
        </span>
        {nailData.updatedAt && (
          <span style={{ fontSize: 12, color: '#767676', marginLeft: 'auto' }}>
            Diperbarui {nailData.updatedAt}
          </span>
        )}
      </div>

      {/* 2. Pilihan Preset Cepat (Flat Minimalis) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['XS', 'S', 'M', 'L', 'Custom'] as const).map((sz) => {
            const isSelected = nailData.preset === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSelectPreset(sz)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: isSelected ? '1px solid #141413' : '1px solid #E5E2DC',
                  background: isSelected ? '#141413' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#555555',
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{sz === 'Custom' ? 'Kustom' : `Size ${sz}`}</span>
                {sz !== 'Custom' && (
                  <span style={{ fontSize: 11, opacity: isSelected ? 0.8 : 0.6 }}>
                    {SIZE_PRESETS[sz].thumb}/{SIZE_PRESETS[sz].index}/{SIZE_PRESETS[sz].middle}/{SIZE_PRESETS[sz].ring}/{SIZE_PRESETS[sz].pinky}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detail Ukuran Per Jari (Tabel / List Flat 2 Kolom) */}
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
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#141413', textTransform: 'uppercase' }}>
            Detail Ukuran Lebar Kuku Per Jari (Milimeter)
          </span>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              color: '#141413',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={nailData.syncHands}
              onChange={(e) => handleToggleSync(e.target.checked)}
              style={{ accentColor: '#F37338', width: 15, height: 15 }}
            />
            <span>Samakan Tangan Kanan dengan Kiri</span>
          </label>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 36,
          }}
        >
          {/* Kolom Tangan Kiri */}
          <div>
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #141413', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#141413' }}>
                Tangan Kiri
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FINGERS.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #EAE6E1',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#141413', fontWeight: 500 }}>
                    {f.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      value={nailData.leftHand[f.key]}
                      onChange={(e) => handleFingerChange('leftHand', f.key, Number(e.target.value))}
                      style={{
                        width: 48,
                        padding: '4px 0',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        border: 'none',
                        borderBottom: '1px solid #D5D0C8',
                        background: 'transparent',
                        color: '#141413',
                        outline: 'none',
                        borderRadius: 0,
                        fontFamily: 'inherit',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#767676' }}>mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Tangan Kanan */}
          <div style={{ opacity: nailData.syncHands ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #141413', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#141413' }}>
                Tangan Kanan
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FINGERS.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #EAE6E1',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#141413', fontWeight: 500 }}>
                    {f.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      value={nailData.rightHand[f.key]}
                      disabled={nailData.syncHands}
                      onChange={(e) => handleFingerChange('rightHand', f.key, Number(e.target.value))}
                      style={{
                        width: 48,
                        padding: '4px 0',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        border: 'none',
                        borderBottom: '1px solid #D5D0C8',
                        background: 'transparent',
                        color: '#141413',
                        outline: 'none',
                        borderRadius: 0,
                        fontFamily: 'inherit',
                        cursor: nailData.syncHands ? 'not-allowed' : 'text',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#767676' }}>mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Pengecekan Ukuran Kuku via Foto */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #EAE6E1' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
            Pengecekan Ukuran Kuku via Foto
          </h3>
          <p style={{ fontSize: 13, color: '#696969', marginTop: 4, lineHeight: 1.5 }}>
            Unggah foto kuku Anda bersama koin pecahan Rp 500 atau penggaris agar nail artist kami dapat memverifikasi skala kelengkungan dan ukuran kuku asli secara presisi.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 36,
            alignItems: 'start',
          }}
        >
          {/* Panduan Foto */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#141413', marginBottom: 14 }}>
              Panduan Pengambilan Foto Presisi:
            </h4>
            <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#555555', lineHeight: 1.5 }}>
              <li>Posisikan jari tangan mendatar di atas permukaan meja yang rata.</li>
              <li>Letakkan <strong>koin Rp 500</strong> atau penggaris tepat di samping kuku sebagai pembanding skala.</li>
              <li>Ambil foto tegak lurus (90 derajat tepat dari atas kuku).</li>
              <li>Pastikan pencahayaan terang dan foto tidak buram (buram).</li>
            </ol>
          </div>

          {/* Area Upload Foto */}
          <div
            style={{
              border: '1px dashed #D5D0C8',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 180,
            }}
          >
            {nailData.photoUrl ? (
              <div>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '0 auto 12px',
                    border: '1px solid #EAE6E1',
                  }}
                >
                  <Image
                    src={nailData.photoUrl}
                    alt="Pratinjau Foto Ukuran Kuku"
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>
                  Foto Ukuran Kuku Berhasil Diunggah
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      color: '#141413',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Ganti Foto
                  </button>
                  <span style={{ color: '#D5D0C8' }}>·</span>
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#767676' }}>
                  <IconCamera size={26} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#141413', marginBottom: 2 }}>
                  Unggah Foto Jari &amp; Kuku Anda
                </p>
                <p style={{ fontSize: 12, color: '#767676', marginBottom: 14 }}>
                  Mendukung format JPG atau PNG (Maks. 5 MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent',
                    border: '1px solid #D5D0C8',
                    borderRadius: 8,
                    padding: '7px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#141413',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
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
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #EAE6E1' }}>
        {saveSuccess && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 13,
              color: '#15803D',
              fontWeight: 600,
              marginBottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✓ Data ukuran kuku dan foto berhasil disimpan ke profil Anda!</span>
          </div>
        )}

        <div>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '12px 30px', fontSize: 14, fontWeight: 600 }}
            onClick={handleSave}
          >
            Simpan Ukuran Kuku
          </button>
        </div>
      </div>
    </div>
  );
}

function KonsultasiTab({
  userId,
  userProfileName,
  initialDesign,
  onNavigateToUkuran,
}: {
  userId?: string | null;
  userProfileName?: string;
  initialDesign?: string;
  onNavigateToUkuran?: () => void;
}) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderCard[]>(() => loadOrders(userId));
  const [showNewForm, setShowNewForm] = useState(Boolean(initialDesign));

  // Form states
  const [customerName, setCustomerName] = useState(userProfileName || 'Sari Dewi');
  const [newNotes, setNewNotes] = useState('');
  const [refLink, setRefLink] = useState('');
  const [refPhotoUrl, setRefPhotoUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Saved nail size state
  const [savedNailData, setSavedNailData] = useState<NailSizeData | null>(() => getSavedNailData());

  // Modals state
  const [submittedOrder, setSubmittedOrder] = useState<OrderCard | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderCard | null>(null);

  useEffect(() => {
    const fetchUserConsultations = async () => {
      try {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const headers: Record<string, string> = {};
        if (idToken) headers.Authorization = `Bearer ${idToken}`;

        const res = await fetch(`${BACKEND_URL}/api/v1/consultations/me`, { headers });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: OrderCard[] = json.data.map((item: any) => {
            const createdAtDate = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateLabel = createdAtDate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeLabel = createdAtDate.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return {
              consultationId: item.consultationCode || item.id,
              userId: item.userId,
              customerName: item.user?.name || userProfileName || 'Customer',
              nailSizeSummary: item.user?.savedSizePreset ? `Size ${item.user.savedSizePreset}` : 'Size M',
              referenceLink: item.referenceLink || undefined,
              submittedAt: `${dateLabel}, ${timeLabel}`,
              status: (item.status?.toLowerCase() || 'menunggu') as OrderStatus,
              serviceType: item.serviceType || 'Custom Press-On Nails',
              designName: item.designName || 'Custom Press-On Nails',
              variant: item.variant || 'Custom',
              notes: item.customerNotes || '',
              estimasiHarga: item.estimatedPrice || 'Menunggu estimasi',
              photoUrl: item.photoUrl || DINAIL_ASSETS.catalogPreviews[0],
              shopeeUrl: item.shopeeUrl || undefined,
              adminFeedback: item.adminFeedback || undefined,
              reviewedAt: item.reviewedAt || undefined,
            };
          });

          const backendIds = new Set(mapped.map((m) => m.consultationId));
          const localOnly = loadOrders(userId).filter((l) => !backendIds.has(l.consultationId));
          setOrders([...mapped, ...localOnly]);
        }
      } catch {
        // Fallback to local storage
      }
    };

    fetchUserConsultations();
  }, [userId, userProfileName]);

  // Filter real-time berdasarkan Tab Status dan Search Bar
  const filtered = orders.filter((o) => {
    const matchStatus =
      activeStatus === 'semua' ||
      o.status === activeStatus ||
      (activeStatus === 'menunggu' && o.status === 'Antrian') ||
      (activeStatus === 'siap_checkout' && o.status === 'Disetujui') ||
      (activeStatus === 'dibatalkan' && o.status === 'Ditolak');
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.consultationId.toLowerCase().includes(q) ||
      o.designName.toLowerCase().includes(q) ||
      o.variant.toLowerCase().includes(q) ||
      o.serviceType.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleRefFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5 MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format file harus berupa JPG, PNG, atau WEBP');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRefPhotoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveRefPhoto = () => {
    setRefPhotoUrl(null);
    setUploadError(null);
    if (refFileInputRef.current) {
      refFileInputRef.current.value = '';
    }
  };

  const handleSubmitNew = () => {
    if (!customerName.trim() || !savedNailData) return;

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
      userId: userId || undefined,
      customerName: customerName.trim(),
      nailSizeSummary: formatNailSizeSummary(savedNailData),
      referenceLink: refLink.trim() || undefined,
      submittedAt: `${dateLabel}, ${timeLabel}`,
      status: 'menunggu',
      serviceType: 'Custom Press-On Nails',
      designName: initialDesign?.trim() || 'Custom Press-On Nails',
      variant: 'Custom',
      notes: newNotes.trim(),
      estimasiHarga: 'Menunggu estimasi',
      photoUrl: refPhotoUrl || DINAIL_ASSETS.catalogPreviews[0],
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated, userId);

    // Persist consultation to backend database
    (async () => {
      try {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        await fetch(`${BACKEND_URL}/api/v1/consultations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            consultationCode: newOrder.consultationId,
            designName: newOrder.designName,
            serviceType: newOrder.serviceType,
            variant: newOrder.variant,
            referenceLink: newOrder.referenceLink,
            photoUrl: newOrder.photoUrl,
            customerNotes: newOrder.notes,
            estimatedPrice: newOrder.estimasiHarga,
            customerName: newOrder.customerName,
            userId: newOrder.userId,
          }),
        });
      } catch (err) {
        console.error('Failed to sync consultation to backend database:', err);
      }
    })();

    // Open confirmation modal
    setSubmittedOrder(newOrder);

    // Reset form
    setShowNewForm(false);
    setNewNotes('');
    setRefLink('');
    setRefPhotoUrl(null);
    if (refFileInputRef.current) refFileInputRef.current.value = '';
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
          onClick={() => {
            setSavedNailData(getSavedNailData());
            setShowNewForm((v) => !v);
          }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
              Formulir Pengajuan Konsultasi Kuku
            </h3>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              aria-label="Tutup Form"
              style={{
                background: '#F3F0EE',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#696969',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1. Field Nama Pemesan */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                Nama Lengkap Pemesan *
              </label>
              <input
                type="text"
                placeholder="Nama pemesan..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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

            {/* 2. Bagian Ukuran Kuku Tersimpan (Prerequisite) */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                Ukuran Kuku Tersimpan *
              </label>
              {savedNailData ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#F3F0EE',
                    borderRadius: 10,
                    border: '1px solid #EAE6E1',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#F37338',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#141413', fontWeight: 600 }}>
                      Ukuran aktif:
                    </span>
                    <span style={{ fontSize: 13, color: '#141413' }}>
                      {formatNailSizeSummary(savedNailData)}
                    </span>
                  </div>
                  {onNavigateToUkuran && (
                    <button
                      type="button"
                      onClick={onNavigateToUkuran}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#F37338',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit',
                        textDecoration: 'underline',
                      }}
                    >
                      Ubah Ukuran
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    border: '1.5px solid #F37338',
                    backgroundColor: '#FFF7F3',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240 }}>
                    <span style={{ color: '#F37338', flexShrink: 0, display: 'inline-flex' }}>
                      <IconAlertTriangle size={20} />
                    </span>
                    <p style={{ fontSize: 13, color: '#141413', margin: 0, lineHeight: 1.5 }}>
                      Anda belum menyimpan ukuran kuku. Silakan lakukan pengukuran kuku terlebih dahulu sebelum mengajukan konsultasi.
                    </p>
                  </div>
                  {onNavigateToUkuran && (
                    <button
                      type="button"
                      onClick={onNavigateToUkuran}
                      className="btn-primary"
                      style={{
                        padding: '8px 18px',
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ukur Kuku Sekarang →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Bagian Referensi Desain (Link & Upload File) */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                Referensi Desain (Link &amp; Upload File)
              </label>

              {/* Opsi 1: Link URL */}
              <div style={{ marginBottom: 12 }}>
                <input
                  type="url"
                  placeholder="Tempel link Pinterest, Instagram, atau referensi lainnya (opsional)"
                  value={refLink}
                  onChange={(e) => setRefLink(e.target.value)}
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

              {/* Opsi 2: Upload File Gambar */}
              <div
                style={{
                  border: '1px dashed #D5D0C8',
                  borderRadius: 12,
                  padding: '18px 20px',
                  textAlign: 'center',
                  background: 'transparent',
                }}
              >
                {refPhotoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid #EAE6E1',
                          background: '#F3F0EE',
                        }}
                      >
                        <Image
                          src={refPhotoUrl}
                          alt="Thumbnail Referensi"
                          width={64}
                          height={64}
                          unoptimized
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', margin: 0 }}>
                          Foto referensi berhasil diunggah
                        </p>
                        <p style={{ fontSize: 11, color: '#767676', margin: '2px 0 0' }}>
                          Format gambar tersimpan
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveRefPhoto}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 12,
                        color: '#DC2626',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontFamily: 'inherit',
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: '#767676' }}>
                      <IconUpload size={22} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#141413', margin: '0 0 2px' }}>
                      Unggah File Gambar Referensi
                    </p>
                    <p style={{ fontSize: 11, color: '#767676', margin: '0 0 10px' }}>
                      JPG, PNG, atau WEBP (Maks. 5 MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => refFileInputRef.current?.click()}
                      style={{
                        background: 'transparent',
                        border: '1px solid #D5D0C8',
                        borderRadius: 8,
                        padding: '6px 16px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#141413',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Pilih File Gambar
                    </button>
                  </div>
                )}

                <input
                  ref={refFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleRefFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {uploadError && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6, margin: '6px 0 0' }}>
                  {uploadError}
                </p>
              )}
            </div>

            {/* 4. Catatan Tambahan / Preferensi */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
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

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '9px 20px', fontSize: 13 }}
                onClick={() => setShowNewForm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  padding: '9px 24px',
                  fontSize: 13,
                  opacity: (!savedNailData || !customerName.trim()) ? 0.5 : 1,
                  cursor: (!savedNailData || !customerName.trim()) ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSubmitNew}
                disabled={!savedNailData || !customerName.trim()}
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
            padding: '60px 24px',
            color: '#696969',
            fontSize: 14,
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #EAE6E1',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#FFF7F3',
              border: '1.5px solid #FDDCC8',
              color: '#F37338',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: '#141413', fontSize: 18, marginBottom: 8 }}>
            Belum ada riwayat konsultasi
          </p>
          <p style={{ maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.55, fontSize: 13, color: '#696969' }}>
            {searchQuery
              ? `Tidak ditemukan riwayat konsultasi yang cocok dengan kata kunci "${searchQuery}".`
              : activeStatus !== 'semua'
              ? `Belum ada pesanan pada status "${STATUS_LABEL[activeStatus]}". Mulai konsultasi desain kuku impianmu untuk mendapatkan rekomendasi tier, bentuk, dan estimasi harga.`
              : 'Mulai konsultasi desain kuku impianmu untuk mendapatkan rekomendasi tier, bentuk, dan estimasi harga.'}
          </p>
          <button
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: 14 }}
            onClick={() => {
              setSavedNailData(getSavedNailData());
              setShowNewForm(true);
            }}
          >
            + Mulai Konsultasi
          </button>
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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
}

const LS_KEY_PROFILE = 'dinail_user_profile';

const loadProfile = (fallbackUser: { name: string; email: string; phone?: string | null } | null): UserProfile => {
  const defaultProfile: UserProfile = {
    name: fallbackUser?.name || 'Sari Dewi',
    email: fallbackUser?.email || 'sari@example.com',
    phone: fallbackUser?.phone || '081298765432',
    city: 'Yogyakarta',
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = localStorage.getItem(LS_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || defaultProfile.name,
        email: fallbackUser?.email || parsed.email || defaultProfile.email,
        phone: parsed.phone || defaultProfile.phone,
        city: parsed.city || defaultProfile.city,
      };
    }
  } catch { }
  return defaultProfile;
};

const saveProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(LS_KEY_PROFILE, JSON.stringify(profile));
  } catch { }
};

function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: { name: string; phone: string; city: string }) => void;
}) {
  const [mode, setMode] = useState<'edit' | 'confirm'>('edit');
  const [draftName, setDraftName] = useState(profile.name);
  const [draftPhone, setDraftPhone] = useState(profile.phone);
  const [draftCity, setDraftCity] = useState(profile.city);
  const [nameError, setNameError] = useState('');

  if (!isOpen) return null;

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) {
      setNameError('Nama lengkap wajib diisi');
      return;
    }
    setNameError('');
    setMode('confirm');
  };

  const handleConfirmSave = () => {
    onSave({
      name: draftName.trim(),
      phone: draftPhone.trim(),
      city: draftCity.trim(),
    });
  };

  const handleCancel = () => {
    setMode('edit');
    setNameError('');
    onClose();
  };

  return (
    <div
      onClick={handleCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        backgroundColor: 'rgba(20, 20, 19, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 28px 24px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          position: 'relative',
        }}
      >
        {mode === 'edit' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#141413', margin: 0 }}>
                  Ubah Profil
                </h3>
                <p style={{ fontSize: 13, color: '#696969', marginTop: 4, margin: 0 }}>
                  Perbarui informasi kontak dan data diri akun Anda
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Tutup"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#767676',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProceedToConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                  Nama Lengkap <span style={{ color: '#F37338' }}>*</span>
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Masukkan nama lengkap"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: 14,
                    border: nameError ? '1.5px solid #EF4444' : '1px solid #EAE6E1',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#141413',
                    background: '#FFFFFF',
                  }}
                />
                {nameError && (
                  <span style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'block' }}>
                    {nameError}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: 14,
                    border: '1px solid #EAE6E1',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#767676',
                    background: '#F3F0EE',
                    cursor: 'not-allowed',
                  }}
                />
                <span style={{ fontSize: 11, color: '#767676', marginTop: 4, display: 'block' }}>
                  Alamat email terhubung tidak dapat diubah
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={draftPhone}
                  onChange={(e) => setDraftPhone(e.target.value)}
                  placeholder="Contoh: 081298765432"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: 14,
                    border: '1px solid #EAE6E1',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#141413',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#141413', display: 'block', marginBottom: 6 }}>
                  Kota / Wilayah
                </label>
                <input
                  type="text"
                  value={draftCity}
                  onChange={(e) => setDraftCity(e.target.value)}
                  placeholder="Contoh: Yogyakarta"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: 14,
                    border: '1px solid #EAE6E1',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#141413',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 10,
                  paddingTop: 16,
                  borderTop: '1px solid #EAE6E1',
                }}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: 'transparent',
                    border: '1px solid #EAE6E1',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#141413',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '10px 22px',
                    fontSize: 14,
                  }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 4px' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#FFF7F3',
                border: '1.5px solid #FDDCC8',
                color: '#F37338',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
              Konfirmasi Perubahan Profil
            </h3>
            <p style={{ fontSize: 13, color: '#696969', lineHeight: 1.5, marginBottom: 20 }}>
              Apakah Anda yakin ingin menyimpan perubahan data profil ini?
            </p>

            <div
              style={{
                background: '#FAF8F5',
                border: '1px solid #EAE6E1',
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'left',
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#767676' }}>Nama Lengkap</span>
                <span style={{ fontWeight: 600, color: '#141413' }}>{draftName || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#767676' }}>WhatsApp</span>
                <span style={{ fontWeight: 600, color: '#141413' }}>{draftPhone || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#767676' }}>Kota / Wilayah</span>
                <span style={{ fontWeight: 600, color: '#141413' }}>{draftCity || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setMode('edit')}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #EAE6E1',
                  borderRadius: 10,
                  padding: '11px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#141413',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmSave}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  fontSize: 14,
                }}
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AkunTab({
  profile,
  userId,
  onOpenEdit,
}: {
  profile: UserProfile;
  userId: string | null;
  onOpenEdit: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
        Akun Saya
      </h2>
      <p style={{ fontSize: 13, color: '#696969', marginBottom: 24 }}>
        Informasi profil pribadi dan ID keanggotaan Anda di dinail.co
      </p>

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
            maxWidth: 680,
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

      {/* Flat List Data Profil */}
      <div style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'ID User', value: userId || 'DNL-USR-8492', isMonospace: true },
            { label: 'Nama Lengkap', value: profile.name },
            { label: 'Email Terdaftar', value: profile.email, note: 'Email Utama' },
            { label: 'Nomor WhatsApp', value: profile.phone || '-' },
            { label: 'Kota / Wilayah', value: profile.city || '-' },
          ].map((item, idx, arr) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #EAE6E1',
                gap: 16,
              }}
            >
              <span style={{ fontSize: 13, color: '#696969', flexShrink: 0 }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#141413',
                    fontFamily: item.isMonospace ? 'monospace' : 'inherit',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.value}
                </span>
                {item.note && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#16A34A',
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      padding: '2px 6px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Ubah Profil langsung di bawah list informasi */}
        <div style={{ marginTop: 28 }}>
          <button
            className="btn-primary"
            onClick={onOpenEdit}
            style={{
              padding: '12px 28px',
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconEdit size={14} />
            <span>Ubah Profil</span>
          </button>
        </div>
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

  // Tentukan tab awal (default ke 'akun', atau sesuai parameter URL ?tab= atau ?design=)
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
    if (tabParam === 'konsultasi' || initialDesignParam) return 'konsultasi';
    if (tabParam === 'ukuran') return 'ukuran';
    if (tabParam === 'notifikasi') return 'notifikasi';
    return 'akun';
  });

  const [profile, setProfile] = useState<UserProfile>(() => loadProfile(currentUser));
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayName = profile.name || currentUser?.name || 'Sari Dewi';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const photoUrl = currentUser?.photoUrl;

  const handleSaveProfile = (updated: { name: string; phone: string; city: string }) => {
    const newProfile: UserProfile = {
      ...profile,
      name: updated.name,
      phone: updated.phone,
      city: updated.city,
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    setIsEditProfileOpen(false);
    setToastMessage('Profil berhasil diperbarui');
    setTimeout(() => {
      setToastMessage((prev) => (prev === 'Profil berhasil diperbarui' ? null : prev));
    }, 3000);
  };

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
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={displayName}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
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
                )}
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
                    onClick={() => {
                      setActiveMenu('akun');
                      setIsEditProfileOpen(true);
                    }}
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
                <Link
                  href="/admin"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#F37338',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '5px 0',
                    transition: 'opacity 0.2s',
                  }}
                >
                  → Dashboard Admin
                </Link>
              </div>
            </aside>

            {/* ── 2. AREA KONTEN KANAN ── */}
            <section className="profil-content">
              {activeMenu === 'akun' && (
                <AkunTab
                  profile={profile}
                  userId={userId}
                  onOpenEdit={() => setIsEditProfileOpen(true)}
                />
              )}
              {activeMenu === 'ukuran' && (
                <UkuranKukuTab />
              )}
              {activeMenu === 'konsultasi' && (
                <KonsultasiTab
                  key={`${userId || 'guest'}-${profile.name}`}
                  userId={userId}
                  userProfileName={profile.name}
                  initialDesign={initialDesignParam}
                  onNavigateToUkuran={() => setActiveMenu('ukuran')}
                />
              )}
              {activeMenu === 'notifikasi' && (
                <NotifikasiTab />
              )}
            </section>

          </div>
        )}

        {/* Modal Ubah Profil dengan Dialog Konfirmasi */}
        <EditProfileModal
          key={`${isEditProfileOpen}-${profile.name}-${profile.phone}-${profile.city}`}
          isOpen={isEditProfileOpen}
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Notifikasi Toast Berhasil */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 10003,
              background: '#141413',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(20, 20, 19, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{toastMessage}</span>
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
