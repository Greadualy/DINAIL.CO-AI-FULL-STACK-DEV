'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useRole } from '@/context/RoleContext';
import OrderStatusView from '@/components/dashboard/OrderStatusView';
import OfflineSalesImportView from '@/components/dashboard/OfflineSalesImportView';
import {
  type AdminOrder,
  type AdminOrderStatus,
  type OfflineSaleItem,
  type OfflineBatch,
  fetchConsultationsWithAuth,
  loadAllConsultations,
  loadOfflineSales,
  loadOfflineBatches,
  normalizeOrderStatus,
  IconClipboard,
  IconUploadCloud,
  IconArrowLeft,
  IconRefresh,
  IconCheck,
} from '@/components/dashboard/dashboardShared';

export type AdminMenu = 'orderan' | 'import';
export type { AdminOrder, AdminOrderStatus, OfflineSaleItem, OfflineBatch };

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

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [refreshNotice, setRefreshNotice] = useState<'idle' | 'loading' | 'done'>('idle');
  const refreshNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const syncConsultationsFromBackend = useCallback(async () => {
    const merged = await fetchConsultationsWithAuth();
    if (merged) {
      setOrders(merged);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !canAccessAdmin) return;
    let isMounted = true;
    fetchConsultationsWithAuth().then((merged) => {
      if (isMounted && merged) {
        setOrders(merged);
      }
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

  const refreshData = useCallback(async () => {
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
      await Promise.all([syncConsultationsFromBackend(), minDelay]);
    } finally {
      setIsRefreshing(false);
      setRefreshNotice('done');
      refreshNoticeTimerRef.current = setTimeout(() => {
        setRefreshNotice('idle');
        refreshNoticeTimerRef.current = null;
      }, 2200);
    }
  }, [isRefreshing, syncConsultationsFromBackend]);

  const handleOrderSaved = useCallback(
    async (updatedOrder: AdminOrder) => {
      setOrders((prev) =>
        prev.map((item) =>
          item.consultationId === updatedOrder.consultationId ? updatedOrder : item
        )
      );
      await syncConsultationsFromBackend();
    },
    [syncConsultationsFromBackend]
  );

  const handleOfflineDataChange = useCallback(
    (nextSales: OfflineSaleItem[], nextBatches: OfflineBatch[]) => {
      setOfflineSales(nextSales);
      setOfflineBatches(nextBatches);
    },
    []
  );

  const metrics = useMemo(() => {
    const antrianCount = orders.filter((o) => normalizeOrderStatus(o.status) === 'Antrian').length;
    return { antrianCount };
  }, [orders]);

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

        {/* Menu Navigasi Utama (Khusus 2 Menu Operasional) */}
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
        {/* Header Bar */}
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
            {activeMenu === 'orderan' && (
              <motion.div
                key="admin-tab-orderan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <OrderStatusView
                  orders={orders}
                  isLoading={showOrderSkeleton}
                  onOrderSaved={handleOrderSaved}
                  onShowToast={showToast}
                  layoutIdPrefix="admin"
                />
              </motion.div>
            )}

            {activeMenu === 'import' && (
              <motion.div
                key="admin-tab-import"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <OfflineSalesImportView
                  offlineSales={offlineSales}
                  offlineBatches={offlineBatches}
                  onOfflineDataChange={handleOfflineDataChange}
                  onShowToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

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
