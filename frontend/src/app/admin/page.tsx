'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '@/components/Skeleton';
import { useRole } from '@/context/RoleContext';
import { getNailSizeData } from '@/services/nailSizeService';
import type { ConsultationNailPhotos } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type AdminMenu = 'orderan' | 'import';

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


const LS_KEY_OFFLINE_SALES = 'dinail_offline_sales';
const LS_KEY_OFFLINE_BATCHES = 'dinail_offline_batches';

function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function parseNominal(str: string | number | undefined): number {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 0 : val;
}

function normalizeOrderStatus(status: string): AdminOrderStatus {
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

interface BackendConsultationAdmin {
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

function mapBackendConsultation(c: BackendConsultationAdmin): AdminOrder {
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

function loadAllConsultations(): AdminOrder[] {
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

function saveOrderUpdate(
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

function loadOfflineSales(): OfflineSaleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY_OFFLINE_SALES);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [];
}

function saveOfflineSales(sales: OfflineSaleItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY_OFFLINE_SALES, JSON.stringify(sales));
  } catch { }
}

function loadOfflineBatches(): OfflineBatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY_OFFLINE_BATCHES);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [];
}

function saveOfflineBatches(batches: OfflineBatch[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY_OFFLINE_BATCHES, JSON.stringify(batches));
  } catch { }
}


function IconClipboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function IconUploadCloud({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function IconArrowLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconDownload({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconTrash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconRefresh({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}


function IconInboxEmpty({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="12" y1="9" x2="12.01" y2="9" />
    </svg>
  );
}


function IconInfo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CopyPill({ text }: { text: string }) {
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

export default function AdminDashboardPage() {
  const { currentUser, isAuthLoading } = useRole();
  const normalizedRole = currentUser?.role?.toLowerCase();
  const canAccessAdmin = Boolean(
    currentUser && (normalizedRole === 'admin' || normalizedRole === 'owner')
  );
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('orderan');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSaleItem[]>([]);
  const [offlineBatches, setOfflineBatches] = useState<OfflineBatch[]>([]);

  // Modals & Forms
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [refreshNotice, setRefreshNotice] = useState<'idle' | 'loading' | 'done'>('idle');
  const refreshNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<'Semua' | AdminOrderStatus>('Semua');

  // Import State
  const [previewRows, setPreviewRows] = useState<Omit<OfflineSaleItem, 'id' | 'batchId' | 'batchFileName' | 'createdAt'>[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const fetchConsultationsFromBackend = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/consultations`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const backendOrders = json.data.map(mapBackendConsultation);
        const localOrders = loadAllConsultations();
        const existingIds = new Set(backendOrders.map((o: AdminOrder) => o.consultationId));
        const merged = [...backendOrders, ...localOrders.filter((o) => !existingIds.has(o.consultationId))];
        setOrders(merged);
      }
    } catch {
      // Local fallback silently used if backend is temporarily offline
    }
  };

  useEffect(() => {
    if (isAuthLoading || !canAccessAdmin) return;
    let isMounted = true;
    fetch(`${BACKEND_URL}/api/v1/consultations`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !json.success || !Array.isArray(json.data)) return;
        const backendOrders = json.data.map(mapBackendConsultation);
        const localOrders = loadAllConsultations();
        const existingIds = new Set(backendOrders.map((o: AdminOrder) => o.consultationId));
        const merged = [...backendOrders, ...localOrders.filter((o) => !existingIds.has(o.consultationId))];
        setOrders(merged);
      })
      .catch(() => {
        // Fallback to local
      });
    return () => {
      isMounted = false;
    };
  }, [activeMenu, isAuthLoading, canAccessAdmin]);

  useEffect(() => {
    if (isAuthLoading || !canAccessAdmin) return;
    const hydrateTimer = setTimeout(() => {
      setOrders(loadAllConsultations());
      setOfflineSales(loadOfflineSales());
      setOfflineBatches(loadOfflineBatches());
    }, 0);
    const timer = setTimeout(() => {
      setIsLoadingOrders(false);
    }, 400);
    return () => {
      clearTimeout(hydrateTimer);
      clearTimeout(timer);
      if (refreshNoticeTimerRef.current) clearTimeout(refreshNoticeTimerRef.current);
    };
  }, [isAuthLoading, canAccessAdmin]);

  const showOrderSkeleton = isLoadingOrders || isRefreshing;

  const refreshData = async () => {
    if (isRefreshing) return;
    if (refreshNoticeTimerRef.current) {
      clearTimeout(refreshNoticeTimerRef.current);
      refreshNoticeTimerRef.current = null;
    }
    setIsRefreshing(true);
    setRefreshNotice('loading');
    const minDelay = new Promise((resolve) => setTimeout(resolve, 650));
    setOrders(loadAllConsultations());
    setOfflineSales(loadOfflineSales());
    setOfflineBatches(loadOfflineBatches());
    try {
      await Promise.all([fetchConsultationsFromBackend(), minDelay]);
    } finally {
      setIsRefreshing(false);
      setRefreshNotice('done');
      refreshNoticeTimerRef.current = setTimeout(() => {
        setRefreshNotice('idle');
        refreshNoticeTimerRef.current = null;
      }, 2200);
    }
  };

  // Computed Metrics — only antrianCount needed after removing penjualan tab
  const metrics = useMemo(() => {
    const antrianCount = orders.filter((o) => normalizeOrderStatus(o.status) === 'Antrian').length;
    return { antrianCount };
  }, [orders]);

  // Orders filtered
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter === 'Semua') return true;
      return normalizeOrderStatus(o.status) === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  // Order Counts for Status Badges
  const orderCounts = useMemo(() => {
    let antrian = 0;
    let disetujui = 0;
    let ditolak = 0;
    orders.forEach((o) => {
      const s = normalizeOrderStatus(o.status);
      if (s === 'Antrian') antrian++;
      else if (s === 'Disetujui') disetujui++;
      else if (s === 'Ditolak') ditolak++;
    });
    return {
      Semua: orders.length,
      Antrian: antrian,
      Disetujui: disetujui,
      Ditolak: ditolak,
    };
  }, [orders]);

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'tanggal,nama_pelanggan,item_desain,nominal\n' +
      '2026-11-20,Dewi Anggraini,Blush Chrome Gradient,135000\n' +
      '2026-11-21,Rina Kurnia,French Modern Almond,150000\n' +
      '2026-11-22,Natasya Putri,Glazed Donut Nails,120000\n' +
      '2026-11-22,Alya Zahra,Milky Minimalist Oval,110000\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_penjualan_offline_dinail.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // File Upload Handler (CSV / XLSX)
  const processUploadedFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (!rawRows || rawRows.length === 0) {
        setImportError('File kosong atau data baris tidak ditemukan.');
        return;
      }

      const parsed: Omit<OfflineSaleItem, 'id' | 'batchId' | 'batchFileName' | 'createdAt'>[] = [];

      rawRows.forEach((row) => {
        let tanggal = '';
        let nama = '';
        let item = '';
        let nominal = 0;

        for (const key of Object.keys(row)) {
          const lower = key.toLowerCase().trim();
          const val = row[key];
          if (lower.includes('tanggal') || lower === 'date' || lower === 'tgl') {
            tanggal = String(val).trim();
          } else if (lower.includes('nama') || lower.includes('customer') || lower.includes('pelanggan')) {
            nama = String(val).trim();
          } else if (lower.includes('item') || lower.includes('desain') || lower.includes('produk') || lower.includes('product')) {
            item = String(val).trim();
          } else if (
            lower.includes('nominal') ||
            lower.includes('harga') ||
            lower.includes('price') ||
            lower.includes('total') ||
            lower.includes('amount')
          ) {
            nominal = parseNominal(String(val));
          }
        }

        if (nama && nominal > 0) {
          parsed.push({
            tanggal: tanggal || new Date().toISOString().split('T')[0],
            namaPelanggan: nama,
            itemDesain: item || 'Press-On Nails Offline',
            nominal,
            channel: 'Offline',
          });
        }
      });

      if (parsed.length === 0) {
        setImportError(
          'Tidak ditemukan baris yang valid. Pastikan format kolom berisi: tanggal, nama_pelanggan, item_desain, nominal.'
        );
        return;
      }

      setImportError(null);
      setPreviewRows(parsed);
      setPreviewFileName(file.name);
    } catch (err) {
      console.error(err);
      setImportError('Gagal memproses file. Pastikan file berupa format .csv atau .xlsx yang valid.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleConfirmImport = () => {
    if (!previewRows || previewRows.length === 0) return;

    const batchId = `batch_${Date.now()}`;
    const newItems: OfflineSaleItem[] = previewRows.map((row, idx) => ({
      ...row,
      id: `DNL-OFF-${Date.now().toString().slice(-4)}${String(idx + 1).padStart(2, '0')}`,
      batchId,
      batchFileName: previewFileName,
      createdAt: new Date().toISOString(),
    }));

    const totalBatchNominal = newItems.reduce((acc, curr) => acc + curr.nominal, 0);
    const newBatch: OfflineBatch = {
      batchId,
      fileName: previewFileName,
      importedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      rowCount: newItems.length,
      totalNominal: totalBatchNominal,
    };

    const updatedSales = [...newItems, ...offlineSales];
    const updatedBatches = [newBatch, ...offlineBatches];

    setOfflineSales(updatedSales);
    setOfflineBatches(updatedBatches);
    saveOfflineSales(updatedSales);
    saveOfflineBatches(updatedBatches);

    setPreviewRows(null);
    setPreviewFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    showToast(`Berhasil menggabungkan ${newItems.length} transaksi offline (${formatRupiah(totalBatchNominal)})!`);
  };

  const handleDeleteBatch = (batchId: string, fileName: string) => {
    if (!window.confirm(`Hapus batch "${fileName}"? Seluruh data transaksi terkait akan dihapus.`)) return;

    const updatedSales = offlineSales.filter((s) => s.batchId !== batchId);
    const updatedBatches = offlineBatches.filter((b) => b.batchId !== batchId);

    setOfflineSales(updatedSales);
    setOfflineBatches(updatedBatches);
    saveOfflineSales(updatedSales);
    saveOfflineBatches(updatedBatches);

    showToast(`Batch "${fileName}" berhasil dihapus.`);
  };

  if (isAuthLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Memuat halaman"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F0EE',
          fontFamily: 'var(--font-primary, Poppins, sans-serif)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2.5px solid #E5E0DA',
            borderTopColor: '#141413',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!canAccessAdmin) {
    notFound();
  }

  return (
    <div
      className="dashboard-shell min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row"
      style={{
        background: '#F8F5F2',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        color: '#141413',
        fontFamily: 'var(--font-primary, Poppins, sans-serif)',
      }}
    >
      {/* ── 1. SIDEBAR KIRI (Desktop >= 1024px) ── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:h-screen lg:shrink-0 lg:sticky lg:top-0 overflow-y-auto dashboard-sidebar-desktop"
        style={{
          width: 240,
          minWidth: 240,
          flexShrink: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #ECE6E0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 50,
        }}
      >
        {/* Brand / Logo Header */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #ECE6E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>
              dinail
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#F37338',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>
              co
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F37338',
              backgroundColor: 'rgba(243, 115, 56, 0.08)',
              padding: '3px 8px',
              borderRadius: 4,
              display: 'inline-block',
            }}
          >
            Admin Panel
          </span>
        </div>

        {/* Menu Navigasi Utama */}
        <nav style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Menu 1 */}
          <button
            type="button"
            onClick={() => setActiveMenu('orderan')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: activeMenu === 'orderan' ? 600 : 500,
              color: activeMenu === 'orderan' ? '#141413' : '#6B6B6B',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'color 0.15s ease',
            }}
          >
            {activeMenu === 'orderan' && (
              <motion.div
                layoutId="admin-sidebar-active"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  backgroundColor: '#F8F5F2',
                  borderLeft: '3px solid #F37338',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, color: activeMenu === 'orderan' ? '#F37338' : '#71717A', flexShrink: 0, display: 'flex' }}>
              <IconClipboard size={17} />
            </span>
            <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>Status Orderan</span>
            {metrics.antrianCount > 0 && (
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: '#F37338',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                {metrics.antrianCount}
              </span>
            )}
          </button>

          {/* Menu 2 */}
          <button
            type="button"
            onClick={() => setActiveMenu('import')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: activeMenu === 'import' ? 600 : 500,
              color: activeMenu === 'import' ? '#141413' : '#6B6B6B',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'color 0.15s ease',
            }}
          >
            {activeMenu === 'import' && (
              <motion.div
                layoutId="admin-sidebar-active"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  backgroundColor: '#F8F5F2',
                  borderLeft: '3px solid #F37338',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, color: activeMenu === 'import' ? '#F37338' : '#71717A', flexShrink: 0, display: 'flex' }}>
              <IconUploadCloud size={17} />
            </span>
            <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>Import Penjualan Offline</span>
          </button>
        </nav>

        {/* Footer Sidebar: Tombol Kembali ke Beranda */}
        <div
          className="mt-auto"
          style={{
            marginTop: 'auto',
            padding: '14px 12px 20px',
            borderTop: '1px solid #ECE6E0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#6B6B6B',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ color: '#71717A', flexShrink: 0, display: 'flex' }}>
              <IconArrowLeft size={16} />
            </span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>

      {/* ── MOBILE SLIDE-OVER DRAWER (< 1024px) ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            key="admin-mobile-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9000,
              backgroundColor: 'rgba(20, 20, 19, 0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
            }}
          >
            <motion.aside
              key="admin-mobile-drawer-panel"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 264,
                maxWidth: '82vw',
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #ECE6E0',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
              }}
            >
              <div
                style={{
                  padding: '22px 18px 18px',
                  borderBottom: '1px solid #ECE6E0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>dinail</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F37338', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>co</span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#F37338',
                      backgroundColor: 'rgba(243, 115, 56, 0.08)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      display: 'inline-block',
                    }}
                  >
                    Admin Panel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Tutup menu navigasi"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ECE6E0',
                    backgroundColor: '#F8F5F2',
                    color: '#141413',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <nav style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('orderan');
                    setMobileDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    background: activeMenu === 'orderan' ? '#F8F5F2' : 'transparent',
                    border: 'none',
                    borderLeft: activeMenu === 'orderan' ? '3px solid #F37338' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    fontWeight: activeMenu === 'orderan' ? 600 : 500,
                    color: activeMenu === 'orderan' ? '#141413' : '#6B6B6B',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ color: activeMenu === 'orderan' ? '#F37338' : '#71717A', flexShrink: 0, display: 'flex' }}>
                    <IconClipboard size={17} />
                  </span>
                  <span style={{ flex: 1 }}>Status Orderan</span>
                  {metrics.antrianCount > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: '#F37338',
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: 12,
                      }}
                    >
                      {metrics.antrianCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('import');
                    setMobileDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    background: activeMenu === 'import' ? '#F8F5F2' : 'transparent',
                    border: 'none',
                    borderLeft: activeMenu === 'import' ? '3px solid #F37338' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    fontWeight: activeMenu === 'import' ? 600 : 500,
                    color: activeMenu === 'import' ? '#141413' : '#6B6B6B',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ color: activeMenu === 'import' ? '#F37338' : '#71717A', flexShrink: 0, display: 'flex' }}>
                    <IconUploadCloud size={17} />
                  </span>
                  <span style={{ flex: 1 }}>Import Penjualan Offline</span>
                </button>
              </nav>

              <div style={{ padding: '14px 12px 28px', borderTop: '1px solid #ECE6E0' }}>
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#6B6B6B',
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ color: '#71717A', flexShrink: 0, display: 'flex' }}>
                    <IconArrowLeft size={16} />
                  </span>
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. AREA KONTEN UTAMA ── */}
      <main
        className="dashboard-main-scroll flex-1 min-w-0 lg:h-screen lg:overflow-y-auto"
        style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', background: '#F8F5F2' }}
      >
        {/* Header Bar (Ringkas & Sticky di Mobile < 1024px, Utuh di Desktop >= 1024px) */}
        <div
          className="dashboard-header admin-header-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            background: '#FFFFFF',
            borderBottom: '1px solid #ECE6E0',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto' }}>
            <button
              type="button"
              className="dashboard-mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Buka menu navigasi Admin"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid #ECE6E0',
                backgroundColor: '#FAF7F5',
                color: '#141413',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#141413', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeMenu === 'orderan' && 'Kelola Status Orderan'}
                {activeMenu === 'import' && 'Import Penjualan Offline'}
              </h1>
              <p className="admin-header-subtitle" style={{ fontSize: 12.5, color: '#71717A', margin: '2px 0 0' }}>
                {activeMenu === 'orderan' && 'Tinjau referensi desain kuku customer, kelola status, dan kirimkan feedback'}
                {activeMenu === 'import' && 'Unggah laporan penjualan offline dari event/bazaar dalam format CSV atau Excel (.xlsx)'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              className="btn-secondary admin-refresh-btn px-3 py-1.5 text-[12px] lg:px-[18px] lg:py-2 lg:text-[13px]"
              onClick={refreshData}
              disabled={isRefreshing}
              title="Perbarui Data"
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                className={isRefreshing ? 'animate-spin' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isRefreshing ? 'spin 0.7s linear infinite' : undefined,
                }}
              >
                <IconRefresh size={14} />
              </span>
              <span>{isRefreshing ? 'Memperbarui...' : 'Muat Ulang'}</span>
            </button>
          </div>
        </div>

        {/* Pil Notifikasi Status Muat Ulang (Alur 3 Tahap) */}
        <AnimatePresence>
          {refreshNotice !== 'idle' && (
            <motion.div
              key="refresh-notice-pill"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                x: '-50%',
                zIndex: 10002,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 9999,
                backgroundColor: '#141413',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 500,
                boxShadow: '0 8px 24px rgba(20, 20, 19, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {refreshNotice === 'loading' ? (
                <>
                  <span
                    className="animate-spin"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F37338',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  >
                    <IconRefresh size={14} />
                  </span>
                  <span>Memuat data...</span>
                </>
              ) : (
                <>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22C55E',
                    }}
                  >
                    <IconCheck size={14} />
                  </span>
                  <span>Data berhasil diperbarui.</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Body */}
        <div className="dashboard-body" style={{ flex: 1, padding: '28px 32px 60px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
        {/* ── TAB 1: STATUS ORDERAN & MODAL REFERENSI ── */}
        {activeMenu === 'orderan' && (
          <motion.div
            key="admin-tab-orderan"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className="dashboard-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE6E0',
                borderRadius: 16,
                padding: '24px 28px',
              }}
            >
              {/* Header filter */}
              <div
                className="admin-filter-header flex flex-col sm:flex-row gap-3"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Daftar Pengajuan Konsultasi &amp; Orderan Masuk
                  </h3>
                  <p style={{ fontSize: 12, color: '#71717A', margin: '3px 0 0' }}>
                    Data terhubung langsung dari halaman profil customer. Klik &ldquo;Lihat Referensi&rdquo; untuk meninjau dan mengubah status.
                  </p>
                </div>

                {/* Dropdown Filter Status (Khusus Mobile & Tablet < 1024px) */}
                <div
                  className="block lg:hidden admin-status-dropdown-mobile relative w-full"
                  style={{ position: 'relative', width: '100%' }}
                >
                  <select
                    aria-label="Filter Status Orderan"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as 'Semua' | AdminOrderStatus)}
                    className="dashboard-select-mobile w-full appearance-none bg-[#FAF9F7] border border-[#EAE6E1] rounded-xl px-3.5 py-2.5 pr-9 text-[13px] font-medium text-[#141413]"
                    style={{
                      width: '100%',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundColor: '#FAF9F7',
                      border: '1px solid #EAE6E1',
                      borderRadius: 12,
                      padding: '10px 36px 10px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#141413',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {(['Semua', 'Antrian', 'Disetujui', 'Ditolak'] as const).map((tab) => (
                      <option key={`mobile-admin-opt-${tab}`} value={tab}>
                        {tab} ({orderCounts[tab]})
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none"
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B6B6B',
                      pointerEvents: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>

                {/* Filter Status Tabs (Khusus Desktop >= 1024px — Utuh) */}
                <div className="hidden lg:inline-flex admin-status-tabs scrollbar-hidden" style={{ display: 'flex', background: '#F8F5F2', border: '1px solid #ECE6E0', borderRadius: 10, padding: 3, gap: 2 }}>
                  {(['Semua', 'Antrian', 'Disetujui', 'Ditolak'] as const).map((tab) => {
                    const isActive = orderStatusFilter === tab;
                    const count = orderCounts[tab];
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setOrderStatusFilter(tab)}
                        style={{
                          position: 'relative',
                          border: 'none',
                          background: 'transparent',
                          color: isActive ? '#F37338' : '#6B6B6B',
                          fontWeight: isActive ? 700 : 500,
                          padding: '6px 12px',
                          borderRadius: 7,
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'color 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: 'inherit',
                        }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="admin-status-tab"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: 7,
                              backgroundColor: '#FFFFFF',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                              zIndex: 0,
                            }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>{tab}</span>
                        <span
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 999,
                            backgroundColor: isActive ? '#F37338' : '#ECE6E0',
                            color: isActive ? '#FFFFFF' : '#6B6B6B',
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card View Orderan (Khusus Mobile & Tablet < 1024px) */}
              <div className="block lg:hidden admin-orders-cards-mobile space-y-3">
                {showOrderSkeleton ? (
                  [0, 1, 2].map((idx) => (
                    <div
                      key={`mobile-order-skel-${idx}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAE6E1',
                        borderRadius: 16,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Skeleton style={{ width: 150, height: 14, borderRadius: 6 }} />
                        <Skeleton style={{ width: 72, height: 22, borderRadius: 6 }} />
                      </div>
                      <Skeleton style={{ width: '52%', height: 15, borderRadius: 6 }} />
                      <Skeleton style={{ width: '74%', height: 12, borderRadius: 6 }} />
                      <Skeleton style={{ width: '100%', height: 38, borderRadius: 12, marginTop: 4 }} />
                    </div>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <div style={{ padding: '40px 14px', textAlign: 'center', border: '1px solid #EAE6E1', borderRadius: 16, backgroundColor: '#FAF9F7' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(243, 115, 56, 0.1)',
                        color: '#F37338',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}
                    >
                      <IconInboxEmpty size={24} />
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: '0 0 4px' }}>
                      {orderStatusFilter === 'Semua'
                        ? 'Belum Ada Pengajuan Orderan'
                        : `Tidak Ada Orderan Berstatus ${orderStatusFilter}`}
                    </h4>
                    <p style={{ fontSize: 12, color: '#71717A', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
                      Pengajuan konsultasi dari customer akan otomatis tampil di sini.
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    const currentStatusNorm = normalizeOrderStatus(ord.status);
                    return (
                      <div
                        key={`mobile-card-${ord.consultationId}`}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #EAE6E1',
                          borderRadius: 16,
                          padding: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          minWidth: 0,
                        }}
                      >
                        {/* Baris Atas Kartu: ID + Copy & Badge Status */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            paddingBottom: 10,
                            borderBottom: '1px solid #F3F0EE',
                          }}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                            <span
                              className="text-[12px] font-mono font-semibold whitespace-nowrap"
                              style={{
                                fontSize: 12,
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: '#141413',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ord.consultationId}
                            </span>
                            <CopyPill text={ord.consultationId} />
                          </div>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 6,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              background:
                                currentStatusNorm === 'Disetujui'
                                  ? '#F0FDF4'
                                  : currentStatusNorm === 'Ditolak'
                                  ? '#FFF1F2'
                                  : '#FFFBEB',
                              color:
                                currentStatusNorm === 'Disetujui'
                                  ? '#16A34A'
                                  : currentStatusNorm === 'Ditolak'
                                  ? '#E11D48'
                                  : '#D97706',
                            }}
                          >
                            {currentStatusNorm}
                          </span>
                        </div>

                        {/* Isi Kartu: Nama Customer, Tanggal, Ukuran & Catatan */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: 0 }}>
                            {ord.customerName || 'Customer'}
                          </p>
                          <p className="text-[12px] text-[#71717A]" style={{ fontSize: 12, color: '#71717A', margin: 0 }}>
                            {ord.submittedAt}
                          </p>
                          <p
                            className="line-clamp-2"
                            style={{
                              fontSize: 12,
                              color: '#57534E',
                              margin: '4px 0 0',
                              lineHeight: 1.45,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            <strong style={{ color: '#141413', fontWeight: 600 }}>
                              {ord.nailSizeSummary || 'Standar M'}
                            </strong>
                            {ord.notes ? ` · “${ord.notes}”` : ''}
                          </p>
                        </div>

                        {/* Footer Kartu: Tombol Aksi Penuh */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="w-full py-2.5 rounded-xl bg-[#141413] text-white text-[13px] font-medium"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 12,
                            backgroundColor: '#141413',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            marginTop: 2,
                          }}
                        >
                          Lihat Referensi &amp; Kelola
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Table Orderan (Khusus Desktop >= 1024px — Utuh) */}
              <div
                className="hidden lg:block admin-orders-table-desktop w-full overflow-x-auto rounded-2xl border border-[#EAE6E1]"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16, border: '1px solid #EAE6E1' }}
              >
                <table style={{ width: '100%', minWidth: 740, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ECE6E0', color: '#71717A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>ID Konsultasi</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Tanggal Masuk</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Customer</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Ukuran Kuku</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Referensi Desain</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false} mode="popLayout">
                    {showOrderSkeleton ? (
                      [0, 1, 2, 3, 4].map((idx) => (
                        <motion.tr
                          key={`order-skeleton-${idx}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ borderBottom: '1px solid #ECE6E0' }}
                        >
                          <td style={{ padding: '14px' }}>
                            <Skeleton style={{ width: 148, height: 14, borderRadius: 6 }} />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <Skeleton style={{ width: 92, height: 13, borderRadius: 6 }} />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <Skeleton style={{ width: 118, height: 14, borderRadius: 6 }} />
                              <Skeleton style={{ width: 152, height: 11, borderRadius: 5 }} />
                            </div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <Skeleton style={{ width: 88, height: 13, borderRadius: 6 }} />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <Skeleton style={{ width: 126, height: 32, borderRadius: 999 }} />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <Skeleton style={{ width: 84, height: 22, borderRadius: 6 }} />
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <Skeleton style={{ width: 118, height: 32, borderRadius: 999, marginLeft: 'auto' }} />
                          </td>
                        </motion.tr>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <motion.tr
                        key="orders-empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <td colSpan={7} style={{ padding: '56px 14px', textAlign: 'center' }}>
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(243, 115, 56, 0.1)',
                              color: '#F37338',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px',
                            }}
                          >
                            <IconInboxEmpty size={26} />
                          </div>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: '0 0 4px' }}>
                            {orderStatusFilter === 'Semua'
                              ? 'Belum Ada Pengajuan Orderan'
                              : `Tidak Ada Orderan Berstatus ${orderStatusFilter}`}
                          </h4>
                          <p style={{ fontSize: 12, color: '#71717A', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
                            Pengajuan konsultasi dari customer akan otomatis tercatat di sini sesuai dengan filter status yang dipilih.
                          </p>
                        </td>
                      </motion.tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const currentStatusNorm = normalizeOrderStatus(ord.status);
                        return (
                          <motion.tr
                            layout
                            key={ord.consultationId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{
                              borderBottom: '1px solid #ECE6E0',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FAF7F5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 600, color: '#141413' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>{ord.consultationId}</span>
                                <CopyPill text={ord.consultationId} />
                              </div>
                            </td>
                            <td style={{ padding: '14px', color: '#6B6B6B', whiteSpace: 'nowrap' }}>
                              {ord.submittedAt}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <p style={{ fontWeight: 600, color: '#141413', margin: 0 }}>
                                {ord.customerName || 'Customer'}
                              </p>
                              {ord.notes && (
                                <p style={{ fontSize: 11, color: '#71717A', margin: '2px 0 0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  Catatan: &ldquo;{ord.notes}&rdquo;
                                </p>
                              )}
                            </td>
                            <td style={{ padding: '14px', color: '#141413', fontSize: 12 }}>
                              {ord.nailSizeSummary || 'Standar M'}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setSelectedOrder(ord)}
                                style={{
                                  padding: '7px 16px',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  fontFamily: 'inherit',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <span>Lihat Referensi</span>
                              </button>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  background:
                                    currentStatusNorm === 'Disetujui'
                                      ? '#F0FDF4'
                                      : currentStatusNorm === 'Ditolak'
                                      ? '#FFF1F2'
                                      : '#FFFBEB',
                                  color:
                                    currentStatusNorm === 'Disetujui'
                                      ? '#16A34A'
                                      : currentStatusNorm === 'Ditolak'
                                      ? '#E11D48'
                                      : '#D97706',
                                  border:
                                    currentStatusNorm === 'Disetujui'
                                      ? '1px solid #BBF7D0'
                                      : currentStatusNorm === 'Ditolak'
                                      ? '1px solid #FECDD3'
                                      : '1px solid #FDE68A',
                                }}
                              >
                                ● {currentStatusNorm}
                              </span>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => setSelectedOrder(ord)}
                                style={{
                                  padding: '7px 18px',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  fontFamily: 'inherit',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <span>Kelola Status</span>
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: IMPORT PENJUALAN OFFLINE ── */}
        {activeMenu === 'import' && (
          <motion.div
            key="admin-tab-import"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Box Upload */}
            <div
              className="dashboard-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE6E0',
                borderRadius: 16,
                padding: '24px 28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Unggah Berkas Penjualan Offline (.csv / .xlsx)
                  </h3>
                  <p style={{ fontSize: 12, color: '#71717A', margin: '3px 0 0' }}>
                    Sistem akan mengekstrak tanggal, nama pelanggan, item desain, dan nominal secara otomatis.
                  </p>
                </div>

                <div className="admin-import-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleDownloadTemplate}
                    style={{
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'inherit',
                    }}
                  >
                    <IconDownload size={14} />
                    <span>Unduh Template CSV</span>
                  </button>
                </div>
              </div>

              {/* Area Drag-and-Drop / Upload */}
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDragging(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    void processUploadedFile(droppedFile);
                  }
                }}
                animate={{
                  scale: isDragging ? 1.01 : 1,
                  borderColor: isDragging ? '#F37338' : '#D5D0C8',
                  backgroundColor: isDragging ? 'rgba(243, 115, 56, 0.08)' : 'rgba(243, 115, 56, 0.04)',
                }}
                whileHover={{
                  borderColor: '#F37338',
                  backgroundColor: 'rgba(243, 115, 56, 0.07)',
                }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  borderWidth: '1.5px',
                  borderStyle: 'dashed',
                  borderColor: '#D5D0C8',
                  backgroundColor: 'rgba(243, 115, 56, 0.04)',
                  borderRadius: 14,
                  padding: '36px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(243, 115, 56, 0.12)',
                    color: '#F37338',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <IconUploadCloud size={26} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: '0 0 4px' }}>
                  Pilih atau Tarik Berkas ke Sini
                </p>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px' }}>
                  Mendukung berkas Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  <span>Pilih Berkas Komputer</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </motion.div>

              {/* Format Kolom Wajib CSV/Excel — Flat List */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: '1px solid #ECE6E0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#F37338', display: 'flex' }}>
                    <IconInfo size={15} />
                  </span>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Format Kolom Wajib Berkas Penjualan Offline
                  </h4>
                </div>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Pastikan baris header (baris pertama) berkas Excel atau CSV Anda memuat 4 nama kolom berikut:
                </p>

                <div style={{ borderTop: '1px solid #ECE6E0' }}>
                  {[
                    { col: 'tanggal', desc: 'Tanggal transaksi penjualan (format YYYY-MM-DD atau DD/MM/YYYY)' },
                    { col: 'nama_pelanggan', desc: 'Nama lengkap customer atau pembeli' },
                    { col: 'item_desain', desc: 'Nama model atau desain press-on nails' },
                    { col: 'nominal', desc: 'Angka harga murni tanpa titik atau huruf (cth: 145000)' },
                  ].map((item, idx, arr) => (
                    <div
                      key={item.col}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '10px 4px',
                        borderBottom: idx < arr.length - 1 ? '1px solid #ECE6E0' : 'none',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#F37338',
                          minWidth: 140,
                        }}
                      >
                        {item.col}
                      </span>
                      <span style={{ fontSize: 12, color: '#6B6B6B', flex: 1 }}>
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {importError && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    backgroundColor: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    borderRadius: 8,
                    color: '#E11D48',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {importError}
                </div>
              )}

              {/* Preview Sebelum Gabung */}
              {previewRows && (
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: '1px solid #ECE6E0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#141413' }}>
                        Pratinjau Berkas: {previewFileName}
                      </span>
                      <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>
                        Ditemukan <strong>{previewRows.length} baris transaksi</strong> dengan total nominal{' '}
                        <strong style={{ color: '#141413' }}>
                          {formatRupiah(previewRows.reduce((a, b) => a + b.nominal, 0))}
                        </strong>
                      </p>
                    </div>

                    <div className="admin-import-actions" style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setPreviewRows(null);
                          setPreviewFileName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          padding: '9px 20px',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>Batal</span>
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleConfirmImport}
                        style={{
                          padding: '9px 24px',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>Gabungkan ke Data Penjualan</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="w-full overflow-x-auto rounded-2xl border border-[#EAE6E1]" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: 280, border: '1px solid #EAE6E1', borderRadius: 16 }}>
                    <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#F8F5F2' }}>
                        <tr style={{ borderBottom: '1px solid #ECE6E0', color: '#71717A' }}>
                          <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>No</th>
                          <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Tanggal</th>
                          <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Nama Pelanggan</th>
                          <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Item Desain</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #ECE6E0' }}>
                            <td style={{ padding: '8px 12px', color: '#71717A' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 12px', color: '#6B6B6B' }}>{row.tanggal}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#141413' }}>{row.namaPelanggan}</td>
                            <td style={{ padding: '8px 12px', color: '#6B6B6B' }}>{row.itemDesain}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#141413' }}>
                              {formatRupiah(row.nominal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewRows.length > 10 && (
                    <p style={{ fontSize: 11, color: '#71717A', marginTop: 6, textAlign: 'center' }}>
                      (Menampilkan 10 baris pertama dari {previewRows.length} data yang terbaca)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Riwayat Batch yang Pernah Di-import */}
            <div
              className="dashboard-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE6E0',
                borderRadius: 16,
                padding: '24px 28px',
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: '0 0 16px' }}>
                Riwayat Berkas yang Pernah Di-import
              </h3>

              {offlineBatches.length === 0 ? (
                <p style={{ fontSize: 13, color: '#71717A', margin: '20px 0', textAlign: 'center' }}>
                  Belum ada berkas offline yang di-import.
                </p>
              ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-[#EAE6E1]" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16, border: '1px solid #EAE6E1' }}>
                  <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ECE6E0', color: '#71717A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Nama Berkas</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Waktu Import</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Jumlah Transaksi</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Total Nominal</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offlineBatches.map((batch) => (
                        <tr key={batch.batchId} style={{ borderBottom: '1px solid #ECE6E0' }}>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#141413' }}>
                            {batch.fileName}
                          </td>
                          <td style={{ padding: '14px', color: '#6B6B6B' }}>
                            {batch.importedAt}
                          </td>
                          <td style={{ padding: '14px', color: '#141413' }}>
                            {batch.rowCount} baris
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, color: '#141413' }}>
                            {formatRupiah(batch.totalNominal)}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteBatch(batch.batchId, batch.fileName)}
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #FECDD3',
                                borderRadius: 9999,
                                padding: '7px 16px',
                                fontSize: 12.5,
                                fontWeight: 500,
                                color: '#E11D48',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontFamily: 'inherit',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFF1F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <IconTrash size={12} />
                              <span>Hapus Batch</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </main>

      {/* ── MODAL POP-UP LIHAT REFERENSI & STATUS ORDERAN ── */}
      <AnimatePresence>
      {selectedOrder && (
        <ReferenceDetailModal
          key={selectedOrder.consultationId}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaveStatus={async (newStatus, feedback, estimasiHarga, shopeeUrl) => {
            saveOrderUpdate(selectedOrder.storageKey, selectedOrder.consultationId, newStatus, feedback, estimasiHarga, shopeeUrl);
            try {
              await fetch(`${BACKEND_URL}/api/v1/consultations/${encodeURIComponent(selectedOrder.consultationId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
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
            setSelectedOrder(null);
            refreshData();
            showToast(`Status orderan ${selectedOrder.consultationId} berhasil diubah menjadi ${newStatus}!`);
          }}
        />
      )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 10003,
            background: '#18181B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(24, 24, 27, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#22C55E' }}>
            <IconCheck size={16} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// ── DETAIL & STATUS MODAL COMPONENT ──
const ADMIN_QUICK_FEEDBACKS = [
  'Ukuran kuku & foto sudah sesuai.',
  'Foto kurang jelas / koin tidak terbaca, mohon unggah ulang di menu Ukuran Kuku.',
  'Ukuran disesuaikan berdasarkan foto.',
] as const;

function ReferenceDetailModal({
  order,
  onClose,
  onSaveStatus,
}: {
  order: AdminOrder;
  onClose: () => void;
  onSaveStatus: (status: AdminOrderStatus, feedback?: string, estimasiHarga?: string, shopeeUrl?: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>(() => normalizeOrderStatus(order.status));
  const [feedback, setFeedback] = useState(order.adminFeedback || '');
  const [estimasiHarga, setEstimasiHarga] = useState(order.estimasiHarga || 'Rp 145.000');
  const [shopeeUrl, setShopeeUrl] = useState(order.shopeeUrl || '');
  const [feedbackError, setFeedbackError] = useState('');
  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; label: string } | null>(null);

  const handleApplyFeedbackTemplate = (text: string) => {
    setFeedback(text);
    setFeedbackError('');
  };

  const handleSave = () => {
    if (selectedStatus === 'Ditolak' && !feedback.trim()) {
      setFeedbackError('Feedback / alasan penolakan wajib diisi untuk menginformasikan kepada customer.');
      return;
    }
    setFeedbackError('');
    onSaveStatus(selectedStatus, feedback.trim() || undefined, estimasiHarga.trim(), shopeeUrl.trim() || undefined);
  };

  const nailPhotoSlots: Array<{ key: string; label: string; url?: string }> = [
    {
      key: 'fourFingers',
      label: '4 Jari (Telunjuk – Kelingking)',
      url: order.nailPhotos?.fourFingersUrl,
    },
    {
      key: 'thumb',
      label: 'Ibu Jari (Jempol)',
      url: order.nailPhotos?.thumbUrl,
    },
  ];

  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
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
        padding: 16,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="dinail-modal-card max-w-[94vw] max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 32px',
          maxWidth: 'min(760px, 94vw)',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: 16,
            borderBottom: '1px solid #ECE6E0',
            marginBottom: 20,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Detail Pengajuan Desain &amp; Kelola Orderan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#141413', fontFamily: 'monospace', margin: 0 }}>
                {order.consultationId}
              </h2>
              <CopyPill text={order.consultationId} />
            </div>
            <p style={{ fontSize: 12, color: '#71717A', margin: '4px 0 0' }}>
              Customer: <strong style={{ color: '#141413' }}>{order.customerName || 'Customer'}</strong> · Masuk pada: {order.submittedAt}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            style={{
              background: '#F8F5F2',
              border: '1px solid #ECE6E0',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#141413',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: Grid 2 Kolom */}
        <div
          className="profil-two-col-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Kolom Kiri: Foto Referensi & Link */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#141413', marginBottom: 10 }}>
              Foto Referensi Desain
            </h4>
            <div
              style={{
                width: '100%',
                height: 220,
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #ECE6E0',
                backgroundColor: '#F8F5F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              {order.photoUrl ? (
                <Image
                  src={order.photoUrl}
                  alt="Referensi Desain Customer"
                  fill
                  sizes="(max-width: 768px) 92vw, 520px"
                  unoptimized={order.photoUrl.startsWith('data:')}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 12, color: '#71717A' }}>Tidak ada foto referensi</span>
              )}
            </div>

            {/* Link Referensi Desain */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A', display: 'block', marginBottom: 4 }}>
                Tautan / Link Referensi:
              </span>
              {order.referenceLink ? (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F8F5F2',
                    border: '1px solid #ECE6E0',
                    borderRadius: 8,
                    fontSize: 12,
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span style={{ color: '#141413', fontWeight: 500 }}>{order.referenceLink}</span>
                  <CopyPill text={order.referenceLink} />
                </div>
              ) : (
                <span style={{ fontSize: 12, color: '#71717A', fontStyle: 'italic' }}>
                  Customer tidak menyertakan link eksternal
                </span>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Rincian Ukuran Kuku & Catatan */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#141413', marginBottom: 10 }}>
              Informasi Kuku &amp; Kustomisasi
            </h4>

            {/* Ukuran Kuku */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F8F5F2',
                borderRadius: 10,
                border: '1px solid #ECE6E0',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>
                Ukuran Kuku Customer:
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#141413', margin: '4px 0 0' }}>
                {order.nailSizeSummary || 'Standar M'}
              </p>
            </div>

            {/* Catatan Tambahan */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F8F5F2',
                borderRadius: 10,
                border: '1px solid #ECE6E0',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>
                Catatan Kustomisasi Customer:
              </span>
              <p style={{ fontSize: 13, color: '#141413', margin: '4px 0 0', lineHeight: 1.5 }}>
                {order.notes ? `“${order.notes}”` : '(Tidak ada catatan khusus)'}
              </p>
            </div>

            {/* Estimasi Harga */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#71717A', display: 'block', marginBottom: 4 }}>
                Estimasi Harga Desain (Untuk Customer):
              </label>
              <input
                type="text"
                value={estimasiHarga}
                onChange={(e) => setEstimasiHarga(e.target.value)}
                placeholder="Contoh: Rp 145.000"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  border: '1px solid #ECE6E0',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── VERIFIKASI UKURAN KUKU (HASIL AI) — 2 FOTO BERDAMPINGAN ── */}
        <div
          style={{
            padding: '16px 18px',
            backgroundColor: '#FAF7F5',
            border: '1px solid #ECE6E0',
            borderRadius: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: 0 }}>
                Verifikasi Ukuran Kuku (Hasil AI)
              </h4>
            </div>

            {typeof order.aiConfidenceScore === 'number' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  backgroundColor: '#FFF5F0',
                  border: '1px solid rgba(243, 115, 56, 0.3)',
                  color: '#CF4500',
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Akurasi AI {order.aiConfidenceScore}%
              </span>
            )}
          </div>

          <p style={{ fontSize: 12.5, color: '#57534E', margin: '0 0 12px', lineHeight: 1.45 }}>
            Ringkasan ukuran aktif:{' '}
            <strong style={{ color: '#141413' }}>{order.nailSizeSummary || 'Standar M'}</strong>
          </p>

          <div className="admin-nail-photos-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nailPhotoSlots.map((slot) => (
              <div
                key={slot.key}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #ECE6E0',
                  borderRadius: 12,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#141413', lineHeight: 1.3 }}>
                  {slot.label}
                </span>

                {slot.url ? (
                  <button
                    type="button"
                    onClick={() => setZoomPhoto({ url: slot.url!, label: slot.label })}
                    aria-label={`Perbesar foto ${slot.label}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 3',
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: '1px solid #ECE6E0',
                      padding: 0,
                      backgroundColor: '#F3F0EE',
                      cursor: 'zoom-in',
                      display: 'block',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slot.url}
                      alt={slot.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        backgroundColor: 'rgba(20, 20, 19, 0.78)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 999,
                        lineHeight: 1.2,
                      }}
                    >
                      Perbesar
                    </span>
                  </button>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '4 / 3',
                      borderRadius: 10,
                      border: '1px dashed #DDD6CE',
                      backgroundColor: '#FAF7F5',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: 10,
                      textAlign: 'center',
                      color: '#71717A',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span style={{ fontSize: 11, lineHeight: 1.35 }}>
                      Belum ada foto ukuran kuku
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── BAGIAN UBAH STATUS & FEEDBACK ADMIN ── */}
        <div style={{ paddingTop: 18, borderTop: '1px solid #ECE6E0' }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#141413', marginBottom: 12 }}>
            Pilih Status Orderan
          </h4>

          {/* Status Buttons Segment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {(['Antrian', 'Disetujui', 'Ditolak'] as const).map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st);
                    if (st !== 'Ditolak') setFeedbackError('');
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: isSelected
                      ? st === 'Disetujui'
                        ? '2px solid #16A34A'
                        : st === 'Ditolak'
                        ? '2px solid #E11D48'
                        : '2px solid #F37338'
                      : '1px solid #ECE6E0',
                    background: isSelected
                      ? st === 'Disetujui'
                        ? '#F0FDF4'
                        : st === 'Ditolak'
                        ? '#FFF1F2'
                        : 'rgba(243, 115, 56, 0.08)'
                      : '#FFFFFF',
                    color: isSelected
                      ? st === 'Disetujui'
                        ? '#16A34A'
                        : st === 'Ditolak'
                        ? '#E11D48'
                        : '#F37338'
                      : '#6B6B6B',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Area Feedback Admin (Tampil saat Disetujui maupun Ditolak, dengan Quick-Fill di atas Textarea) */}
          <AnimatePresence initial={false}>
            {(selectedStatus === 'Disetujui' || selectedStatus === 'Ditolak') && (
              <motion.div
                key="admin-feedback-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden"
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    padding: '16px 18px',
                    backgroundColor: selectedStatus === 'Ditolak' ? '#FFF1F2' : '#FAF7F5',
                    border: selectedStatus === 'Ditolak' ? '1.5px solid #FECDD3' : '1px solid #ECE6E0',
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: selectedStatus === 'Ditolak' ? '#E11D48' : '#141413',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    {selectedStatus === 'Ditolak'
                      ? 'Feedback / Alasan Penolakan ke Customer * (Wajib Diisi)'
                      : 'Feedback Verifikasi ke Customer (Opsional)'}
                  </label>

                  {/* Tombol Quick-Fill di atas textarea */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {ADMIN_QUICK_FEEDBACKS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplyFeedbackTemplate(preset)}
                        style={{
                          backgroundColor: feedback === preset ? '#141413' : '#FFFFFF',
                          border: feedback === preset ? '1px solid #141413' : '1px solid #E5DDD5',
                          borderRadius: 9999,
                          padding: '5px 11px',
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: feedback === preset ? '#FFFFFF' : '#141413',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          lineHeight: 1.35,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      if (e.target.value.trim()) setFeedbackError('');
                    }}
                    placeholder={
                      selectedStatus === 'Ditolak'
                        ? 'Tuliskan alasan penolakan atau instruksi perbaikan (contoh: Foto kurang jelas / koin tidak terbaca...)'
                        : 'Tuliskan catatan verifikasi ukuran kuku atau instruksi tambahan untuk customer...'
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      border: feedbackError
                        ? '1px solid #DC2626'
                        : selectedStatus === 'Ditolak'
                        ? '1px solid #FECDD3'
                        : '1px solid #E5DDD5',
                      backgroundColor: '#FFFFFF',
                      color: '#141413',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  {feedbackError && (
                    <p style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 4 }}>
                      {feedbackError}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Area Khusus Jika Disetujui: Link Shopee */}
          {selectedStatus === 'Disetujui' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#71717A', display: 'block', marginBottom: 4 }}>
                Tautan Checkout Shopee (Opsional):
              </label>
              <input
                type="url"
                value={shopeeUrl}
                onChange={(e) => setShopeeUrl(e.target.value)}
                placeholder="https://shopee.co.id/dinail_co_custom_presson"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  border: '1px solid #ECE6E0',
                  borderRadius: 8,
                  background: '#F8F5F2',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="admin-modal-footer flex flex-col-reverse sm:flex-row gap-2.5" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              <span>Batal</span>
            </button>
            <button
              type="button"
              className={selectedStatus === 'Ditolak' ? undefined : 'btn-primary'}
              onClick={handleSave}
              style={
                selectedStatus === 'Ditolak'
                  ? {
                      padding: '10px 26px',
                      fontSize: 13,
                      fontWeight: 500,
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)',
                      transition: 'background-color 0.15s ease',
                    }
                  : {
                      padding: '10px 26px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'inherit',
                    }
              }
              onMouseEnter={(e) => {
                if (selectedStatus === 'Ditolak') e.currentTarget.style.backgroundColor = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                if (selectedStatus === 'Ditolak') e.currentTarget.style.backgroundColor = '#DC2626';
              }}
            >
              <span>
                {selectedStatus === 'Ditolak'
                  ? 'Kirim Penolakan & Feedback'
                  : 'Simpan Perubahan Status'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox / Zoom Foto Ukuran Kuku */}
      <AnimatePresence>
        {zoomPhoto && (
          <motion.div
            key="nail-photo-lightbox"
            onClick={(e) => {
              e.stopPropagation();
              setZoomPhoto(null);
            }}
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
                maxWidth: 'min(680px, 94vw)',
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
                    {zoomPhoto.label}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#696969', margin: '2px 0 0' }}>
                    Periksa posisi koin Rp 500 dan kelengkungan kuku pelanggan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomPhoto(null)}
                  aria-label="Tutup pratinjau besar"
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
                  maxHeight: '72vh',
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#F3F0EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomPhoto.url}
                  alt={zoomPhoto.label}
                  style={{
                    width: '100%',
                    maxHeight: '72vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
