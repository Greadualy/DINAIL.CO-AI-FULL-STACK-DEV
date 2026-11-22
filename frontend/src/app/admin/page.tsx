'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export type AdminMenu = 'penjualan' | 'orderan' | 'import';

export type AdminOrderStatus = 'Antrian' | 'Disetujui' | 'Ditolak';

export interface AdminOrder {
  consultationId: string;
  userId?: string;
  customerName?: string;
  nailSizeSummary?: string;
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

export interface UnifiedTransaction {
  id: string;
  tanggal: string;
  nama: string;
  item: string;
  channel: 'Online' | 'Offline';
  nominal: number;
  status?: string;
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
  const s = status.toLowerCase();
  if (s === 'antrian' || s === 'menunggu') return 'Antrian';
  if (s === 'disetujui' || s === 'siap_checkout' || s === 'proses' || s === 'selesai') return 'Disetujui';
  if (s === 'ditolak' || s === 'dibatalkan') return 'Ditolak';
  return 'Antrian';
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
                results.push({
                  ...ord,
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
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;

    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const updated = list.map((item) => {
      if (item.consultationId === consultationId) {
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

    localStorage.setItem(storageKey, JSON.stringify(updated));
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

function IconChart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
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
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('penjualan');
  const [orders, setOrders] = useState<AdminOrder[]>(() => loadAllConsultations());
  const [offlineSales, setOfflineSales] = useState<OfflineSaleItem[]>(() => loadOfflineSales());
  const [offlineBatches, setOfflineBatches] = useState<OfflineBatch[]>(() => loadOfflineBatches());

  // Modals & Forms
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<'Semua' | AdminOrderStatus>('Semua');
  const [transactionChannelFilter, setTransactionChannelFilter] = useState<'Semua' | 'Online' | 'Offline'>('Semua');
  const [searchTransaction, setSearchTransaction] = useState('');

  // Import State
  const [previewRows, setPreviewRows] = useState<Omit<OfflineSaleItem, 'id' | 'batchId' | 'batchFileName' | 'createdAt'>[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const refreshData = () => {
    setOrders(loadAllConsultations());
    setOfflineSales(loadOfflineSales());
    setOfflineBatches(loadOfflineBatches());
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const approvedOnline = orders.filter((o) => {
      const s = normalizeOrderStatus(o.status);
      return s === 'Disetujui';
    });

    const onlineRev = approvedOnline.reduce((sum, o) => {
      const nom = parseNominal(o.estimasiHarga);
      return sum + (nom > 0 ? nom : 145000);
    }, 0);

    const offlineRev = offlineSales.reduce((sum, s) => sum + s.nominal, 0);
    const totalRev = onlineRev + offlineRev;

    const antrianCount = orders.filter((o) => normalizeOrderStatus(o.status) === 'Antrian').length;
    const totalTx = approvedOnline.length + offlineSales.length;

    return {
      totalRev,
      onlineRev,
      onlineCount: approvedOnline.length,
      offlineRev,
      offlineCount: offlineSales.length,
      antrianCount,
      totalTx,
    };
  }, [orders, offlineSales]);

  // Unified Transactions
  const unifiedTransactions: UnifiedTransaction[] = useMemo(() => {
    const list: UnifiedTransaction[] = [];

    // Online approved orders
    orders.forEach((o) => {
      const s = normalizeOrderStatus(o.status);
      if (s === 'Disetujui') {
        list.push({
          id: o.consultationId,
          tanggal: o.reviewedAt || o.submittedAt.split(',')[0] || '2026-11-22',
          nama: o.customerName || 'Customer Online',
          item: o.designName || 'Custom Press-On Nails',
          channel: 'Online',
          nominal: parseNominal(o.estimasiHarga) || 145000,
          status: o.status,
        });
      }
    });

    // Offline sales
    offlineSales.forEach((s) => {
      list.push({
        id: s.id,
        tanggal: s.tanggal,
        nama: s.namaPelanggan,
        item: s.itemDesain,
        channel: 'Offline',
        nominal: s.nominal,
      });
    });

    // Sort descending by id/date
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }, [orders, offlineSales]);

  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      const matchChannel = transactionChannelFilter === 'Semua' || tx.channel === transactionChannelFilter;
      const q = searchTransaction.toLowerCase().trim();
      const matchSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.nama.toLowerCase().includes(q) ||
        tx.item.toLowerCase().includes(q);
      return matchChannel && matchSearch;
    });
  }, [unifiedTransactions, transactionChannelFilter, searchTransaction]);

  // Orders filtered
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter === 'Semua') return true;
      return normalizeOrderStatus(o.status) === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

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

  // Seed sample offline data for quick testing
  const handleSeedOfflineDemo = () => {
    const demoRows = [
      {
        tanggal: '2026-11-20',
        namaPelanggan: 'Dewi Anggraini',
        itemDesain: 'Blush Chrome Gradient',
        nominal: 135000,
        channel: 'Offline' as const,
      },
      {
        tanggal: '2026-11-21',
        namaPelanggan: 'Rina Kurnia',
        itemDesain: 'French Modern Almond',
        nominal: 150000,
        channel: 'Offline' as const,
      },
      {
        tanggal: '2026-11-22',
        namaPelanggan: 'Natasya Putri',
        itemDesain: 'Glazed Donut Nails',
        nominal: 120000,
        channel: 'Offline' as const,
      },
    ];

    const batchId = `batch_${Date.now()}`;
    const newItems: OfflineSaleItem[] = demoRows.map((row, idx) => ({
      ...row,
      id: `DNL-OFF-${Date.now().toString().slice(-4)}${String(idx + 1).padStart(2, '0')}`,
      batchId,
      batchFileName: 'sample_bazaar_jogja.xlsx',
      createdAt: new Date().toISOString(),
    }));

    const totalBatchNominal = newItems.reduce((acc, curr) => acc + curr.nominal, 0);
    const newBatch: OfflineBatch = {
      batchId,
      fileName: 'sample_bazaar_jogja.xlsx',
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

    showToast(`Berhasil menambahkan 3 contoh data penjualan offline (${formatRupiah(totalBatchNominal)})!`);
  };

  // File Upload Handler (CSV / XLSX)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', display: 'flex', color: '#141413' }}>
      {/* ── 1. SIDEBAR KIRI ── */}
      <aside
        style={{
          width: 260,
          background: '#FFFFFF',
          borderRight: '1px solid #EAE6E1',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
        }}
      >
        {/* Brand / Logo Header */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #EAE6E1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#141413' }}>
              dinail.co
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#F37338',
                display: 'inline-block',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F37338',
              background: '#FFF7F3',
              border: '1px solid #FDDCC8',
              padding: '2px 8px',
              borderRadius: 4,
              display: 'inline-block',
            }}
          >
            Admin Panel
          </span>
        </div>

        {/* Menu Navigasi Utama */}
        <nav style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Menu 1 */}
          <button
            type="button"
            onClick={() => setActiveMenu('penjualan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              background: activeMenu === 'penjualan' ? '#F3F0EE' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeMenu === 'penjualan' ? 700 : 500,
              color: '#141413',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ color: activeMenu === 'penjualan' ? '#F37338' : '#767676' }}>
              <IconChart size={18} />
            </span>
            <span style={{ flex: 1 }}>Dashboard Penjualan</span>
          </button>

          {/* Menu 2 */}
          <button
            type="button"
            onClick={() => setActiveMenu('orderan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              background: activeMenu === 'orderan' ? '#F3F0EE' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeMenu === 'orderan' ? 700 : 500,
              color: '#141413',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ color: activeMenu === 'orderan' ? '#F37338' : '#767676' }}>
              <IconClipboard size={18} />
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

          {/* Menu 3 */}
          <button
            type="button"
            onClick={() => setActiveMenu('import')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              background: activeMenu === 'import' ? '#F3F0EE' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeMenu === 'import' ? 700 : 500,
              color: '#141413',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ color: activeMenu === 'import' ? '#F37338' : '#767676' }}>
              <IconUploadCloud size={18} />
            </span>
            <span style={{ flex: 1 }}>Import Penjualan Offline</span>
          </button>
        </nav>

        {/* Footer Sidebar: Tombol Keluar / Ke Toko */}
        <div style={{ padding: '20px 20px 24px', borderTop: '1px solid #EAE6E1' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#767676',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <IconArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>

      {/* ── 2. AREA KONTEN UTAMA ── */}
      <main style={{ flex: 1, minWidth: 0, padding: '36px 40px 60px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28,
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#141413' }}>
              {activeMenu === 'penjualan' && 'Dashboard Penjualan'}
              {activeMenu === 'orderan' && 'Kelola Status Orderan'}
              {activeMenu === 'import' && 'Import Penjualan Offline (Sheet)'}
            </h1>
            <p style={{ fontSize: 13, color: '#696969', margin: '4px 0 0' }}>
              {activeMenu === 'penjualan' && 'Pantau ringkasan pendapatan terpadu dari channel Online & Offline'}
              {activeMenu === 'orderan' && 'Tinjau referensi desain kuku customer, kelola status, dan kirimkan feedback'}
              {activeMenu === 'import' && 'Unggah laporan penjualan offline dari event/bazaar dalam format CSV atau Excel (.xlsx)'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={refreshData}
              title="Perbarui Data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#141413',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <IconRefresh size={13} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: DASHBOARD PENJUALAN ── */}
        {activeMenu === 'penjualan' && (
          <div>
            {/* Flat KPI Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                marginBottom: 28,
                overflow: 'hidden',
              }}
            >
              {/* Metric 1 */}
              <div style={{ padding: '22px 24px', borderRight: '1px solid #EAE6E1' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Pendapatan
                </span>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#141413', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
                  {formatRupiah(metrics.totalRev)}
                </p>
                <span style={{ fontSize: 12, color: '#696969' }}>
                  Gabungan Online &amp; Offline
                </span>
              </div>

              {/* Metric 2 */}
              <div style={{ padding: '22px 24px', borderRight: '1px solid #EAE6E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#141413' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Penjualan Online
                  </span>
                </div>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#141413', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
                  {formatRupiah(metrics.onlineRev)}
                </p>
                <span style={{ fontSize: 12, color: '#696969' }}>
                  {metrics.onlineCount} pesanan disetujui
                </span>
              </div>

              {/* Metric 3 */}
              <div style={{ padding: '22px 24px', borderRight: '1px solid #EAE6E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F37338' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Penjualan Offline
                  </span>
                </div>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#F37338', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
                  {formatRupiah(metrics.offlineRev)}
                </p>
                <span style={{ fontSize: 12, color: '#696969' }}>
                  {metrics.offlineCount} item transaksi sheet
                </span>
              </div>

              {/* Metric 4 */}
              <div style={{ padding: '22px 24px' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Transaksi &amp; Antrian
                </span>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#141413', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
                  {metrics.totalTx}{' '}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#767676' }}>transaksi</span>
                </p>
                <span style={{ fontSize: 12, color: metrics.antrianCount > 0 ? '#F37338' : '#16A34A', fontWeight: 600 }}>
                  {metrics.antrianCount} orderan menunggu review
                </span>
              </div>
            </div>

            {/* Perbandingan & Visualisasi Grafik Penjualan */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                padding: '24px 28px',
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Perbandingan Kontribusi Penjualan (Online vs Offline)
                  </h3>
                  <p style={{ fontSize: 12, color: '#696969', margin: '3px 0 0' }}>
                    Visualisasi otomatis diperbarui saat data penjualan offline di-import
                  </p>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, backgroundColor: '#141413', borderRadius: 2 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#141413' }}>Online ({metrics.totalRev > 0 ? Math.round((metrics.onlineRev / metrics.totalRev) * 100) : 0}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, backgroundColor: '#F37338', borderRadius: 2 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#F37338' }}>Offline ({metrics.totalRev > 0 ? Math.round((metrics.offlineRev / metrics.totalRev) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>

              {/* Progress Split Bar */}
              <div
                style={{
                  height: 12,
                  width: '100%',
                  backgroundColor: '#F3F0EE',
                  borderRadius: 6,
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${metrics.totalRev > 0 ? (metrics.onlineRev / metrics.totalRev) * 100 : 50}%`,
                    backgroundColor: '#141413',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Online: ${formatRupiah(metrics.onlineRev)}`}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${metrics.totalRev > 0 ? (metrics.offlineRev / metrics.totalRev) * 100 : 50}%`,
                    backgroundColor: '#F37338',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Offline: ${formatRupiah(metrics.offlineRev)}`}
                />
              </div>

              {/* Minimalist Bar Chart Representation */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 40, padding: '0 20px', borderBottom: '1px solid #EAE6E1' }}>
                {/* Bar Online */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#141413', marginBottom: 6 }}>
                    {formatRupiah(metrics.onlineRev)}
                  </span>
                  <div
                    style={{
                      width: '50%',
                      maxWidth: 90,
                      height: `${metrics.totalRev > 0 ? Math.max(14, (metrics.onlineRev / Math.max(metrics.onlineRev, metrics.offlineRev || 1)) * 120) : 10}px`,
                      backgroundColor: '#141413',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#696969', marginTop: 10, fontWeight: 600 }}>
                    Online ({metrics.onlineCount} trx)
                  </span>
                </div>

                {/* Bar Offline */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#F37338', marginBottom: 6 }}>
                    {formatRupiah(metrics.offlineRev)}
                  </span>
                  <div
                    style={{
                      width: '50%',
                      maxWidth: 90,
                      height: `${metrics.totalRev > 0 ? Math.max(14, (metrics.offlineRev / Math.max(metrics.onlineRev, metrics.offlineRev || 1)) * 120) : 10}px`,
                      backgroundColor: '#F37338',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#696969', marginTop: 10, fontWeight: 600 }}>
                    Offline ({metrics.offlineCount} trx)
                  </span>
                </div>
              </div>
            </div>

            {/* Tabel Transaksi Terpadu */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                padding: '24px 28px',
              }}
            >
              <div
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
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Riwayat Transaksi Terpadu
                  </h3>
                  <p style={{ fontSize: 12, color: '#696969', margin: '3px 0 0' }}>
                    Menampilkan seluruh orderan online disetujui dan transaksi penjualan offline
                  </p>
                </div>

                {/* Filter Tabs & Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', background: '#F3F0EE', borderRadius: 8, padding: 3 }}>
                    {(['Semua', 'Online', 'Offline'] as const).map((tab) => {
                      const isActive = transactionChannelFilter === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setTransactionChannelFilter(tab)}
                          style={{
                            border: 'none',
                            background: isActive ? '#FFFFFF' : 'transparent',
                            color: isActive ? '#141413' : '#696969',
                            fontWeight: isActive ? 700 : 500,
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    placeholder="Cari transaksi / pelanggan..."
                    value={searchTransaction}
                    onChange={(e) => setSearchTransaction(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      fontSize: 12,
                      border: '1px solid #EAE6E1',
                      borderRadius: 8,
                      background: '#F9F8F6',
                      color: '#141413',
                      outline: 'none',
                      minWidth: 200,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Tabel */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #EAE6E1', color: '#767676', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>ID / Kode Transaksi</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tanggal</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Nama Pelanggan &amp; Item</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Channel</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '36px 14px', textAlign: 'center', color: '#767676' }}>
                          Belum ada data transaksi yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: '1px solid #EAE6E1',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 600, color: '#141413' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{tx.id}</span>
                              <CopyPill text={tx.id} />
                            </div>
                          </td>
                          <td style={{ padding: '14px', color: '#696969', whiteSpace: 'nowrap' }}>
                            {tx.tanggal}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <p style={{ fontWeight: 600, color: '#141413', margin: 0 }}>
                              {tx.nama}
                            </p>
                            <span style={{ fontSize: 12, color: '#767676' }}>
                              {tx.item}
                            </span>
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
                                background: tx.channel === 'Online' ? '#F3F0EE' : '#FFF7F3',
                                color: tx.channel === 'Online' ? '#141413' : '#F37338',
                                border: tx.channel === 'Online' ? '1px solid #EAE6E1' : '1px solid #FDDCC8',
                              }}
                            >
                              {tx.channel}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: '#141413' }}>
                            {formatRupiah(tx.nominal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: STATUS ORDERAN & MODAL REFERENSI ── */}
        {activeMenu === 'orderan' && (
          <div>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                padding: '24px 28px',
              }}
            >
              {/* Header filter */}
              <div
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
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Daftar Pengajuan Konsultasi &amp; Orderan Masuk
                  </h3>
                  <p style={{ fontSize: 12, color: '#696969', margin: '3px 0 0' }}>
                    Data terhubung langsung dari halaman profil customer. Klik &ldquo;Lihat Referensi&rdquo; untuk meninjau dan mengubah status.
                  </p>
                </div>

                {/* Filter Status Tabs */}
                <div style={{ display: 'flex', background: '#F3F0EE', borderRadius: 8, padding: 3 }}>
                  {(['Semua', 'Antrian', 'Disetujui', 'Ditolak'] as const).map((tab) => {
                    const isActive = orderStatusFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setOrderStatusFilter(tab)}
                        style={{
                          border: 'none',
                          background: isActive ? '#FFFFFF' : 'transparent',
                          color: isActive ? '#141413' : '#696969',
                          fontWeight: isActive ? 700 : 500,
                          padding: '6px 14px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table Orderan */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #EAE6E1', color: '#767676', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>ID Konsultasi</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tanggal Masuk</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Ukuran Kuku</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Referensi Desain</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#767676' }}>
                          Belum ada pengajuan orderan pada status ini.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const currentStatusNorm = normalizeOrderStatus(ord.status);
                        return (
                          <tr
                            key={ord.consultationId}
                            style={{
                              borderBottom: '1px solid #EAE6E1',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 600, color: '#141413' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>{ord.consultationId}</span>
                                <CopyPill text={ord.consultationId} />
                              </div>
                            </td>
                            <td style={{ padding: '14px', color: '#696969', whiteSpace: 'nowrap' }}>
                              {ord.submittedAt}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <p style={{ fontWeight: 600, color: '#141413', margin: 0 }}>
                                {ord.customerName || 'Customer'}
                              </p>
                              {ord.notes && (
                                <p style={{ fontSize: 11, color: '#767676', margin: '2px 0 0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                                onClick={() => setSelectedOrder(ord)}
                                style={{
                                  background: '#F3F0EE',
                                  border: '1px solid #EAE6E1',
                                  borderRadius: 6,
                                  padding: '5px 12px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#141413',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Lihat Referensi
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
                                onClick={() => setSelectedOrder(ord)}
                                style={{
                                  background: '#141413',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Kelola Status
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: IMPORT PENJUALAN OFFLINE ── */}
        {activeMenu === 'import' && (
          <div>
            {/* Box Upload */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                padding: '28px 32px',
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: 0 }}>
                    Unggah Berkas Penjualan Offline (.csv / .xlsx)
                  </h3>
                  <p style={{ fontSize: 12, color: '#696969', margin: '3px 0 0' }}>
                    Sistem akan mengekstrak tanggal, nama pelanggan, item desain, dan nominal secara otomatis.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'none',
                      border: '1px solid #D1CDC7',
                      borderRadius: 8,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#141413',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <IconDownload size={13} />
                    <span>Unduh Template CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSeedOfflineDemo}
                    style={{
                      background: '#F3F0EE',
                      border: '1px solid #EAE6E1',
                      borderRadius: 8,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#141413',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    + Muat Contoh Data (Demo)
                  </button>
                </div>
              </div>

              {/* Area Drag-and-Drop / Upload */}
              <div
                style={{
                  border: '1px dashed #D5D0C8',
                  borderRadius: 12,
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <div style={{ color: '#767676', marginBottom: 10 }}>
                  <IconUploadCloud size={32} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#141413', margin: '0 0 4px' }}>
                  Pilih atau Tarik Berkas ke Sini
                </p>
                <p style={{ fontSize: 12, color: '#767676', margin: '0 0 16px' }}>
                  Mendukung berkas Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  style={{
                    padding: '9px 24px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Pilih Berkas Komputer
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {importError && (
                <div
                  style={{
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
                    borderTop: '1px solid #EAE6E1',
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
                      <p style={{ fontSize: 12, color: '#696969', margin: '2px 0 0' }}>
                        Ditemukan <strong>{previewRows.length} baris transaksi</strong> dengan total nominal{' '}
                        <strong style={{ color: '#F37338' }}>
                          {formatRupiah(previewRows.reduce((a, b) => a + b.nominal, 0))}
                        </strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewRows(null);
                          setPreviewFileName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #EAE6E1',
                          borderRadius: 8,
                          padding: '8px 18px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#141413',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="btn-primary"
                        style={{
                          padding: '8px 24px',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Gabungkan ke Data Penjualan →
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div style={{ overflowX: 'auto', maxHeight: 280, border: '1px solid #EAE6E1', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#F3F0EE' }}>
                        <tr style={{ borderBottom: '1px solid #EAE6E1', color: '#767676' }}>
                          <th style={{ padding: '8px 12px' }}>No</th>
                          <th style={{ padding: '8px 12px' }}>Tanggal</th>
                          <th style={{ padding: '8px 12px' }}>Nama Pelanggan</th>
                          <th style={{ padding: '8px 12px' }}>Item Desain</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #EAE6E1' }}>
                            <td style={{ padding: '8px 12px', color: '#767676' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 12px', color: '#696969' }}>{row.tanggal}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.namaPelanggan}</td>
                            <td style={{ padding: '8px 12px', color: '#696969' }}>{row.itemDesain}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                              {formatRupiah(row.nominal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewRows.length > 10 && (
                    <p style={{ fontSize: 11, color: '#767676', marginTop: 6, textAlign: 'center' }}>
                      (Menampilkan 10 baris pertama dari {previewRows.length} data yang terbaca)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Riwayat Batch yang Pernah Di-import */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE6E1',
                borderRadius: 14,
                padding: '24px 28px',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#141413', margin: '0 0 16px' }}>
                Riwayat Berkas yang Pernah Di-import
              </h3>

              {offlineBatches.length === 0 ? (
                <p style={{ fontSize: 13, color: '#767676', margin: '20px 0', textAlign: 'center' }}>
                  Belum ada berkas offline yang di-import.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EAE6E1', color: '#767676', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Nama Berkas</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Waktu Import</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Jumlah Transaksi</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Total Nominal</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offlineBatches.map((batch) => (
                        <tr key={batch.batchId} style={{ borderBottom: '1px solid #EAE6E1' }}>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#141413' }}>
                            {batch.fileName}
                          </td>
                          <td style={{ padding: '14px', color: '#696969' }}>
                            {batch.importedAt}
                          </td>
                          <td style={{ padding: '14px', color: '#141413' }}>
                            {batch.rowCount} baris
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, color: '#F37338' }}>
                            {formatRupiah(batch.totalNominal)}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteBatch(batch.batchId, batch.fileName)}
                              style={{
                                background: 'none',
                                border: '1px solid #FECDD3',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#E11D48',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontFamily: 'inherit',
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
          </div>
        )}
      </main>

      {/* ── MODAL POP-UP LIHAT REFERENSI & STATUS ORDERAN ── */}
      {selectedOrder && (
        <ReferenceDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaveStatus={(newStatus, feedback, estimasiHarga, shopeeUrl) => {
            saveOrderUpdate(selectedOrder.storageKey, selectedOrder.consultationId, newStatus, feedback, estimasiHarga, shopeeUrl);
            setSelectedOrder(null);
            refreshData();
            showToast(`Status orderan ${selectedOrder.consultationId} berhasil diubah menjadi ${newStatus}!`);
          }}
        />
      )}

      {/* ── TOAST NOTIFICATION ── */}
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

  return (
    <div
      onClick={onClose}
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
          padding: '28px 32px',
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
          position: 'relative',
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
            <span style={{ fontSize: 11, fontWeight: 700, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Detail Pengajuan Desain &amp; Kelola Orderan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#141413', fontFamily: 'monospace', margin: 0 }}>
                {order.consultationId}
              </h2>
              <CopyPill text={order.consultationId} />
            </div>
            <p style={{ fontSize: 12, color: '#767676', margin: '4px 0 0' }}>
              Customer: <strong>{order.customerName || 'Customer'}</strong> · Masuk pada: {order.submittedAt}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            style={{
              background: '#F3F0EE',
              border: 'none',
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
                border: '1px solid #EAE6E1',
                backgroundColor: '#F3F0EE',
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
                  unoptimized={order.photoUrl.startsWith('data:')}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 12, color: '#767676' }}>Tidak ada foto referensi</span>
              )}
            </div>

            {/* Link Referensi Desain */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', display: 'block', marginBottom: 4 }}>
                Tautan / Link Referensi:
              </span>
              {order.referenceLink ? (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F3F0EE',
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
                <span style={{ fontSize: 12, color: '#888888', fontStyle: 'italic' }}>
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
                backgroundColor: '#F3F0EE',
                borderRadius: 10,
                border: '1px solid #EAE6E1',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
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
                backgroundColor: '#F3F0EE',
                borderRadius: 10,
                border: '1px solid #EAE6E1',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', textTransform: 'uppercase' }}>
                Catatan Kustomisasi Customer:
              </span>
              <p style={{ fontSize: 13, color: '#141413', margin: '4px 0 0', lineHeight: 1.5 }}>
                {order.notes ? `“${order.notes}”` : '(Tidak ada catatan khusus)'}
              </p>
            </div>

            {/* Estimasi Harga */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#767676', display: 'block', marginBottom: 4 }}>
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
                  border: '1px solid #EAE6E1',
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

        {/* ── BAGIAN UBAH STATUS & FEEDBACK PENOLAKAN ── */}
        <div style={{ paddingTop: 18, borderTop: '1px solid #EAE6E1' }}>
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
                        : '2px solid #141413'
                      : '1px solid #EAE6E1',
                    background: isSelected
                      ? st === 'Disetujui'
                        ? '#F0FDF4'
                        : st === 'Ditolak'
                        ? '#FFF1F2'
                        : '#F3F0EE'
                      : '#FFFFFF',
                    color: isSelected
                      ? st === 'Disetujui'
                        ? '#16A34A'
                        : st === 'Ditolak'
                        ? '#E11D48'
                        : '#141413'
                      : '#696969',
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

          {/* Area Khusus Jika Ditolak: Input Feedback Wajib */}
          {selectedStatus === 'Ditolak' && (
            <div
              style={{
                padding: '16px 18px',
                backgroundColor: '#FFF1F2',
                border: '1.5px solid #FECDD3',
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <label style={{ fontSize: 12, fontWeight: 700, color: '#E11D48', display: 'block', marginBottom: 6 }}>
                Feedback / Alasan Penolakan ke Customer * (Wajib Diisi)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (e.target.value.trim()) setFeedbackError('');
                }}
                placeholder="Tuliskan alasan penolakan atau instruksi perbaikan (contoh: Foto kuku kurang jelas, mohon ambil foto ulang dengan koin pembanding...)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 13,
                  borderRadius: 8,
                  border: feedbackError ? '1px solid #DC2626' : '1px solid #FECDD3',
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

              {/* Template Alasan Cepat */}
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#767676', display: 'block', marginBottom: 4 }}>
                  Pilih cepat alasan umum:
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    'Foto kuku kurang jelas, mohon foto ulang tegak lurus dengan koin Rp 500.',
                    'Detail desain terlalu kompleks untuk bentuk kuku yang dipilih.',
                    'Charm atau aksesori untuk model desain ini sedang kehabisan stok.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyFeedbackTemplate(preset)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #EAE6E1',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        color: '#696969',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      + {preset.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Area Khusus Jika Disetujui: Link Shopee */}
          {selectedStatus === 'Disetujui' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#767676', display: 'block', marginBottom: 4 }}>
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
                  border: '1px solid #EAE6E1',
                  borderRadius: 8,
                  background: '#F9F8F6',
                  color: '#141413',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'none',
                border: '1px solid #EAE6E1',
                fontSize: 13,
                fontWeight: 600,
                color: '#141413',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: selectedStatus === 'Ditolak' ? '#DC2626' : undefined,
              }}
            >
              {selectedStatus === 'Ditolak'
                ? 'Kirim Penolakan & Feedback'
                : 'Simpan Perubahan Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
