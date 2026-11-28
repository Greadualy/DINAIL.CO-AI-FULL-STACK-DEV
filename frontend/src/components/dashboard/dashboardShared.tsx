'use client';

import { useState } from 'react';
import { auth } from '@/config/firebase';
import { getNailSizeData } from '@/services/nailSizeService';
import type { ConsultationNailPhotos } from '@/types';

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const LS_KEY_OFFLINE_SALES = 'dinail_offline_sales';
export const LS_KEY_OFFLINE_BATCHES = 'dinail_offline_batches';

export type AdminOrderStatus = 'Antrian' | 'Disetujui' | 'Ditolak';

export interface AdminOrder {
  consultationId: string;
  userId?: string;
  customerName?: string;
  nailSizeSummary?: string;
  nailPhotos?: ConsultationNailPhotos;
  aiConfidenceScore?: number;
  referenceLink?: string;
  submittedAt: string;
  status: string;
  serviceType: string;
  designName: string;
  variant: string;
  notes: string;
  estimasiHarga: string;
  photoUrl: string;
  shopeeUrl?: string;
  adminFeedback?: string;
  reviewedAt?: string;
  storageKey: string;
}

export interface OfflineSaleItem {
  id: string;
  batchId: string;
  batchFileName: string;
  tanggal: string;
  namaPelanggan: string;
  itemDesain: string;
  nominal: number;
  channel: 'Offline';
  createdAt: string;
}

export interface OfflineBatch {
  batchId: string;
  fileName: string;
  importedAt: string;
  rowCount: number;
  totalNominal: number;
}

export interface BackendConsultationAdmin {
  consultationCode?: string;
  id?: string;
  userId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    savedSizePreset?: string;
  };
  confirmedSize?: string;
  referenceLink?: string;
  createdAt?: string;
  status?: string;
  serviceType?: string;
  designName?: string;
  variant?: string;
  customerNotes?: string;
  estimatedPrice?: string;
  photoUrl?: string;
  nailPhotos?: ConsultationNailPhotos;
  aiConfidenceScore?: number;
  shopeeUrl?: string;
  adminFeedback?: string;
  reviewedAt?: string;
}

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function parseNominal(str: string | number | undefined): number {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 0 : val;
}

export function normalizeOrderStatus(status: string): AdminOrderStatus {
  const s = (status || '').toLowerCase();
  if (s === 'antrian' || s === 'menunggu' || s === 'pending') return 'Antrian';
  if (
    s === 'disetujui' ||
    s === 'siap_checkout' ||
    s === 'proses' ||
    s === 'selesai' ||
    s === 'confirmed' ||
    s === 'in_progress' ||
    s === 'completed'
  ) {
    return 'Disetujui';
  }
  if (s === 'ditolak' || s === 'dibatalkan' || s === 'cancelled') return 'Ditolak';
  return 'Antrian';
}

export function mapBackendConsultation(c: BackendConsultationAdmin): AdminOrder {
  const createdAtDate = c.createdAt ? new Date(c.createdAt) : new Date();
  const dateLabel = createdAtDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = createdAtDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let nailSizeSummary = 'Preset M';
  if (c.user?.savedSizePreset) {
    nailSizeSummary = `Preset ${c.user.savedSizePreset}`;
  } else if (c.confirmedSize) {
    nailSizeSummary = c.confirmedSize;
  }

  const resolvedUserId = c.userId || c.user?.id;
  const localNailFallback = typeof window !== 'undefined' ? getNailSizeData(resolvedUserId) : null;
  const nailPhotos: ConsultationNailPhotos | undefined =
    c.nailPhotos && (c.nailPhotos.fourFingersUrl || c.nailPhotos.thumbUrl)
      ? c.nailPhotos
      : localNailFallback && (localNailFallback.fourFingersPhotoUrl || localNailFallback.thumbPhotoUrl)
      ? {
          fourFingersUrl: localNailFallback.fourFingersPhotoUrl,
          thumbUrl: localNailFallback.thumbPhotoUrl,
        }
      : undefined;

  return {
    consultationId: c.consultationCode || c.id || 'DNL-ORD-UNKNOWN',
    userId: resolvedUserId,
    customerName: c.user?.name || c.user?.email || 'Customer',
    nailSizeSummary,
    nailPhotos,
    aiConfidenceScore: c.aiConfidenceScore ?? localNailFallback?.aiConfidenceScore,
    referenceLink: c.referenceLink || undefined,
    submittedAt: `${dateLabel}, ${timeLabel}`,
    status: normalizeOrderStatus(c.status || 'Antrian'),
    serviceType: c.serviceType || 'Custom Press-On Nails',
    designName: c.designName || 'Custom Press-On Nails',
    variant: c.variant || 'Custom',
    notes: c.customerNotes || '',
    estimasiHarga: c.estimatedPrice || 'Menunggu estimasi',
    photoUrl: c.photoUrl || '/assets/catalog/sample-1.jpg',
    shopeeUrl: c.shopeeUrl || undefined,
    adminFeedback: c.adminFeedback || undefined,
    reviewedAt: c.reviewedAt || undefined,
    storageKey: 'backend_api',
  };
}

export function loadAllConsultations(): AdminOrder[] {
  if (typeof window === 'undefined') return [];
  const results: AdminOrder[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dinail_consultations_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((ord) => {
              if (ord && ord.consultationId) {
                const hasOwnPhotos = Boolean(
                  ord.nailPhotos?.fourFingersUrl || ord.nailPhotos?.thumbUrl
                );
                const fallbackNail = !hasOwnPhotos ? getNailSizeData(ord.userId) : null;
                const nailPhotos: ConsultationNailPhotos | undefined = hasOwnPhotos
                  ? ord.nailPhotos
                  : fallbackNail && (fallbackNail.fourFingersPhotoUrl || fallbackNail.thumbPhotoUrl)
                  ? {
                      fourFingersUrl: fallbackNail.fourFingersPhotoUrl,
                      thumbUrl: fallbackNail.thumbPhotoUrl,
                    }
                  : undefined;

                results.push({
                  ...ord,
                  nailPhotos,
                  aiConfidenceScore: ord.aiConfidenceScore ?? fallbackNail?.aiConfidenceScore,
                  storageKey: key,
                });
              }
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to read consultations:', err);
  }
  return results.sort((a, b) => b.consultationId.localeCompare(a.consultationId));
}

export function saveOrderUpdate(
  storageKey: string,
  consultationId: string,
  newStatus: AdminOrderStatus,
  feedback?: string,
  estimasiHarga?: string,
  shopeeUrl?: string
) {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const targetKeys: string[] = [];
    if (storageKey && storageKey !== 'backend_api') {
      targetKeys.push(storageKey);
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dinail_consultations_')) {
          targetKeys.push(key);
        }
      }
    }

    targetKeys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;

      let matched = false;
      const updated = list.map((item) => {
        if (item.consultationId === consultationId) {
          matched = true;
          return {
            ...item,
            status: newStatus,
            adminFeedback: feedback !== undefined ? feedback : item.adminFeedback,
            estimasiHarga: estimasiHarga || item.estimasiHarga || 'Rp 145.000',
            shopeeUrl: shopeeUrl !== undefined ? shopeeUrl : item.shopeeUrl,
            reviewedAt: dateLabel,
          };
        }
        return item;
      });

      if (matched) {
        localStorage.setItem(key, JSON.stringify(updated));
      }
    });
  } catch (err) {
    console.error('Failed to update consultation:', err);
  }
}

export function loadOfflineSales(): OfflineSaleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY_OFFLINE_SALES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveOfflineSales(sales: OfflineSaleItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY_OFFLINE_SALES, JSON.stringify(sales));
  } catch {}
}

export function loadOfflineBatches(): OfflineBatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY_OFFLINE_BATCHES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveOfflineBatches(batches: OfflineBatch[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY_OFFLINE_BATCHES, JSON.stringify(batches));
  } catch {}
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore token acquisition failure and fall back to local storage
  }
  return {};
}

export async function fetchConsultationsWithAuth(): Promise<AdminOrder[] | null> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/api/v1/consultations`, {
      headers: authHeaders,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const backendOrders = json.data.map(mapBackendConsultation);
      const localOrders = loadAllConsultations();
      const existingIds = new Set(backendOrders.map((o: AdminOrder) => o.consultationId));
      return [...backendOrders, ...localOrders.filter((o) => !existingIds.has(o.consultationId))];
    }
  } catch {
    // Local fallback silently used if backend is temporarily offline
  }
  return null;
}

export async function patchConsultationWithAuth(
  order: AdminOrder,
  newStatus: AdminOrderStatus,
  feedback?: string,
  estimasiHarga?: string,
  shopeeUrl?: string
): Promise<void> {
  saveOrderUpdate(order.storageKey, order.consultationId, newStatus, feedback, estimasiHarga, shopeeUrl);
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${BACKEND_URL}/api/v1/consultations/${encodeURIComponent(order.consultationId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        status: newStatus,
        adminFeedback: feedback,
        estimatedPrice: estimasiHarga,
        shopeeUrl,
      }),
    });
  } catch {
    // Local update applied as fallback
  }
}

// ─── Shared SVG Icons ────────────────────────────────────────────────────────

export function IconClipboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function IconUploadCloud({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

export function IconArrowLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconDownload({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function IconTrash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconRefresh({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconInboxEmpty({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="12" y1="9" x2="12.01" y2="9" />
    </svg>
  );
}

export function IconInfo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function CopyPill({ text }: { text: string }) {
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
      type="button"
      onClick={handleCopy}
      title="Salin ID"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        color: copied ? '#16A34A' : '#767676',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
      }}
    >
      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
      <span>{copied ? 'Tersalin' : ''}</span>
    </button>
  );
}
