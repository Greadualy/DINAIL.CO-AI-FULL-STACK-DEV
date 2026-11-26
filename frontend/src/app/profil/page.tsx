'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Skeleton from '@/components/Skeleton';
import { useRole } from '@/context/RoleContext';
import { DINAIL_ASSETS } from '@/constants/assets';
import { auth } from '@/config/firebase';
import {
  analyzeNailPhotos,
  compressImageToDataUrl,
  formatNailSizeSummary,
  getNailSizeData,
  saveNailSizeData,
} from '@/services/nailSizeService';
import { createConsultation } from '@/services/consultationService';
import type { ConsultationNailPhotos, NailAIAnalysisResult, NailSizeData } from '@/types';

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
  nailPhotos?: ConsultationNailPhotos;
  aiConfidenceScore?: number;
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

export type ActiveMenu = 'akun' | 'ukuran' | 'konsultasi';

export interface NailFingers {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export type SizePreset = 'XS' | 'S' | 'M' | 'L' | 'Custom';

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

const STATUS_LABEL: Record<string, string> = {
  menunggu: 'MENUNGGU REVIEW',
  Antrian: 'MENUNGGU REVIEW',
  PENDING: 'MENUNGGU REVIEW',
  pending: 'MENUNGGU REVIEW',
  proses: 'PROSES DESAIN',
  IN_PROGRESS: 'PROSES DESAIN',
  in_progress: 'PROSES DESAIN',
  siap_checkout: 'SIAP CHECKOUT',
  Disetujui: 'SIAP CHECKOUT',
  disetujui: 'SIAP CHECKOUT',
  CONFIRMED: 'SIAP CHECKOUT',
  confirmed: 'SIAP CHECKOUT',
  selesai: 'SELESAI',
  COMPLETED: 'SELESAI',
  completed: 'SELESAI',
  dibatalkan: 'DITOLAK',
  Ditolak: 'DITOLAK',
  CANCELLED: 'DITOLAK',
  cancelled: 'DITOLAK',
};

const TAB_LIST: { key: OrderStatus | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: 'Menunggu Review' },
  { key: 'proses', label: 'Proses Desain' },
  { key: 'siap_checkout', label: 'Siap Checkout' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
];

// Urutan Menu: Akun Saya -> Ukuran Kuku Saya -> Konsultasi Saya -> Keluar
const MENU_ITEMS: { key: ActiveMenu | 'keluar'; label: string; icon: React.ReactNode }[] = [
  { key: 'akun', label: 'Akun Saya', icon: <IconUser /> },
  { key: 'ukuran', label: 'Ukuran Kuku Saya', icon: <IconRuler /> },
  { key: 'konsultasi', label: 'Konsultasi Saya', icon: <IconConsultation /> },
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

function loadNailData(userId?: string | null): NailSizeData {
  return getNailSizeData(userId) || DEFAULT_NAIL_DATA;
}

function saveNailData(data: NailSizeData, userId?: string | null) {
  saveNailSizeData(data, userId);
}

function getSavedNailData(userId?: string | null): NailSizeData | null {
  const parsed = getNailSizeData(userId);
  if (parsed && (parsed.updatedAt || parsed.photoUrl || parsed.fourFingersPhotoUrl || parsed.thumbPhotoUrl)) {
    return parsed;
  }
  return null;
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
          maxWidth: 'min(480px, 92vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          textAlign: 'center',
          position: 'relative',
        }}
        className="dinail-modal-card"
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
          Lihat di Riwayat Konsultasi
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
        className="dinail-modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 28px',
          maxWidth: 'min(520px, 92vw)',
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
                Checkout Shopee
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
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#696969' }}>
            ID Konsultasi:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#141413',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
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
        className="profil-order-card-body"
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

        <div className="profil-order-price-col" style={{ textAlign: 'right', flexShrink: 0 }}>
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
            Checkout Shopee
          </a>
        )}
      </div>
    </div>
  );
}

// Konten Tab: Ukuran Kuku Saya (FITUR PENGUKURAN KUKU OTOMATIS VIA AI + MANUAL)

const AI_SCAN_STEPS = [
  'Mendeteksi referensi koin Rp 500...',
  'Mengukur lebar 4 jari...',
  'Mengukur lebar ibu jari...',
] as const;

function UkuranKukuTab({ userId }: { userId?: string | null }) {
  const [nailData, setNailData] = useState<NailSizeData>(DEFAULT_NAIL_DATA);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State Pengukuran Otomatis via AI (2 Foto: 4 Jari + Ibu Jari)
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isGuideZoomOpen, setIsGuideZoomOpen] = useState(false);
  const [fourFingersFile, setFourFingersFile] = useState<File | null>(null);
  const [fourFingersPreview, setFourFingersPreview] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [aiStatus, setAiStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [aiResult, setAiResult] = useState<NailAIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fourFingersInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const scanTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loaded = loadNailData(userId);
      setNailData(loaded);
      setFourFingersPreview(loaded.fourFingersPhotoUrl || null);
      setThumbPreview(loaded.thumbPhotoUrl || null);
      if (loaded.lastAiResult && loaded.lastAiResult.success) {
        setAiResult(loaded.lastAiResult);
        setAiStatus('success');
      } else {
        setAiResult(null);
        setAiStatus('idle');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    return () => {
      scanTimersRef.current.forEach((id) => window.clearTimeout(id));
      scanTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    return () => {
      if (fourFingersPreview && fourFingersPreview.startsWith('blob:')) {
        URL.revokeObjectURL(fourFingersPreview);
      }
    };
  }, [fourFingersPreview]);

  useEffect(() => {
    return () => {
      if (thumbPreview && thumbPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbPreview);
      }
    };
  }, [thumbPreview]);

  const clearScanTimers = () => {
    scanTimersRef.current.forEach((id) => window.clearTimeout(id));
    scanTimersRef.current = [];
  };

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

  // Upload Foto Slot 1 (4 Jari) & Slot 2 (Ibu Jari) + Kompresi ringan ke DataURL
  const handleSelectSlotPhoto = async (slot: 'fourFingers' | 'thumb', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const instantPreviewUrl = URL.createObjectURL(file);
    if (slot === 'fourFingers') {
      setFourFingersFile(file);
      setFourFingersPreview(instantPreviewUrl);
    } else {
      setThumbFile(file);
      setThumbPreview(instantPreviewUrl);
    }

    // Reset hasil analisis sementara agar user tahu perlu klik Analisis AI lagi untuk foto baru
    setAiStatus('idle');
    setAiResult(null);
    setAiError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 600, 0.7);
      setNailData((prev) => {
        const next: NailSizeData =
          slot === 'fourFingers'
            ? {
                ...prev,
                fourFingersPhotoUrl: compressedDataUrl,
                photoUrl: compressedDataUrl,
                lastAiResult: undefined,
                aiConfidenceScore: undefined,
              }
            : {
                ...prev,
                thumbPhotoUrl: compressedDataUrl,
                lastAiResult: undefined,
                aiConfidenceScore: undefined,
              };
        saveNailData(next, userId);
        return next;
      });
    } catch {
      // Tetap lanjut menggunakan object URL untuk sesi ini jika kompresi gagal
    }
  };

  // Hapus satu foto slot tertentu + reset hasil AI & sinkronkan localStorage
  const handleRemoveSlotPhoto = (slot: 'fourFingers' | 'thumb') => {
    clearScanTimers();
    if (slot === 'fourFingers') {
      setFourFingersFile(null);
      setFourFingersPreview(null);
      if (fourFingersInputRef.current) fourFingersInputRef.current.value = '';
    } else {
      setThumbFile(null);
      setThumbPreview(null);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }

    setAiStatus('idle');
    setAiStepIndex(0);
    setAiResult(null);
    setAiError(null);

    setNailData((prev) => {
      const next: NailSizeData =
        slot === 'fourFingers'
          ? {
              ...prev,
              fourFingersPhotoUrl: undefined,
              photoUrl: null,
              lastAiResult: undefined,
              aiConfidenceScore: undefined,
            }
          : {
              ...prev,
              thumbPhotoUrl: undefined,
              lastAiResult: undefined,
              aiConfidenceScore: undefined,
            };
      saveNailData(next, userId);
      return next;
    });
  };

  // Analisis 2 Foto via AI Service (mendukung File baru maupun DataURL tersimpan)
  const handleAnalyzeWithAI = async () => {
    const fourFingersInput = fourFingersFile || fourFingersPreview;
    const thumbInput = thumbFile || thumbPreview;
    if (!fourFingersInput || !thumbInput || aiStatus === 'processing') return;

    clearScanTimers();
    setAiStatus('processing');
    setAiStepIndex(0);
    setAiResult(null);
    setAiError(null);

    const t1 = window.setTimeout(() => setAiStepIndex(1), 850);
    const t2 = window.setTimeout(() => setAiStepIndex(2), 1700);
    scanTimersRef.current = [t1, t2];

    try {
      const result = await analyzeNailPhotos(fourFingersInput, thumbInput);
      clearScanTimers();

      if (!result.success) {
        setAiStatus('error');
        setAiError(
          result.errorMessage ||
            'Koin tidak terdeteksi atau foto buram. Pastikan pencahayaan terang dan posisi tegak lurus dari atas.'
        );
        return;
      }

      const mappedPreset: SizePreset =
        result.recommendedPreset === 'Kustom' ? 'Custom' : result.recommendedPreset;
      const measuredFingers: NailFingers = {
        thumb: result.measurements.thumb,
        index: result.measurements.index,
        middle: result.measurements.middle,
        ring: result.measurements.ring,
        pinky: result.measurements.pinky,
      };
      const nowLabel = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setNailData((prev) => {
        const next: NailSizeData = {
          ...prev,
          preset: mappedPreset,
          leftHand: { ...measuredFingers },
          rightHand: prev.syncHands ? { ...measuredFingers } : prev.rightHand,
          aiConfidenceScore: result.confidenceScore,
          lastAiResult: result,
          updatedAt: nowLabel,
        };
        saveNailData(next, userId);
        return next;
      });
      setAiResult(result);
      setAiStatus('success');
    } catch {
      clearScanTimers();
      setAiStatus('error');
      setAiError(
        'Terjadi kendala saat memproses foto. Pastikan koneksi stabil dan unggah ulang foto yang jelas bersama koin.'
      );
    }
  };

  // Reset kedua slot foto untuk percobaan ulang
  const handleRetryPhotos = () => {
    clearScanTimers();
    setFourFingersFile(null);
    setFourFingersPreview(null);
    setThumbFile(null);
    setThumbPreview(null);
    setAiStatus('idle');
    setAiStepIndex(0);
    setAiResult(null);
    setAiError(null);
    setNailData((prev) => {
      const next: NailSizeData = {
        ...prev,
        fourFingersPhotoUrl: undefined,
        thumbPhotoUrl: undefined,
        photoUrl: null,
        aiConfidenceScore: undefined,
        lastAiResult: undefined,
      };
      saveNailData(next, userId);
      return next;
    });
    if (fourFingersInputRef.current) fourFingersInputRef.current.value = '';
    if (thumbInputRef.current) thumbInputRef.current.value = '';
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
      lastAiResult: aiResult ?? nailData.lastAiResult,
      updatedAt: dateLabel,
    };
    saveNailData(finalData, userId);
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

  const hasFourFingers = Boolean(fourFingersFile || fourFingersPreview);
  const hasThumb = Boolean(thumbFile || thumbPreview);
  const uploadedCount = (hasFourFingers ? 1 : 0) + (hasThumb ? 1 : 0);
  const isReadyToAnalyze = hasFourFingers && hasThumb && aiStatus !== 'processing';
  const isScanning = aiStatus === 'processing';

  const photoSlots: Array<{
    key: 'fourFingers' | 'thumb';
    label: string;
    hint: string;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }> = [
    {
      key: 'fourFingers',
      label: '1. Foto 4 Jari (Telunjuk – Kelingking)',
      hint: 'Rapatkan 4 jari di samping koin (Rp 100–1000)',
      preview: fourFingersPreview,
      inputRef: fourFingersInputRef,
    },
    {
      key: 'thumb',
      label: '2. Foto Ibu Jari (Jempol)',
      hint: 'Posisikan jempol rata di samping koin (Rp 100–1000)',
      preview: thumbPreview,
      inputRef: thumbInputRef,
    },
  ];

  return (
    <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Header Bagian */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', margin: 0 }}>
          Ukuran Kuku Saya
        </h2>
        <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0', lineHeight: 1.5, whiteSpace: 'normal', overflowWrap: 'break-word' }}>
          Ukur otomatis menggunakan AI dari 2 foto atau sesuaikan manual untuk memastikan press-on nails pas di setiap jarimu.
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

      {/* 2. UKUR OTOMATIS VIA FOTO (AI) — 2 SLOT FOTO DI BAGIAN ATAS */}
      <div
        style={{
          backgroundColor: '#FAF7F5',
          border: '1px solid #EAE6E1',
          borderRadius: 18,
          padding: '18px 18px 20px',
          marginBottom: 28,
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Header Blok AI + Indikator Kelengkapan */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 240px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#F37338',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#141413', margin: 0 }}>
                Ukur Otomatis via Foto (AI)
              </h3>
            </div>
            <p style={{ fontSize: 12.5, color: '#696969', margin: 0, lineHeight: 1.5 }}>
              Unggah 2 foto terpisah (4 jari &amp; ibu jari) bersama koin Rp 100 / 200 / 500 / 1000 agar sistem otomatis mengisi ukuran milimeter di bawah.
            </p>
          </div>

          {/* Indikator Kelengkapan Foto (0/2, 1/2, 2/2) */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 11px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              backgroundColor: uploadedCount === 2 ? '#FFF5F0' : '#FFFFFF',
              border: uploadedCount === 2 ? '1px solid rgba(243, 115, 56, 0.35)' : '1px solid #E5E0DA',
              color: uploadedCount === 2 ? '#CF4500' : '#57534E',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: uploadedCount === 2 ? '#F37338' : '#A8A29E',
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
            <span>{uploadedCount}/2 foto siap</span>
          </span>
        </div>

        {/* Blok Panduan Pengambilan Foto (Accordion + Gambar Panduan Klik-Zoom) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE6E1',
            borderRadius: 14,
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setIsGuideOpen((prev) => !prev)}
            aria-expanded={isGuideOpen}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: '#141413',
              fontSize: 12.5,
              fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F37338"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Panduan Pengambilan Foto dengan Koin</span>
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#696969"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                flexShrink: 0,
                transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {isGuideOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    borderTop: '1px solid #F3F0EE',
                    padding: '14px 14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  {/* Gambar Panduan Ukur Koin (Klik untuk Zoom / Lightbox) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setIsGuideZoomOpen(true)}
                      aria-label="Perbesar gambar panduan pengukuran kuku dengan koin"
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 420,
                        margin: '0 auto',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'zoom-in',
                        display: 'block',
                      }}
                    >
                      <Image
                        src={DINAIL_ASSETS.guides.measureWithCoin}
                        alt="Panduan cara mengukur kuku dengan koin Rp 100, 200, 500, atau 1000"
                        width={900}
                        height={900}
                        sizes="(max-width: 640px) 92vw, 420px"
                        className="rounded-2xl border border-[#EAE6E1] w-full max-w-[420px] mx-auto"
                        style={{
                          width: '100%',
                          maxWidth: 420,
                          height: 'auto',
                          display: 'block',
                          margin: '0 auto',
                          borderRadius: 16,
                          border: '1px solid #EAE6E1',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          backgroundColor: 'rgba(20, 20, 19, 0.78)',
                          backdropFilter: 'blur(4px)',
                          color: '#FFFFFF',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 999,
                          lineHeight: 1.2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <IconSearch size={12} />
                        <span>Perbesar Panduan</span>
                      </span>
                    </button>
                  </div>

                  {/* Daftar Instruksi Selaras dengan Gambar Panduan */}
                  <div
                    style={{
                      backgroundColor: '#FAF7F5',
                      border: '1px solid #EFEAE4',
                      borderRadius: 12,
                      padding: '12px 14px',
                    }}
                  >
                    <p style={{ fontSize: 12.5, color: '#141413', margin: '0 0 8px', lineHeight: 1.45 }}>
                      <strong style={{ fontWeight: 700 }}>Alat:</strong> Koin pecahan{' '}
                      <strong style={{ fontWeight: 600 }}>Rp 100 / 200 / 500 / 1000</strong>.
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        fontSize: 12.5,
                        color: '#555555',
                        lineHeight: 1.5,
                      }}
                    >
                      <li>Tempat pengambilan foto terang.</li>
                      <li>Foto tegak lurus dari atas, pastikan koin tetap terlihat bulat.</li>
                      <li>Foto di permukaan datar (meja), jangan di tempat empuk (sofa/kasur).</li>
                      <li>Pastikan sisi kuku terlihat jelas.</li>
                      <li>Jika ada bentuk kuku yang berbeda, dapat dikonfirmasikan ke Admin saat konsultasi.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lightbox Zoom Gambar Panduan */}
        <AnimatePresence>
          {isGuideZoomOpen && (
            <motion.div
              key="guide-coin-lightbox"
              onClick={() => setIsGuideZoomOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10020,
                backgroundColor: 'rgba(20, 20, 19, 0.84)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 14,
                  maxWidth: 'min(560px, 94vw)',
                  maxHeight: '90vh',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: 0 }}>
                      Panduan Pengukuran Kuku dengan Koin
                    </p>
                    <p style={{ fontSize: 11.5, color: '#696969', margin: '2px 0 0' }}>
                      Gunakan koin Rp 100 / 200 / 500 / 1000 di atas meja datar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuideZoomOpen(false)}
                    aria-label="Tutup pratinjau panduan"
                    style={{
                      background: '#F8F5F2',
                      border: '1px solid #ECE6E0',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      fontSize: 15,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#141413',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    width: '100%',
                    maxHeight: '75vh',
                    overflowY: 'auto',
                    borderRadius: 12,
                    border: '1px solid #EAE6E1',
                  }}
                >
                  <Image
                    src={DINAIL_ASSETS.guides.measureWithCoin}
                    alt="Panduan cara mengukur kuku dengan koin dinail.co"
                    width={900}
                    height={900}
                    sizes="(max-width: 640px) 94vw, 540px"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: 12,
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2 Slot Upload Foto (grid-cols-1 sm:grid-cols-2 gap-3.5) */}
        <div className="nail-ai-upload-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {photoSlots.map((slot) => (
            <div
              key={slot.key}
              style={{
                backgroundColor: '#FFFFFF',
                border: slot.preview ? '1px solid #E5E0DA' : '1px dashed #D5D0C8',
                borderRadius: 14,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#141413', margin: 0, lineHeight: 1.35 }}>
                  {slot.label}
                </p>
                <p style={{ fontSize: 11.5, color: '#696969', margin: '2px 0 0', lineHeight: 1.4 }}>
                  {slot.hint}
                </p>
              </div>

              {slot.preview ? (
                <div
                  className="aspect-[4/3] rounded-xl"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#F3F0EE',
                    border: '1px solid #EAE6E1',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.preview}
                    alt={slot.label}
                    className="object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* Tombol Hapus (-) & Ganti Foto di Pojok Kanan Atas */}
                  {!isScanning && (
                    <div
                      className="flex items-center gap-1.5"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveSlotPhoto(slot.key)}
                        title="Hapus Foto"
                        aria-label="Hapus Foto"
                        className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          boxShadow: '0 2px 6px rgba(20, 20, 19, 0.2)',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#DC2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#EF4444';
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => slot.inputRef.current?.click()}
                        style={{
                          backgroundColor: 'rgba(20, 20, 19, 0.78)',
                          backdropFilter: 'blur(6px)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 999,
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          lineHeight: 1.2,
                        }}
                      >
                        Ganti Foto
                      </button>
                    </div>
                  )}

                  {/* State 2: Overlay Efek Garis Scanning #F37338 Bergerak Naik-Turun */}
                  {isScanning && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 5,
                        backgroundColor: 'rgba(20, 20, 19, 0.24)',
                        pointerEvents: 'none',
                      }}
                    >
                      <motion.div
                        initial={{ top: '6%' }}
                        animate={{ top: ['6%', '92%', '6%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: '#F37338',
                          boxShadow: '0 0 12px 2px rgba(243, 115, 56, 0.75)',
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => slot.inputRef.current?.click()}
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#FAF7F5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: '#141413',
                    transition: 'background-color 0.18s ease',
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE6E1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F37338',
                    }}
                  >
                    <IconCamera size={20} />
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#141413' }}>
                    Pilih / Ambil Foto
                  </span>
                  <span style={{ fontSize: 11, color: '#767676' }}>
                    Kamera atau Galeri (JPG / PNG)
                  </span>
                </button>
              )}

              <input
                ref={slot.inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleSelectSlotPhoto(slot.key, e)}
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>

        {/* Tombol Analisis AI & Status Progres Dinamis */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary profil-mobile-full-btn"
              disabled={!isReadyToAnalyze}
              onClick={handleAnalyzeWithAI}
              style={{
                padding: '11px 22px',
                fontSize: 13.5,
                fontWeight: 600,
                opacity: isReadyToAnalyze ? 1 : 0.45,
                cursor: isReadyToAnalyze ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="7" y1="12" x2="17" y2="12" />
              </svg>
              <span>{isScanning ? 'Sedang Menganalisis...' : 'Analisis Ukuran dengan AI'}</span>
            </button>

            {isScanning && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: '#CF4500',
                }}
              >
                <motion.span
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#F37338',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span>{AI_SCAN_STEPS[aiStepIndex]}</span>
              </div>
            )}
          </div>

          {/* State 3: Banner Berhasil + Auto-Fill */}
          <AnimatePresence>
            {aiStatus === 'success' && aiResult && (
              <motion.div
                key="ai-result-success"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl"
                style={{
                  backgroundColor: '#FFF5F0',
                  border: '1px solid rgba(243, 115, 56, 0.3)',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
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
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#141413' }}>
                    Analisis AI Selesai — Rekomendasi:{' '}
                    {aiResult.recommendedPreset === 'Kustom'
                      ? 'Kustom'
                      : `Size ${aiResult.recommendedPreset}`}
                    {aiResult.confidenceScore ? ` (Akurasi ${aiResult.confidenceScore}%)` : ''}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#57534E', margin: 0, lineHeight: 1.5, paddingLeft: 16 }}>
                  Angka di bawah sudah terisi otomatis. Kamu tetap bisa menyesuaikan secara manual sebelum menyimpan.
                </p>
              </motion.div>
            )}

            {/* State 4: Banner Gagal Deteksi / Error */}
            {aiStatus === 'error' && aiError && (
              <motion.div
                key="ai-result-error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl"
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: '1 1 220px', minWidth: 0 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>
                    <IconAlertTriangle size={17} />
                  </span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: '#991B1B' }}>
                      Gagal Mendeteksi Ukuran Kuku
                    </p>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5, color: '#B91C1C' }}>
                      {aiError}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetryPhotos}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FCA5A5',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#B91C1C',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Coba Foto Ulang
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Pilihan Preset Cepat (Flat Minimalis) */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#141413', textTransform: 'uppercase', marginBottom: 10 }}>
          Pilih Preset Ukuran Cepat
        </span>
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

      {/* 4. Detail Ukuran Per Jari (Tabel / List Flat 2 Kolom) */}
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
          className="profil-two-col-grid"
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

      {/* 5. Tombol Simpan & Alert Feedback */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #EAE6E1' }}>
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Data ukuran kuku berhasil disimpan ke profil Anda.</span>
          </div>
        )}

        <div>
          <button
            type="button"
            className="btn-primary profil-mobile-full-btn"
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
  initialStatus = 'semua',
  initialOpenForm = false,
  onNavigateToUkuran,
}: {
  userId?: string | null;
  userProfileName?: string;
  initialDesign?: string;
  initialStatus?: OrderStatus | 'semua';
  initialOpenForm?: boolean;
  onNavigateToUkuran?: () => void;
}) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'semua'>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [showNewForm, setShowNewForm] = useState(Boolean(initialDesign || initialOpenForm));

  // Form states
  const [prevProfileName, setPrevProfileName] = useState(userProfileName);
  const [customerName, setCustomerName] = useState(userProfileName && userProfileName !== 'Sari Dewi' ? userProfileName : 'Customer');

  if (userProfileName !== prevProfileName) {
    setPrevProfileName(userProfileName);
    if (userProfileName && userProfileName !== 'Sari Dewi') {
      setCustomerName(userProfileName);
    }
  }
  const [newNotes, setNewNotes] = useState('');
  const [refLink, setRefLink] = useState('');
  const [refPhotoUrl, setRefPhotoUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Saved nail size state
  const [savedNailData, setSavedNailData] = useState<NailSizeData | null>(null);

  // Modals state
  const [submittedOrder, setSubmittedOrder] = useState<OrderCard | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrateTimer = setTimeout(() => {
      setOrders(loadOrders(userId));
      setSavedNailData(getSavedNailData());
    }, 0);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => {
      clearTimeout(hydrateTimer);
      clearTimeout(timer);
    };
  }, [userId]);

  useEffect(() => {
    const fetchUserConsultations = async () => {
      try {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const headers: Record<string, string> = {};
        if (idToken) headers.Authorization = `Bearer ${idToken}`;

        const res = await fetch(`${BACKEND_URL}/api/v1/consultations/me`, { headers });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: OrderCard[] = json.data.map((item: {
            consultationCode?: string;
            id?: string;
            userId?: string;
            user?: {
              name?: string;
              email?: string;
              savedSizePreset?: string;
            };
            referenceLink?: string;
            createdAt?: string;
            status?: string;
            serviceType?: string;
            designName?: string;
            variant?: string;
            customerNotes?: string;
            estimatedPrice?: string;
            photoUrl?: string;
            shopeeUrl?: string;
            adminFeedback?: string;
            reviewedAt?: string;
          }) => {
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

            const rawStatus = (item.status || '').toUpperCase();
            let mappedStatus: OrderStatus = 'menunggu';
            if (rawStatus === 'CONFIRMED' || rawStatus === 'SIAP_CHECKOUT' || rawStatus === 'DISETUJUI') {
              mappedStatus = 'siap_checkout';
            } else if (rawStatus === 'IN_PROGRESS' || rawStatus === 'PROSES') {
              mappedStatus = 'proses';
            } else if (rawStatus === 'COMPLETED' || rawStatus === 'SELESAI') {
              mappedStatus = 'selesai';
            } else if (rawStatus === 'CANCELLED' || rawStatus === 'DITOLAK' || rawStatus === 'DIBATALKAN') {
              mappedStatus = 'dibatalkan';
            } else {
              mappedStatus = 'menunggu';
            }

            return {
              consultationId: item.consultationCode || item.id || 'DNL-ORD-UNKNOWN',
              userId: item.userId,
              customerName: item.user?.name || userProfileName || 'Customer',
              nailSizeSummary: item.user?.savedSizePreset ? `Size ${item.user.savedSizePreset}` : 'Size M',
              referenceLink: item.referenceLink || undefined,
              submittedAt: `${dateLabel}, ${timeLabel}`,
              status: mappedStatus,
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

  const matchesStatusTab = (orderStatus: string, targetTab: OrderStatus | 'semua') => {
    const norm = (orderStatus || '').toLowerCase();
    return (
      targetTab === 'semua' ||
      norm === targetTab.toLowerCase() ||
      (targetTab === 'menunggu' && (norm === 'antrian' || norm === 'menunggu' || norm === 'pending')) ||
      (targetTab === 'siap_checkout' && (norm === 'disetujui' || norm === 'siap_checkout' || norm === 'confirmed')) ||
      (targetTab === 'proses' && (norm === 'proses' || norm === 'in_progress')) ||
      (targetTab === 'selesai' && (norm === 'selesai' || norm === 'completed')) ||
      (targetTab === 'dibatalkan' && (norm === 'ditolak' || norm === 'dibatalkan' || norm === 'cancelled'))
    );
  };

  // Filter real-time berdasarkan Tab Status dan Search Bar
  const filtered = orders.filter((o) => {
    const matchStatus = matchesStatusTab(o.status, activeStatus);
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

    const created = createConsultation({
      consultationId: newId,
      userId,
      customerName: customerName.trim(),
      designName: initialDesign?.trim() || 'Custom Press-On Nails',
      serviceType: 'Custom Press-On Nails',
      variant: 'Custom',
      notes: newNotes.trim(),
      referenceLink: refLink.trim() || undefined,
      photoUrl: refPhotoUrl || DINAIL_ASSETS.catalogPreviews[0],
      estimasiHarga: 'Menunggu estimasi',
      submittedAt: `${dateLabel}, ${timeLabel}`,
      fallbackNailSize: savedNailData,
    });

    const newOrder: OrderCard = {
      ...created,
      status: 'menunggu',
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated, userId);

    // Persist consultation to backend database
    (async () => {
      try {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const res = await fetch(`${BACKEND_URL}/api/v1/consultations`, {
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
            nailPhotos: newOrder.nailPhotos,
            aiConfidenceScore: newOrder.aiConfidenceScore,
            customerNotes: newOrder.notes,
            estimatedPrice: newOrder.estimasiHarga,
            customerName: newOrder.customerName,
            userId: newOrder.userId,
          }),
        });
        const resJson = await res.json();
        console.log('[Consultation] Successfully synced to backend:', res.status, resJson);
      } catch (err) {
        console.warn('Backend consultation sync unavailable, saved locally:', err);
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
        className="profil-konsultasi-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', margin: 0 }}>
            Konsultasi Saya
          </h2>
          <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
            Pantau status pesanan dan proses kustomisasi kuku Anda
          </p>
        </div>

        <button
          className="btn-primary profil-mobile-full-btn"
          style={{ padding: '10px 22px', fontSize: 13 }}
          onClick={() => {
            setSavedNailData(getSavedNailData(userId));
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
                      Ukur Kuku Sekarang
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
                Kirim Pengajuan Konsultasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Filter Status (Khusus Mobile & Tablet < 1024px) */}
      <div
        className="block lg:hidden profil-status-dropdown-mobile relative mt-4 mb-3"
        style={{ position: 'relative', marginTop: 16, marginBottom: 12 }}
      >
        <select
          aria-label="Filter Status Konsultasi"
          value={activeStatus}
          onChange={(e) => setActiveStatus(e.target.value as OrderStatus | 'semua')}
          className="profil-status-select w-full appearance-none bg-white border border-[#EAE6E1] rounded-xl px-4 py-3 pr-10 text-[14px] font-medium text-[#141413] focus:outline-none focus:border-[#F37338]"
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE6E1',
            borderRadius: 12,
            padding: '12px 40px 12px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: '#141413',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        >
          {TAB_LIST.map((tab) => {
            const count = orders.filter((o) => matchesStatusTab(o.status, tab.key)).length;
            const baseLabel =
              tab.key === 'semua'
                ? 'Semua Status'
                : tab.key === 'dibatalkan'
                ? 'Ditolak'
                : tab.label;
            return (
              <option key={`mobile-status-opt-${tab.key}`} value={tab.key}>
                {count > 0 ? `${baseLabel} (${count})` : baseLabel}
              </option>
            );
          })}
        </select>
        <span
          className="pointer-events-none"
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#696969',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {/* Baris Tab Status Horizontal (Khusus Desktop >= 1024px — Utuh) */}
      <div className="hidden lg:flex profil-status-tabs" style={{ marginBottom: 16 }}>
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
          placeholder="Cari berdasarkan ID Konsultasi"
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
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="konsultasi-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-busy="true"
            aria-label="Memuat riwayat konsultasi"
          >
            {[0, 1, 2].map((idx) => (
              <div
                key={`konsultasi-skel-${idx}`}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EAE6E1',
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                {/* Header Skeleton */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid #EAE6E1',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Skeleton style={{ width: 175, height: 15, borderRadius: 6 }} />
                    <Skeleton style={{ width: 88, height: 13, borderRadius: 6 }} />
                  </div>
                  <Skeleton style={{ width: 112, height: 18, borderRadius: 999 }} />
                </div>

                {/* Body Skeleton */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '18px 20px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Skeleton style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Skeleton style={{ width: 96, height: 11, borderRadius: 5 }} />
                    <Skeleton style={{ width: '56%', height: 18, borderRadius: 6 }} />
                    <Skeleton style={{ width: '40%', height: 13, borderRadius: 6 }} />
                    <Skeleton style={{ width: '66%', height: 12, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <Skeleton style={{ width: 96, height: 18, borderRadius: 6 }} />
                    <Skeleton style={{ width: 70, height: 11, borderRadius: 5 }} />
                  </div>
                </div>

                {/* Footer Skeleton */}
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
                  <Skeleton style={{ width: 112, height: 34, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="konsultasi-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
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
                    setSavedNailData(getSavedNailData(userId));
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
          </motion.div>
        )}
      </AnimatePresence>

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
    name: fallbackUser?.name || 'Customer',
    email: fallbackUser?.email || '',
    phone: fallbackUser?.phone || '',
    city: 'Yogyakarta',
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = localStorage.getItem(LS_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isMockName = parsed.name === 'Sari Dewi';
      const cleanName = isMockName ? (fallbackUser?.name || 'Customer') : parsed.name;
      return {
        name: fallbackUser?.name || cleanName || defaultProfile.name,
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
        className="dinail-modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 28px 24px',
          maxWidth: 'min(480px, 92vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, []);

  const skeletonRows = [
    { labelW: 82, valW: 150 },
    { labelW: 118, valW: 175 },
    { labelW: 126, valW: 215 },
    { labelW: 132, valW: 145 },
    { labelW: 112, valW: 128 },
  ];

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
        Akun Saya
      </h2>
      <p
        className="whitespace-normal break-words"
        style={{
          fontSize: 13,
          color: '#696969',
          marginBottom: 24,
          lineHeight: 1.5,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
        }}
      >
        Informasi profil pribadi dan ID keanggotaan Anda di dinail.co
      </p>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="akun-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-busy="true"
            aria-label="Memuat informasi akun"
          >
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton style={{ width: 138, height: 11, borderRadius: 5 }} />
                  <Skeleton style={{ width: 172, height: 18, borderRadius: 6 }} />
                </div>
                <Skeleton style={{ width: 144, height: 24, borderRadius: 999 }} />
              </div>
            )}

            {/* Flat List Skeleton (5 Baris) */}
            <div style={{ maxWidth: 680, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {skeletonRows.map((row, idx, arr) => (
                  <div
                    key={`akun-skel-row-${idx}`}
                    className="akun-info-row"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 0',
                      borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #EAE6E1',
                      gap: 16,
                    }}
                  >
                    <Skeleton style={{ width: row.labelW, height: 14, borderRadius: 6 }} />
                    <Skeleton style={{ width: row.valW, maxWidth: '100%', height: 16, borderRadius: 6 }} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <Skeleton className="profil-mobile-full-btn" style={{ width: 152, height: 44, borderRadius: 999 }} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="akun-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
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
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
                    ID Pengguna Terdaftar
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#F37338',
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em',
                        wordBreak: 'break-all',
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
            <div style={{ maxWidth: 680, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'ID User', value: userId || 'DNL-USR-8492', isMonospace: true },
                  { label: 'Nama Lengkap', value: profile.name },
                  { label: 'Email Terdaftar', value: profile.email },
                  { label: 'Nomor WhatsApp', value: profile.phone || '-' },
                  { label: 'Kota / Wilayah', value: profile.city || '-' },
                ].map((item, idx, arr) => (
                  <div
                    key={item.label}
                    className="akun-info-row"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 0',
                      borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #EAE6E1',
                      gap: 16,
                    }}
                  >
                    <span className="akun-info-label" style={{ fontSize: 13, color: '#696969', flexShrink: 0 }}>
                      {item.label}
                    </span>
                    <div
                      className="akun-info-value-wrap"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right', minWidth: 0 }}
                    >
                      <span
                        className="akun-info-value"
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Ubah Profil langsung di bawah list informasi */}
              <div style={{ marginTop: 28 }}>
                <button
                  className="btn-primary profil-mobile-full-btn"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type MobileProfileView = 'hub' | ActiveMenu;

function ProfileContent() {
  const { currentUser, currentRole, userId, logout, openModal } = useRole();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialDesignParam = searchParams.get('design') || undefined;

  // Tentukan tab awal untuk Desktop (default 'akun', atau sesuai parameter URL ?tab= / ?design=)
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
    if (tabParam === 'konsultasi' || initialDesignParam) return 'konsultasi';
    if (tabParam === 'ukuran') return 'ukuran';
    return 'akun';
  });

  // State khusus Mobile Profile Hub (< 1024px)
  const [mobileView, setMobileView] = useState<MobileProfileView>(() => {
    if (tabParam === 'konsultasi' || initialDesignParam) return 'konsultasi';
    if (tabParam === 'ukuran') return 'ukuran';
    return 'hub';
  });
  const [mobileKonsultasiStatus, setMobileKonsultasiStatus] = useState<OrderStatus | 'semua'>('semua');
  const [mobileOpenKonsultasiForm, setMobileOpenKonsultasiForm] = useState(false);
  const [mobileOrders, setMobileOrders] = useState<OrderCard[]>([]);
  const [mobileNailData, setMobileNailData] = useState<NailSizeData | null>(null);
  const [mobileIdCopied, setMobileIdCopied] = useState(false);

  const [prevUser, setPrevUser] = useState(currentUser);
  const [profile, setProfile] = useState<UserProfile>({
    name: currentUser?.name || 'Customer',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: 'Yogyakarta',
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfile(loadProfile(currentUser));
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser]);

  // Sinkronisasi ringkasan pesanan & ukuran kuku untuk Mobile Profile Hub
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOrders(loadOrders(userId));
      setMobileNailData(getSavedNailData());
    }, 0);
    return () => clearTimeout(timer);
  }, [userId, mobileView]);

  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    if (currentUser?.name) {
      setProfile((prev) => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
      }));
    }
  }

  const displayName = currentUser?.name || profile.name || 'Customer';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const photoUrl = currentUser?.photoUrl;
  const resolvedUserId = userId || 'DNL-USR-8492';

  // Hitung badge status konsultasi untuk Grid 4 Ikon di Mobile Hub
  const mobileOrderCounts = mobileOrders.reduce(
    (acc, o) => {
      const norm = (o.status || '').toLowerCase();
      if (norm === 'antrian' || norm === 'menunggu' || norm === 'pending') acc.antrian += 1;
      else if (norm === 'proses' || norm === 'in_progress') acc.disetujui += 1;
      else if (norm === 'disetujui' || norm === 'siap_checkout' || norm === 'confirmed') acc.checkout += 1;
      else if (norm === 'selesai' || norm === 'completed') acc.selesai += 1;
      return acc;
    },
    { antrian: 0, disetujui: 0, checkout: 0, selesai: 0 }
  );

  const handleCopyMobileId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedUserId).catch(() => {});
    }
    setMobileIdCopied(true);
    setTimeout(() => setMobileIdCopied(false), 1800);
  };

  const openMobileKonsultasi = (status: OrderStatus | 'semua', openForm = false) => {
    setMobileKonsultasiStatus(status);
    setMobileOpenKonsultasiForm(openForm);
    setMobileView('konsultasi');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMobileSubView = (view: ActiveMenu) => {
    setMobileView(view);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mobileSubViewTitle: Record<ActiveMenu, string> = {
    akun: 'Akun Saya',
    ukuran: 'Ukuran Kuku Saya',
    konsultasi: 'Konsultasi Saya',
  };

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

  const mobileStatusTiles: {
    label: string;
    targetStatus: OrderStatus | 'semua';
    openForm?: boolean;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      label: 'Antrian',
      targetStatus: 'menunggu',
      count: mobileOrderCounts.antrian,
      icon: (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141413" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <polyline points="12 7 12 12 15.5 14" />
        </svg>
      ),
    },
    {
      label: 'Disetujui',
      targetStatus: 'proses',
      count: mobileOrderCounts.disetujui,
      icon: (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141413" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Konsultasi',
      targetStatus: 'semua',
      openForm: true,
      count: mobileOrderCounts.checkout,
      icon: (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141413" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="13" y2="13" />
        </svg>
      ),
    },
    {
      label: 'Selesai',
      targetStatus: 'selesai',
      count: mobileOrderCounts.selesai,
      icon: (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141413" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ background: '#F3F0EE', minHeight: '100vh', overflowX: 'clip' }}>
      <Navbar />

      {/* State: Belum Login (Desktop & Mobile) */}
      {!currentUser && (
        <main className="profil-main-container" style={{ maxWidth: 1180, margin: '0 auto', padding: '120px 20px 80px' }}>
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
              Masuk / Daftar Sekarang
            </button>
          </div>
        </main>
      )}

      {/* State: Sudah Login — MOBILE PROFILE HUB & SUB-PAGES (< 1024px) */}
      {currentUser && (
        <div className="block lg:hidden profil-mobile-hub-wrapper">
          <AnimatePresence mode="wait">
            {mobileView === 'hub' ? (
              <motion.div
                key="mobile-profile-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* 1. Header Banner Profil (Gradasi Signal Orange dinail.co — Rata Tepi ala Shopee) */}
                <div
                  style={{
                    width: '100%',
                    marginTop: 68,
                    background: 'linear-gradient(135deg, #F37338 0%, #DF5E24 100%)',
                    color: '#FFFFFF',
                    padding: '18px 16px',
                    borderRadius: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    {/* Kiri: Avatar + Nama + Pill ID */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl}
                          alt={displayName}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.4)',
                          }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            color: '#F37338',
                            fontSize: 19,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.4)',
                          }}
                        >
                          {displayInitial}
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            lineHeight: 1.25,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {displayName}
                        </p>

                        <button
                          type="button"
                          onClick={handleCopyMobileId}
                          title="Ketuk untuk menyalin ID User"
                          style={{
                            marginTop: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                            color: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: 999,
                            padding: '2px 10px',
                            fontSize: 11,
                            fontWeight: 500,
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            maxWidth: '100%',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {mobileIdCopied ? 'ID Tersalin' : `ID: ${resolvedUserId}`}
                          </span>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0, opacity: 0.9 }}
                            aria-hidden="true"
                          >
                            {mobileIdCopied ? (
                              <polyline points="20 6 9 17 4 12" />
                            ) : (
                              <>
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Kanan: Ikon Edit Putih Polos (Tanpa Border Lingkaran) */}
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      aria-label="Ubah Profil"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 6,
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 2. Banner Pengingat Ukuran Kuku (Hanya jika ukuran kuku belum disimpan) */}
                {!mobileNailData && (
                  <div
                    style={{
                      margin: '12px 16px 0',
                      padding: '12px 14px',
                      borderRadius: 16,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE6E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#F37338',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: 12.5, color: '#141413', fontWeight: 500 }}>
                        Ukuran kuku belum diatur.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openMobileSubView('ukuran')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#F37338',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      Atur Sekarang
                    </button>
                  </div>
                )}

                {/* 3. Kartu "Konsultasi Saya" — Grid 4 Ikon Status */}
                <div
                  style={{
                    margin: '12px 16px 0',
                    padding: '16px',
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EAE6E1',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#141413', margin: 0 }}>
                      Konsultasi Saya
                    </h2>
                    <button
                      type="button"
                      onClick={() => openMobileKonsultasi('semua', false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#6B6B6B',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>Lihat Riwayat</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      gap: 8,
                      marginTop: 14,
                      textAlign: 'center',
                    }}
                  >
                    {mobileStatusTiles.map((tile) => (
                      <button
                        key={tile.label}
                        type="button"
                        onClick={() => openMobileKonsultasi(tile.targetStatus, Boolean(tile.openForm))}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            backgroundColor: '#FAF7F5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {tile.icon}
                          {tile.count > 0 && (
                            <span
                              style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                minWidth: 18,
                                height: 18,
                                padding: '0 5px',
                                borderRadius: 999,
                                backgroundColor: '#F37338',
                                color: '#FFFFFF',
                                fontSize: 10,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px solid #FFFFFF',
                                lineHeight: 1,
                              }}
                            >
                              {tile.count}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: '#141413', lineHeight: 1.2 }}>
                          {tile.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Kartu Daftar Menu Profil */}
                <div
                  style={{
                    margin: '12px 16px 24px',
                    padding: '4px 16px',
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EAE6E1',
                    overflow: 'hidden',
                  }}
                >
                  {/* Baris 1: Ukuran Kuku Saya */}
                  <button
                    type="button"
                    onClick={() => openMobileSubView('ukuran')}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #EAE6E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: '#141413', fontSize: 14, fontWeight: 500 }}>
                      <span style={{ color: '#141413', display: 'inline-flex' }}>
                        <IconRuler size={18} />
                      </span>
                      <span>Ukuran Kuku Saya</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#F37338' }}>
                      <span>
                        {mobileNailData
                          ? mobileNailData.preset === 'Custom'
                            ? 'Kustom'
                            : `Size ${mobileNailData.preset}`
                          : 'Atur Ukuran'}
                      </span>
                      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>›</span>
                    </span>
                  </button>

                  {/* Baris 2: Akun Saya */}
                  <button
                    type="button"
                    onClick={() => openMobileSubView('akun')}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #EAE6E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: '#141413', fontSize: 14, fontWeight: 500 }}>
                      <span style={{ color: '#141413', display: 'inline-flex' }}>
                        <IconUser size={18} />
                      </span>
                      <span>Akun Saya</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#6B6B6B' }}>
                      <span>Detail Profil</span>
                      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>›</span>
                    </span>
                  </button>

                  {/* Tautan Dashboard Khusus Role Admin/Owner */}
                  {(currentRole === 'admin' || currentRole === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
                    <Link
                      href="/admin"
                      style={{
                        width: '100%',
                        padding: '14px 0',
                        borderBottom: '1px solid #EAE6E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        textDecoration: 'none',
                        color: '#F37338',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      <span>Dashboard Admin</span>
                      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>›</span>
                    </Link>
                  )}

                  {(currentRole === 'owner' || currentUser?.role === 'owner') && (
                    <Link
                      href="/owner"
                      style={{
                        width: '100%',
                        padding: '14px 0',
                        borderBottom: '1px solid #EAE6E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        textDecoration: 'none',
                        color: '#F37338',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      <span>Dashboard Owner</span>
                      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>›</span>
                    </Link>
                  )}

                  {/* Baris 4: Keluar */}
                  <button
                    type="button"
                    onClick={logout}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      color: '#B91C1C',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex' }}>
                        <IconLogOut size={18} />
                      </span>
                      <span>Keluar</span>
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* MODE 2: Tampilan Sub-Halaman Detail (akun | ukuran | konsultasi) */
              <motion.div
                key={`mobile-profile-sub-${mobileView}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
              >
                {/* Bar Kembali di Atas */}
                <div
                  style={{
                    padding: '84px 16px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMobileView('hub');
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#FFFFFF',
                      border: '1px solid #EAE6E1',
                      borderRadius: 999,
                      padding: '7px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#141413',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span aria-hidden="true">←</span>
                    <span>Kembali</span>
                  </button>

                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', letterSpacing: '0.02em' }}>
                    {mobileSubViewTitle[mobileView]}
                  </span>
                </div>

                {/* Konten Sub-Halaman Detail */}
                <div style={{ padding: '0 16px 48px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE6E1',
                      borderRadius: 18,
                      padding: '20px 16px',
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {mobileView === 'akun' && (
                      <AkunTab
                        profile={profile}
                        userId={userId}
                        onOpenEdit={() => setIsEditProfileOpen(true)}
                      />
                    )}
                    {mobileView === 'ukuran' && <UkuranKukuTab userId={userId} />}
                    {mobileView === 'konsultasi' && (
                      <KonsultasiTab
                        key={`mobile-kns-${userId || 'guest'}-${profile.name}-${mobileKonsultasiStatus}-${mobileOpenKonsultasiForm}`}
                        userId={userId}
                        userProfileName={profile.name}
                        initialDesign={initialDesignParam}
                        initialStatus={mobileKonsultasiStatus}
                        initialOpenForm={mobileOpenKonsultasiForm}
                        onNavigateToUkuran={() => openMobileSubView('ukuran')}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* State: Sudah Login — DESKTOP 2-COLUMN LAYOUT (>= 1024px, 100% UTUH) */}
      {currentUser && (
        <main
          className="hidden lg:block profil-desktop-wrapper"
          style={{ maxWidth: 1180, margin: '0 auto', padding: '120px 20px 80px' }}
        >
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
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 16,
                    background: '#FFF7F3',
                    border: '1px solid #FDDCC8',
                    borderRadius: 8,
                    padding: '7px 10px',
                    fontSize: 12,
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ color: '#767676', fontWeight: 500, flexShrink: 0 }}>ID:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#F37338',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em',
                        wordBreak: 'break-all',
                      }}
                    >
                      {userId}
                    </span>
                  </div>
                  <CopyButton text={userId} />
                </div>
              )}

              {/* Garis Pembatas Tipis (1px solid #EAE6E1) */}
              <div style={{ height: 1, background: '#EAE6E1', marginBottom: 14 }} />

              {/* Menu Navigasi Vertikal: Akun Saya -> Ukuran Kuku Saya -> Konsultasi Saya -> Keluar */}
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
                        <span className="profil-nav-chevron" style={{ marginLeft: 'auto', color: '#F37338', fontSize: 12, fontWeight: 700 }}>
                          ›
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick links ke Catalog & Price List (disembunyikan di mobile < 1024px) */}
              <div
                className={
                  currentRole === 'admin' || currentRole === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'owner'
                    ? 'profil-quicklinks-box'
                    : 'profil-quicklinks-box profil-quicklinks-desktop-only'
                }
                style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #EAE6E1' }}
              >
                <Link
                  href="/catalog"
                  className="hidden lg:block profil-desktop-only-link"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#696969',
                    textDecoration: 'none',
                    padding: '5px 0',
                    transition: 'color 0.2s',
                  }}
                >
                  Lihat Catalog
                </Link>
                <Link
                  href="/pricelist"
                  className="hidden lg:block profil-desktop-only-link"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#696969',
                    textDecoration: 'none',
                    padding: '5px 0',
                    transition: 'color 0.2s',
                  }}
                >
                  Cek Daftar Harga
                </Link>
                {(currentRole === 'admin' || currentRole === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
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
                    Dashboard Admin
                  </Link>
                )}
                {(currentRole === 'owner' || currentUser?.role === 'owner') && (
                  <Link
                    href="/owner"
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
                    Dashboard Owner
                  </Link>
                )}
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
                <UkuranKukuTab userId={userId} />
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
            </section>

          </div>
        </main>
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
