'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '@/components/Skeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  type AdminOrder,
  type AdminOrderStatus,
  CopyPill,
  IconInboxEmpty,
  normalizeOrderStatus,
  patchConsultationWithAuth,
} from '@/components/dashboard/dashboardShared';

export interface OrderStatusViewProps {
  orders: AdminOrder[];
  isLoading: boolean;
  onOrderSaved: (updatedOrder: AdminOrder) => Promise<void> | void;
  onShowToast: (message: string) => void;
  layoutIdPrefix?: string;
}

const ADMIN_QUICK_FEEDBACKS = [
  'Ukuran kuku & foto sudah sesuai.',
  'Foto kurang jelas / koin tidak terbaca, mohon unggah ulang di menu Ukuran Kuku.',
  'Ukuran disesuaikan berdasarkan foto.',
] as const;

export default function OrderStatusView({
  orders,
  isLoading,
  onOrderSaved,
  onShowToast,
  layoutIdPrefix = 'admin',
}: OrderStatusViewProps) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<'Semua' | AdminOrderStatus>('Semua');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter === 'Semua') return true;
      return normalizeOrderStatus(o.status) === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

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

  return (
    <>
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
                      layoutId={`${layoutIdPrefix}-status-tab`}
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
          {isLoading ? (
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
                {isLoading ? (
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

      {/* ── MODAL POP-UP LIHAT REFERENSI & STATUS ORDERAN ── */}
      <AnimatePresence>
        {selectedOrder && (
          <ReferenceDetailModal
            key={selectedOrder.consultationId}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onSaveStatus={async (newStatus, feedback, estimasiHarga, shopeeUrl) => {
              const targetOrder = selectedOrder;
              await patchConsultationWithAuth(targetOrder, newStatus, feedback, estimasiHarga, shopeeUrl);
              const updatedOrder: AdminOrder = {
                ...targetOrder,
                status: newStatus,
                adminFeedback: feedback !== undefined ? feedback : targetOrder.adminFeedback,
                estimasiHarga: estimasiHarga || targetOrder.estimasiHarga || 'Rp 145.000',
                shopeeUrl: shopeeUrl !== undefined ? shopeeUrl : targetOrder.shopeeUrl,
                reviewedAt: new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
              };
              setSelectedOrder(null);
              await onOrderSaved(updatedOrder);
              onShowToast(`Status orderan ${targetOrder.consultationId} berhasil diubah menjadi ${newStatus}!`);
            }}
          />
        )}
      </AnimatePresence>
    </>
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
  onSaveStatus: (status: AdminOrderStatus, feedback?: string, estimasiHarga?: string, shopeeUrl?: string) => Promise<void> | void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>(() => normalizeOrderStatus(order.status));
  const [feedback, setFeedback] = useState(order.adminFeedback || '');
  const [estimasiHarga, setEstimasiHarga] = useState(order.estimasiHarga || 'Rp 145.000');
  const [shopeeUrl, setShopeeUrl] = useState(order.shopeeUrl || '');
  const [feedbackError, setFeedbackError] = useState('');
  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; label: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleApplyFeedbackTemplate = (text: string) => {
    setFeedback(text);
    setFeedbackError('');
  };

  const handleRequestSave = () => {
    if (selectedStatus === 'Ditolak' && !feedback.trim()) {
      setFeedbackError('Feedback / alasan penolakan wajib diisi untuk menginformasikan kepada customer.');
      return;
    }
    setFeedbackError('');
    setIsConfirmOpen(true);
  };

  const handleConfirmedSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSaveStatus(
        selectedStatus,
        feedback.trim() || undefined,
        estimasiHarga.trim(),
        shopeeUrl.trim() || undefined
      );
      setIsConfirmOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const statusConfirmMeta =
    selectedStatus === 'Ditolak'
      ? {
          title: 'Tolak Orderan Ini?',
          description: `Orderan ${order.consultationId} (${order.customerName || 'Customer'}) akan ditandai Ditolak dan feedback penolakan akan dikirimkan ke halaman profil customer.`,
          confirmText: 'Ya, Tolak Orderan',
          variant: 'danger' as const,
        }
      : selectedStatus === 'Disetujui'
      ? {
          title: 'Setujui Orderan Ini?',
          description: `Orderan ${order.consultationId} (${order.customerName || 'Customer'}) akan disetujui dengan estimasi ${estimasiHarga.trim() || 'Rp 145.000'} agar customer dapat melanjutkan checkout.`,
          confirmText: 'Ya, Setujui Orderan',
          variant: 'primary' as const,
        }
      : {
          title: 'Simpan Status Antrian?',
          description: `Status orderan ${order.consultationId} (${order.customerName || 'Customer'}) akan disimpan sebagai Antrian.`,
          confirmText: 'Ya, Simpan Status',
          variant: 'primary' as const,
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
      onClick={() => {
        if (!isSaving && !isConfirmOpen) onClose();
      }}
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
              onClick={handleRequestSave}
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
      {/* Modal Konfirmasi Perubahan Status Orderan */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={statusConfirmMeta.title}
        description={statusConfirmMeta.description}
        confirmText={statusConfirmMeta.confirmText}
        variant={statusConfirmMeta.variant}
        isLoading={isSaving}
        onConfirm={handleConfirmedSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </motion.div>
  );
}
