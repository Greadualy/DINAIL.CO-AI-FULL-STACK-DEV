'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '@/components/Skeleton';
import { useRole } from '@/context/RoleContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type OwnerMenu = 'penjualan' | 'insight';
type TimeRange = '7d' | '30d' | 'bulan' | 'semua';

interface DailySeries {
  date: string;      // 'DD MMM'
  online: number;
  offline: number;
}

interface DesignTrend {
  name: string;
  score: number;    // 0-100
  delta: 'up' | 'down' | 'flat';
}

interface NailShapeShare {
  shape: string;
  pct: number;
}

interface SizeShare {
  label: string;
  pct: number;
}

// ─── localStorage Keys ───────────────────────────────────────────────────────

const LS_KEY_OFFLINE_SALES = 'dinail_offline_sales';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function parseNominal(v: string | number | undefined): number {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (!v) return 0;
  const c = String(v).replace(/[^0-9]/g, '');
  const n = parseInt(c, 10);
  return isNaN(n) ? 0 : n;
}

function isApproved(status: string): boolean {
  const s = (status || '').toLowerCase();
  return ['disetujui', 'siap_checkout', 'proses', 'selesai', 'confirmed', 'in_progress', 'completed'].includes(s);
}

const ID_MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agt: 7, agustus: 7, aug: 7,
  sep: 8, sept: 8, september: 8,
  okt: 9, oktober: 9, oct: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11,
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function parseTransactionDate(input: string | undefined): Date | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // Format ISO YYYY-MM-DD (hindari pergeseran timezone UTC)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const dt = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    if (!isNaN(dt.getTime())) return startOfLocalDay(dt);
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY (umum dari impor Excel)
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const dt = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    if (!isNaN(dt.getTime())) return startOfLocalDay(dt);
  }

  // Format lokal Indonesia: "25 Nov 2026, 14:30" atau "25 Nov 2026"
  const idMatch = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (idMatch) {
    const monthIdx = ID_MONTH_MAP[idMatch[2].toLowerCase()];
    if (monthIdx !== undefined) {
      const dt = new Date(Number(idMatch[3]), monthIdx, Number(idMatch[1]));
      if (!isNaN(dt.getTime())) return startOfLocalDay(dt);
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return startOfLocalDay(parsed);
  return null;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

interface OfflineSaleItem {
  id: string;
  tanggal: string;
  nominal: number;
  itemDesain?: string;
}

interface AdminOrder {
  consultationId: string;
  status: string;
  submittedAt: string;
  estimasiHarga: string;
  serviceType?: string;
  nailSizeSummary?: string;
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
            list.forEach((o) => { if (o && o.consultationId) results.push(o); });
          }
        }
      }
    }
  } catch { }
  return results;
}

function loadOfflineSales(): OfflineSaleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY_OFFLINE_SALES);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [];
}

// ─── Demo / Fallback Data ─────────────────────────────────────────────────────

function buildDemoDailySeries(startDate: Date, endDate: Date): DailySeries[] {
  const series: DailySeries[] = [];
  const cursor = startOfLocalDay(startDate);
  const end = startOfLocalDay(endDate);
  let idx = 0;

  while (cursor <= end) {
    const label = formatDayLabel(cursor);
    const baseOnline = 385000 + Math.sin(idx * 0.6) * 180000 + Math.cos(idx * 1.1) * 45000;
    const baseOffline = 245000 + Math.cos(idx * 0.4) * 120000 + Math.sin(idx * 0.9) * 30000;
    series.push({
      date: label,
      online: Math.max(80000, Math.round(baseOnline)),
      offline: Math.max(50000, Math.round(baseOffline)),
    });
    cursor.setDate(cursor.getDate() + 1);
    idx += 1;
  }
  return series;
}

function buildForecastSeries(): { date: string; actual: number | null; predicted: number | null; lo: number | null; hi: number | null }[] {
  const series: { date: string; actual: number | null; predicted: number | null; lo: number | null; hi: number | null }[] = [];
  const now = new Date(2026, 10, 25);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const val = 455000 + Math.sin(i * 0.5) * 160000 + Math.cos(i * 0.8) * 40000;
    series.push({ date: label, actual: Math.round(val), predicted: null, lo: null, hi: null });
  }
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const baseVal = 490000 + i * 8000 + Math.sin(i * 0.7) * 60000;
    const spread = 90000 + i * 5000;
    series.push({
      date: label,
      actual: null,
      predicted: Math.round(baseVal),
      lo: Math.round(baseVal - spread),
      hi: Math.round(baseVal + spread),
    });
  }
  return series;
}

const DEMO_DESIGN_TRENDS: DesignTrend[] = [
  { name: 'Glazed Donut', score: 92, delta: 'up' },
  { name: 'Blush Chrome Gradient', score: 84, delta: 'up' },
  { name: 'Milky French Classic', score: 76, delta: 'flat' },
  { name: 'Jelly Nails Pastel', score: 68, delta: 'up' },
  { name: 'Dark Floral Noir', score: 55, delta: 'down' },
];

const DEMO_NAIL_SHAPES: NailShapeShare[] = [
  { shape: 'Almond', pct: 38 },
  { shape: 'Coffin', pct: 27 },
  { shape: 'Oval', pct: 18 },
  { shape: 'Square', pct: 11 },
  { shape: 'Stiletto', pct: 6 },
];

const DEMO_SIZE_SHARES: SizeShare[] = [
  { label: 'XS', pct: 14 },
  { label: 'S', pct: 29 },
  { label: 'M', pct: 36 },
  { label: 'L', pct: 21 },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconTrendLine({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconTarget({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconArrowLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconChevronUp({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function IconChevronDown({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconMinus({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconInfo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconStar({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconClock({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconRepeat({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

// ─── SVG Chart Components ─────────────────────────────────────────────────────

function AreaLineChart({
  series,
  height = 180,
  colorOnline = '#141413',
  colorOffline = '#F37338',
}: {
  series: DailySeries[];
  height?: number;
  colorOnline?: string;
  colorOffline?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 600;
  const padL = 48;
  const padR = 28;
  const padT = 10;
  const padB = 32;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const n = series.length;
  if (n === 0) return null;
  const totalValues = series.flatMap((d) => [d.online, d.offline]);
  const maxVal = Math.max(...totalValues, 1);
  const xOf = (i: number) => (n === 1 ? padL + chartW / 2 : padL + (i / (n - 1)) * chartW);
  const yOf = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const onlinePath = series.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(d.online)}`).join(' ');
  const offlinePath = series.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(d.offline)}`).join(' ');
  const onlineArea = `${onlinePath} L${xOf(n - 1)},${padT + chartH} L${xOf(0)},${padT + chartH} Z`;
  const offlineArea = `${offlinePath} L${xOf(n - 1)},${padT + chartH} L${xOf(0)},${padT + chartH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ val: maxVal * f, y: yOf(maxVal * f) }));

  // Hitung label sumbu X dengan interval rapi dan selalu menampilkan tanggal terakhir (hari ini)
  const xLabelIndices: number[] = [];
  if (n <= 8) {
    for (let i = 0; i < n; i++) xLabelIndices.push(i);
  } else {
    const step = Math.max(1, Math.ceil((n - 1) / 5));
    for (let i = 0; i < n; i += step) {
      xLabelIndices.push(i);
    }
    const lastIdx = n - 1;
    if (xLabelIndices[xLabelIndices.length - 1] !== lastIdx) {
      const prevIdx = xLabelIndices[xLabelIndices.length - 1];
      if (lastIdx - prevIdx < Math.max(2, Math.floor(step * 0.6))) {
        xLabelIndices[xLabelIndices.length - 1] = lastIdx;
      } else {
        xLabelIndices.push(lastIdx);
      }
    }
  }
  const xLabels = xLabelIndices.map((idx) => ({ label: series[idx].date, x: xOf(idx) }));
  const activePoint = hoveredIdx !== null ? series[hoveredIdx] : null;
  const activeLeftPct = hoveredIdx !== null ? (xOf(hoveredIdx) / width) * 100 : 50;

  return (
    <div className="owner-chart-scroll w-full overflow-x-auto pb-2" onMouseLeave={() => setHoveredIdx(null)}>
      <div className="owner-chart-inner min-w-[440px] sm:min-w-0" style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="gradOnline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorOnline} stopOpacity="0.08" />
            <stop offset="100%" stopColor={colorOnline} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradOffline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorOffline} stopOpacity="0.1" />
            <stop offset="100%" stopColor={colorOffline} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={padL + chartW} y2={t.y} stroke="#EAE6E1" strokeWidth="1" />
            <text x={padL - 6} y={t.y + 4} fontSize="9" fill="#9B978F" textAnchor="end">
              {t.val >= 1000000 ? `${(t.val / 1000000).toFixed(1)}M` : t.val >= 1000 ? `${Math.round(t.val / 1000)}K` : t.val === 0 ? '0' : ''}
            </text>
          </g>
        ))}
        <motion.path
          d={offlineArea}
          fill="url(#gradOffline)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={onlineArea}
          fill="url(#gradOnline)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={offlinePath}
          fill="none"
          stroke={colorOffline}
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
        <motion.path
          d={onlinePath}
          fill="none"
          stroke={colorOnline}
          strokeWidth="1.75"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
        {hoveredIdx !== null && activePoint && (
          <g>
            <line
              x1={xOf(hoveredIdx)}
              y1={padT}
              x2={xOf(hoveredIdx)}
              y2={padT + chartH}
              stroke="#D1CDC7"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={xOf(hoveredIdx)} cy={yOf(activePoint.online)} r="3.5" fill={colorOnline} stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx={xOf(hoveredIdx)} cy={yOf(activePoint.offline)} r="3.5" fill={colorOffline} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}
        {series.map((_, i) => {
          const sliceW = chartW / Math.max(n, 1);
          const x = Math.max(padL, xOf(i) - sliceW / 2);
          return (
            <rect
              key={i}
              x={x}
              y={padT}
              width={sliceW}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
            />
          );
        })}
        {xLabels.map((l, i) => (
          <text key={i} x={l.x} y={padT + chartH + 18} fontSize="9" fill="#9B978F" textAnchor="middle">{l.label}</text>
        ))}
      </svg>

      <AnimatePresence>
        {activePoint && hoveredIdx !== null && (
          <motion.div
            key={`area-tip-${hoveredIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 6,
              left: `${Math.min(72, Math.max(24, activeLeftPct))}%`,
              transform: 'translateX(-50%)',
              background: '#141413',
              color: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              pointerEvents: 'none',
              boxShadow: '0 8px 20px rgba(20,20,19,0.2)',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#D1CDC7' }}>{activePoint.date}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: '#E8E2DA' }}>Online</span>
              <strong>{formatRupiah(activePoint.online)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
              <span style={{ color: '#F37338' }}>Offline</span>
              <strong>{formatRupiah(activePoint.offline)}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function ForecastChart({
  series,
  height = 180,
}: {
  series: { date: string; actual: number | null; predicted: number | null; lo: number | null; hi: number | null }[];
  height?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 600;
  const padL = 48;
  const padR = 12;
  const padT = 10;
  const padB = 32;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const n = series.length;
  if (n === 0) return null;
  const allVals = series.flatMap((d) => [d.actual, d.predicted, d.lo, d.hi].filter((v): v is number => v !== null));
  const maxVal = Math.max(...allVals, 1);
  const xOf = (i: number) => (n === 1 ? padL + chartW / 2 : padL + (i / (n - 1)) * chartW);
  const yOf = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const actualPts = series.filter((d) => d.actual !== null);
  const predPts = series.filter((d) => d.predicted !== null);
  const piIdx = series.findIndex((d) => d.predicted !== null);
  const actualPath = actualPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(series.indexOf(d))},${yOf(d.actual!)}`).join(' ');
  const predPath = predPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(series.indexOf(d))},${yOf(d.predicted!)}`).join(' ');
  const bandTop = predPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(series.indexOf(d))},${yOf(d.hi!)}`).join(' ');
  const bandBot = predPts.map((d) => `${xOf(series.indexOf(d))},${yOf(d.lo!)}`).reverse().join(' L');
  const bandPath = `${bandTop} L${bandBot} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ val: maxVal * f, y: yOf(maxVal * f) }));
  const xLabels: { label: string; x: number }[] = [];
  const step = Math.max(1, Math.floor(n / 7));
  for (let i = 0; i < n; i += step) {
    xLabels.push({ label: series[i].date, x: xOf(i) });
  }
  const activePoint = hoveredIdx !== null ? series[hoveredIdx] : null;
  const activeLeftPct = hoveredIdx !== null ? (xOf(hoveredIdx) / width) * 100 : 50;

  return (
    <div className="owner-chart-scroll w-full overflow-x-auto pb-2" onMouseLeave={() => setHoveredIdx(null)}>
      <div className="owner-chart-inner min-w-[440px] sm:min-w-0" style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={padL + chartW} y2={t.y} stroke="#EAE6E1" strokeWidth="1" />
            <text x={padL - 6} y={t.y + 4} fontSize="9" fill="#9B978F" textAnchor="end">
              {t.val >= 1000000 ? `${(t.val / 1000000).toFixed(1)}M` : t.val >= 1000 ? `${Math.round(t.val / 1000)}K` : ''}
            </text>
          </g>
        ))}
        {piIdx > 0 && (
          <rect x={xOf(piIdx - 0.5)} y={padT} width={chartW - xOf(piIdx - 0.5) + padL} height={chartH} fill="rgba(243,115,56,0.03)" />
        )}
        <motion.path
          d={bandPath}
          fill="rgba(243,115,56,0.08)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
        />
        <motion.path
          d={actualPath}
          fill="none"
          stroke="#141413"
          strokeWidth="1.75"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
        <motion.path
          d={predPath}
          fill="none"
          stroke="#F37338"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeDasharray="5 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
        />
        {hoveredIdx !== null && activePoint && (
          <g>
            <line
              x1={xOf(hoveredIdx)}
              y1={padT}
              x2={xOf(hoveredIdx)}
              y2={padT + chartH}
              stroke="#D1CDC7"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {activePoint.actual !== null && (
              <circle cx={xOf(hoveredIdx)} cy={yOf(activePoint.actual)} r="3.5" fill="#141413" stroke="#FFFFFF" strokeWidth="1.5" />
            )}
            {activePoint.predicted !== null && (
              <circle cx={xOf(hoveredIdx)} cy={yOf(activePoint.predicted)} r="3.5" fill="#F37338" stroke="#FFFFFF" strokeWidth="1.5" />
            )}
          </g>
        )}
        {series.map((_, i) => {
          const sliceW = chartW / Math.max(n, 1);
          const x = Math.max(padL, xOf(i) - sliceW / 2);
          return (
            <rect
              key={i}
              x={x}
              y={padT}
              width={sliceW}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
            />
          );
        })}
        {xLabels.map((l, i) => (
          <text key={i} x={l.x} y={padT + chartH + 18} fontSize="9" fill="#9B978F" textAnchor="middle">{l.label}</text>
        ))}
      </svg>

      <AnimatePresence>
        {activePoint && hoveredIdx !== null && (
          <motion.div
            key={`fc-tip-${hoveredIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 6,
              left: `${Math.min(72, Math.max(24, activeLeftPct))}%`,
              transform: 'translateX(-50%)',
              background: '#141413',
              color: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              pointerEvents: 'none',
              boxShadow: '0 8px 20px rgba(20,20,19,0.2)',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#D1CDC7' }}>{activePoint.date}</div>
            {activePoint.actual !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ color: '#E8E2DA' }}>Aktual</span>
                <strong>{formatRupiah(activePoint.actual)}</strong>
              </div>
            )}
            {activePoint.predicted !== null && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ color: '#F37338' }}>Prediksi</span>
                  <strong>{formatRupiah(activePoint.predicted)}</strong>
                </div>
                {activePoint.lo !== null && activePoint.hi !== null && (
                  <div style={{ fontSize: 10.5, color: '#A8A39B', marginTop: 2 }}>
                    Rentang: {formatRupiah(activePoint.lo)} – {formatRupiah(activePoint.hi)}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerDashboardPage() {
  const { currentUser, isAuthLoading } = useRole();
  const normalizedRole = currentUser?.role?.toLowerCase();
  const canAccessOwner = Boolean(currentUser && normalizedRole === 'owner');
  const [activeMenu, setActiveMenu] = useState<OwnerMenu>('penjualan');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SSR-safe state hydrated from localStorage after mount
  const [consultations, setConsultations] = useState<AdminOrder[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSaleItem[]>([]);

  useEffect(() => {
    if (isAuthLoading || !canAccessOwner) return;
    const hydrateTimer = setTimeout(() => {
      setConsultations(loadAllConsultations());
      setOfflineSales(loadOfflineSales());
    }, 0);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => {
      clearTimeout(hydrateTimer);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [isAuthLoading, canAccessOwner]);

  const handleTimeRangeChange = (nextRange: TimeRange) => {
    if (nextRange === timeRange) return;
    setTimeRange(nextRange);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 380);
  };

  const hasRealData = consultations.length > 0 || offlineSales.length > 0;

  // ── Derived KPIs ──
  const kpi = useMemo(() => {
    if (!hasRealData) {
      // Demo fallback scaled per selected timeRange
      const rangePresets: Record<
        TimeRange,
        { online: number; offline: number; tx: number; approved: number; growth: number }
      > = {
        '7d': { online: 7_450_000, offline: 3_820_000, tx: 26, approved: 19, growth: 14.2 },
        '30d': { online: 28_400_000, offline: 14_350_000, tx: 93, approved: 71, growth: 18.4 },
        bulan: { online: 24_150_000, offline: 12_600_000, tx: 81, approved: 61, growth: 16.8 },
        semua: { online: 72_800_000, offline: 38_450_000, tx: 244, approved: 182, growth: 24.6 },
      };
      const p = rangePresets[timeRange];
      const totalOmzet = p.online + p.offline;
      return {
        totalOmzet,
        onlineTotal: p.online,
        offlineTotal: p.offline,
        totalTransaksi: p.tx,
        approvedCount: p.approved,
        aov: Math.round(totalOmzet / p.tx),
        growthPct: p.growth,
      };
    }
    const approvedOnline = consultations.filter((c) => isApproved(c.status));
    const onlineTotal = approvedOnline.reduce((s, c) => s + parseNominal(c.estimasiHarga), 0);
    const offlineTotal = offlineSales.reduce((s, o) => s + (o.nominal || 0), 0);
    const totalOmzet = onlineTotal + offlineTotal;
    const totalTransaksi = approvedOnline.length + offlineSales.length;
    return {
      totalOmzet,
      onlineTotal,
      offlineTotal,
      totalTransaksi,
      approvedCount: approvedOnline.length,
      aov: totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0,
      growthPct: 12.1,
    };
  }, [consultations, offlineSales, hasRealData, timeRange]);

  // ── Daily Series (Zero-Filled hingga Hari Ini) ──
  const dailySeries = useMemo((): DailySeries[] => {
    const today = startOfLocalDay(new Date());

    const getRangeStart = (earliestTxDate: Date | null): Date => {
      if (timeRange === '7d') {
        const d = new Date(today);
        d.setDate(d.getDate() - 6);
        return d;
      }
      if (timeRange === '30d') {
        const d = new Date(today);
        d.setDate(d.getDate() - 29);
        return d;
      }
      if (timeRange === 'bulan') {
        return new Date(today.getFullYear(), today.getMonth(), 1);
      }
      // 'semua'
      if (earliestTxDate && earliestTxDate <= today) {
        return startOfLocalDay(earliestTxDate);
      }
      const fallback = new Date(today);
      fallback.setDate(fallback.getDate() - (hasRealData ? 29 : 59));
      return fallback;
    };

    if (!hasRealData) {
      const startDate = getRangeStart(null);
      return buildDemoDailySeries(startDate, today);
    }

    // Agregasi transaksi aktual berdasarkan key lokal YYYY-MM-DD
    const map: Record<string, { online: number; offline: number }> = {};
    let earliestDate: Date | null = null;

    const trackEarliest = (dt: Date) => {
      if (!earliestDate || dt < earliestDate) {
        earliestDate = dt;
      }
    };

    consultations.forEach((c) => {
      if (!isApproved(c.status)) return;
      const dt = parseTransactionDate(c.submittedAt);
      if (!dt) return;
      trackEarliest(dt);
      const key = toDayKey(dt);
      if (!map[key]) map[key] = { online: 0, offline: 0 };
      map[key].online += parseNominal(c.estimasiHarga);
    });

    offlineSales.forEach((o) => {
      const dt = parseTransactionDate(o.tanggal);
      if (!dt) return;
      trackEarliest(dt);
      const key = toDayKey(dt);
      if (!map[key]) map[key] = { online: 0, offline: 0 };
      map[key].offline += o.nominal || 0;
    });

    const startDate = getRangeStart(earliestDate);
    const result: DailySeries[] = [];
    const cursor = startOfLocalDay(startDate);

    while (cursor <= today) {
      const key = toDayKey(cursor);
      const bucket = map[key];
      result.push({
        date: formatDayLabel(cursor),
        online: bucket ? bucket.online : 0,
        offline: bucket ? bucket.offline : 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }, [consultations, offlineSales, timeRange, hasRealData]);

  const forecastSeries = useMemo(() => buildForecastSeries(), []);

  // ── Shared styles ──
  const sidebarItemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.15s, color 0.15s',
    fontFamily: 'inherit',
  };

  const timeRangePills: { label: string; value: TimeRange }[] = [
    { label: '7 Hari', value: '7d' },
    { label: '30 Hari', value: '30d' },
    { label: 'Bulan Ini', value: 'bulan' },
    { label: 'Semua Waktu', value: 'semua' },
  ];

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

  if (!canAccessOwner) {
    notFound();
  }

  return (
    <div
      className="dashboard-shell min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row"
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        background: '#F3F0EE',
        fontFamily: 'var(--font-primary, Poppins, sans-serif)',
      }}
    >
      {/* ── Sidebar (Desktop >= 1024px) ── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:h-screen lg:shrink-0 lg:sticky lg:top-0 overflow-y-auto dashboard-sidebar-desktop"
        style={{
          width: 240,
          minWidth: 240,
          flexShrink: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #EAE6E1',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #EAE6E1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>dinail</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F37338', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>co</span>
          </div>
          <span style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#F37338',
            background: 'rgba(243,115,56,0.08)',
            padding: '3px 8px',
            borderRadius: 4,
          }}>
            Owner Executive Panel
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 12px', flex: 1 }}>
          {([
            { key: 'penjualan', label: 'Dashboard Penjualan', icon: <IconTrendLine /> },
            { key: 'insight', label: 'Insight Data Science', icon: <IconTarget /> },
          ] as { key: OwnerMenu; label: string; icon: React.ReactNode }[]).map((item) => {
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveMenu(item.key)}
                style={{
                  ...sidebarItemBase,
                  position: 'relative',
                  color: isActive ? '#141413' : '#6B6760',
                  background: 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: 4,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="owner-sidebar-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      backgroundColor: '#F3F0EE',
                      borderLeft: '3px solid #F37338',
                      zIndex: 0,
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, color: isActive ? '#F37338' : '#9B978F', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer links */}
        <div
          className="mt-auto"
          style={{
            marginTop: 'auto',
            padding: '14px 12px 20px',
            borderTop: '1px solid #EAE6E1',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <Link
            href="/admin"
            style={{ ...sidebarItemBase, color: '#6B6760', textDecoration: 'none', fontSize: 13, display: 'flex' }}
          >
            <span style={{ color: '#9B978F', flexShrink: 0 }}><IconUsers /></span>
            Panel Admin
          </Link>
          <Link
            href="/"
            style={{ ...sidebarItemBase, color: '#6B6760', textDecoration: 'none', fontSize: 13, display: 'flex' }}
          >
            <span style={{ color: '#9B978F', flexShrink: 0 }}><IconArrowLeft /></span>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* ── Mobile Slide-Over Drawer (< 1024px) ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            key="owner-mobile-drawer-overlay"
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
              key="owner-mobile-drawer-panel"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 264,
                maxWidth: '82vw',
                height: '100%',
                background: '#FFFFFF',
                borderRight: '1px solid #EAE6E1',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
              }}
            >
              <div
                style={{
                  padding: '22px 18px 18px',
                  borderBottom: '1px solid #EAE6E1',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>dinail</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F37338', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', color: '#141413' }}>co</span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#F37338',
                    background: 'rgba(243,115,56,0.08)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}>
                    Owner Executive Panel
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
                    border: '1px solid #EAE6E1',
                    backgroundColor: '#F3F0EE',
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

              <nav style={{ padding: '14px 12px', flex: 1 }}>
                {([
                  { key: 'penjualan', label: 'Dashboard Penjualan', icon: <IconTrendLine /> },
                  { key: 'insight', label: 'Insight Data Science', icon: <IconTarget /> },
                ] as { key: OwnerMenu; label: string; icon: React.ReactNode }[]).map((item) => {
                  const isActive = activeMenu === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveMenu(item.key);
                        setMobileDrawerOpen(false);
                      }}
                      style={{
                        ...sidebarItemBase,
                        color: isActive ? '#141413' : '#6B6760',
                        background: isActive ? '#F3F0EE' : 'transparent',
                        borderLeft: isActive ? '3px solid #F37338' : '3px solid transparent',
                        fontWeight: isActive ? 600 : 500,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: isActive ? '#F37338' : '#9B978F', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div style={{ padding: '14px 12px 28px', borderTop: '1px solid #EAE6E1', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link
                  href="/admin"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ ...sidebarItemBase, color: '#6B6760', textDecoration: 'none', fontSize: 13, display: 'flex' }}
                >
                  <span style={{ color: '#9B978F', flexShrink: 0 }}><IconUsers /></span>
                  Panel Admin
                </Link>
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ ...sidebarItemBase, color: '#6B6760', textDecoration: 'none', fontSize: 13, display: 'flex' }}
                >
                  <span style={{ color: '#9B978F', flexShrink: 0 }}><IconArrowLeft /></span>
                  Kembali ke Beranda
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main
        className="dashboard-main-scroll flex-1 min-w-0 lg:h-screen lg:overflow-y-auto"
        style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header (Ringkas & Sticky di Mobile < 1024px, Utuh di Desktop >= 1024px) */}
        <div
          className="dashboard-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            background: '#FFFFFF',
            borderBottom: '1px solid #EAE6E1',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto' }}>
            <button
              type="button"
              className="dashboard-mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Buka menu navigasi Owner"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid #EAE6E1',
                backgroundColor: '#F8F5F2',
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
              <h1 style={{ fontSize: 16.5, fontWeight: 700, color: '#141413', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {activeMenu === 'penjualan' ? 'Dashboard Penjualan' : 'Insight Data Science'}
              </h1>
              <p style={{ fontSize: 11.5, color: '#9B978F', margin: '2px 0 0', lineHeight: 1.35 }}>
                {activeMenu === 'penjualan' ? 'Monitoring omzet & performa Online + Offline' : 'Analisis & prediksi tim Data Science'}
              </p>
            </div>
          </div>

          {/* Dropdown Filter Periode (Khusus Mobile & Tablet < 1024px) */}
          <div
            className="block lg:hidden owner-range-dropdown-mobile relative w-full"
            style={{ position: 'relative', width: '100%' }}
          >
            <select
              aria-label="Pilih Periode Penjualan"
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
              className="dashboard-select-mobile w-full appearance-none bg-white border border-[#EAE6E1] rounded-xl px-3.5 py-2.5 pr-9 text-[13px] font-medium text-[#141413]"
              style={{
                width: '100%',
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundColor: '#FFFFFF',
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
              {timeRangePills.map((p) => (
                <option key={`mobile-range-opt-${p.value}`} value={p.value}>
                  Periode: {p.label}
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
                color: '#6B6760',
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

          {/* Time Range Filter Pills (Khusus Desktop >= 1024px — Utuh) */}
          <div className="hidden lg:inline-flex owner-range-bar scrollbar-hidden" style={{ display: 'flex', gap: 4, background: '#F3F0EE', borderRadius: 8, padding: 4 }}>
            {timeRangePills.map((p) => {
              const isSelected = timeRange === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleTimeRangeChange(p.value)}
                  style={{
                    position: 'relative',
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    background: 'transparent',
                    color: isSelected ? '#141413' : '#9B978F',
                    fontFamily: 'inherit',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="owner-range-active"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 6,
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Page body */}
        <div className="dashboard-body" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {activeMenu === 'penjualan' ? (
              <motion.div
                key="owner-tab-penjualan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <PenjualanTab kpi={kpi} dailySeries={dailySeries} timeRange={timeRange} isLoading={isLoading} />
              </motion.div>
            ) : (
              <motion.div
                key="owner-tab-insight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <InsightTab forecastSeries={forecastSeries} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── Tab: Penjualan ───────────────────────────────────────────────────────────

interface KPIData {
  totalOmzet: number;
  onlineTotal: number;
  offlineTotal: number;
  totalTransaksi: number;
  approvedCount: number;
  aov: number;
  growthPct: number;
}

function PenjualanTab({
  kpi,
  dailySeries,
  timeRange,
  isLoading,
}: {
  kpi: KPIData;
  dailySeries: DailySeries[];
  timeRange: TimeRange;
  isLoading: boolean;
}) {
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);

  const onlinePct = kpi.totalOmzet > 0 ? Math.round((kpi.onlineTotal / kpi.totalOmzet) * 100) : 0;
  const offlinePct = 100 - onlinePct;

  const kpiItems = [
    {
      label: 'Total Omzet Gabungan',
      value: formatRupiah(kpi.totalOmzet),
      sub: `+${kpi.growthPct}% vs periode lalu`,
      subColor: '#2E7D32',
    },
    {
      label: 'Penjualan Online',
      value: formatRupiah(kpi.onlineTotal),
      sub: `${onlinePct}% dari total omzet`,
      subColor: '#6B6760',
    },
    {
      label: 'Penjualan Offline',
      value: formatRupiah(kpi.offlineTotal),
      sub: `${offlinePct}% dari total omzet`,
      subColor: '#6B6760',
    },
    {
      label: 'Avg. Order Value',
      value: formatRupiah(kpi.aov),
      sub: `${kpi.totalTransaksi} transaksi tercatat`,
      subColor: '#6B6760',
    },
  ];

  const channelBars = [
    { label: 'Online', pct: onlinePct, amount: kpi.onlineTotal, count: kpi.approvedCount, color: '#141413' },
    { label: 'Offline', pct: offlinePct, amount: kpi.offlineTotal, count: Math.max(0, kpi.totalTransaksi - kpi.approvedCount), color: '#F37338' },
  ];
  const maxShapePct = Math.max(...DEMO_NAIL_SHAPES.map((s) => s.pct), 1);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="penjualan-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
          aria-busy="true"
          aria-label="Memuat data penjualan"
        >
          {/* KPI Strip Skeleton (4 Metrik) */}
          <div
            className="owner-kpi-grid"
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
            }}
          >
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={`kpi-skel-${idx}`}
                style={{
                  padding: '22px 24px',
                  borderRight: idx < 3 ? '1px solid #EAE6E1' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <Skeleton style={{ width: '58%', height: 11, borderRadius: 5 }} />
                <Skeleton style={{ width: '76%', height: 24, borderRadius: 7 }} />
                <Skeleton style={{ width: '64%', height: 11, borderRadius: 5 }} />
              </div>
            ))}
          </div>

          {/* Grafik Penjualan Skeleton */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton style={{ width: 170, height: 15, borderRadius: 6 }} />
                <Skeleton style={{ width: 230, height: 11, borderRadius: 5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skeleton style={{ width: 64, height: 12, borderRadius: 6 }} />
                <Skeleton style={{ width: 64, height: 12, borderRadius: 6 }} />
              </div>
            </div>
            <Skeleton style={{ width: '100%', height: 200, borderRadius: 10 }} />
          </div>

          {/* 2-Col Charts Skeleton */}
          <div className="owner-two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
              <Skeleton style={{ width: 190, height: 15, borderRadius: 6, marginBottom: 20 }} />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 24,
                  alignItems: 'flex-end',
                  height: 150,
                  padding: '12px 16px 0',
                  borderBottom: '1px solid #EAE6E1',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Skeleton style={{ width: 32, height: 12, borderRadius: 5 }} />
                  <Skeleton style={{ width: 64, height: 96, borderRadius: '6px 6px 0 0' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Skeleton style={{ width: 32, height: 12, borderRadius: 5 }} />
                  <Skeleton style={{ width: 64, height: 58, borderRadius: '6px 6px 0 0' }} />
                </div>
              </div>
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #EAE6E1', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton style={{ width: 135, height: 12, borderRadius: 5 }} />
                  <Skeleton style={{ width: 32, height: 12, borderRadius: 5 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton style={{ width: 118, height: 12, borderRadius: 5 }} />
                  <Skeleton style={{ width: 32, height: 12, borderRadius: 5 }} />
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
              <Skeleton style={{ width: 175, height: 15, borderRadius: 6, marginBottom: 20 }} />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 12,
                  alignItems: 'flex-end',
                  height: 180,
                  padding: '16px 6px 0',
                  borderBottom: '1px solid #EAE6E1',
                }}
              >
                {[118, 86, 68, 52, 38].map((h, idx) => (
                  <div key={`shape-skel-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Skeleton style={{ width: 26, height: 11, borderRadius: 5 }} />
                    <Skeleton style={{ width: 34, height: h, borderRadius: '5px 5px 0 0' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '12px 6px 0' }}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Skeleton key={`shape-lbl-${idx}`} style={{ width: '80%', height: 12, borderRadius: 5, margin: '0 auto' }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={`penjualan-data-${timeRange}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
        >
      {/* KPI Strip */}
      <div
        className="owner-kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        style={{
          background: '#FFFFFF',
          borderRadius: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {kpiItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.05 }}
            className="p-3.5 sm:p-5"
            style={{
              padding: '22px 24px',
              borderRight: i < kpiItems.length - 1 ? '1px solid #EAE6E1' : 'none',
            }}
          >
            <p className="owner-kpi-label" style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9B978F', margin: '0 0 8px' }}>
              {item.label}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${timeRange}-${item.label}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="owner-kpi-value text-[16px] sm:text-[24px] font-bold tracking-tight whitespace-nowrap"
                style={{ fontSize: 20, fontWeight: 700, color: '#141413', margin: '0 0 4px', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
              >
                {item.value}
              </motion.p>
            </AnimatePresence>
            <p className="owner-kpi-sub" style={{ fontSize: 11.5, color: item.subColor, margin: 0 }}>{item.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px 24px 16px' }}>
        <div className="owner-chart-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: 0 }}>Tren Penjualan Harian</h2>
            <p style={{ fontSize: 11.5, color: '#9B978F', margin: '2px 0 0' }}>Nominal penjualan per hari (Online + Offline)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 2, background: '#141413', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 11.5, color: '#6B6760' }}>Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 2, background: '#F37338', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 11.5, color: '#6B6760' }}>Offline</span>
            </div>
          </div>
        </div>
        <AreaLineChart key={timeRange} series={dailySeries} height={200} />
      </div>

      {/* Channel Split + Nail Shape — 2 cols */}
      <div className="owner-two-col-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Channel split bar chart */}
        <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: '0 0 18px' }}>Komposisi Channel Penjualan</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 24,
              alignItems: 'flex-end',
              height: 150,
              padding: '12px 16px 0',
              borderBottom: '1px solid #EAE6E1',
            }}
          >
            {channelBars.map((ch, idx) => {
              const barHeight = Math.max(8, Math.round((ch.pct / 100) * 108));
              const isHovered = hoveredChannel === ch.label;
              return (
                <div
                  key={`${timeRange}-${ch.label}`}
                  onMouseEnter={() => setHoveredChannel(ch.label)}
                  onMouseLeave={() => setHoveredChannel(null)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: -6,
                          background: '#141413',
                          color: '#FFFFFF',
                          padding: '6px 10px',
                          borderRadius: 7,
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          boxShadow: '0 6px 16px rgba(20,20,19,0.18)',
                          zIndex: 10,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{formatRupiah(ch.amount)}</div>
                        <div style={{ fontSize: 10, color: '#D1CDC7' }}>{ch.count} transaksi ({ch.pct}%)</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span style={{ fontSize: 12, fontWeight: 700, color: ch.color, marginBottom: 6 }}>
                    {ch.pct}%
                  </span>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.04 }}
                    style={{
                      width: '68%',
                      maxWidth: 76,
                      height: barHeight,
                      background: ch.color,
                      borderRadius: '6px 6px 0 0',
                      transformOrigin: 'bottom',
                      opacity: hoveredChannel && !isHovered ? 0.65 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, padding: '8px 16px 0', textAlign: 'center' }}>
            {channelBars.map((ch) => (
              <span key={ch.label} style={{ fontSize: 12, fontWeight: 600, color: '#141413' }}>
                {ch.label}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #EAE6E1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#9B978F' }}>Order Berhasil (Online)</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#141413' }}>{kpi.approvedCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#9B978F' }}>Transaksi Offline</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#141413' }}>{kpi.totalTransaksi - kpi.approvedCount}</span>
            </div>
          </div>
        </div>

        {/* Nail shape distribution bar chart */}
        <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: '0 0 18px' }}>Distribusi Bentuk Kuku</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${DEMO_NAIL_SHAPES.length}, 1fr)`,
              gap: 12,
              alignItems: 'flex-end',
              height: 180,
              padding: '16px 6px 0',
              borderBottom: '1px solid #EAE6E1',
            }}
          >
            {DEMO_NAIL_SHAPES.map((shape, i) => {
              const barHeight = Math.max(14, Math.round((shape.pct / maxShapePct) * 126));
              const isHovered = hoveredShape === shape.shape;
              return (
                <div
                  key={shape.shape}
                  onMouseEnter={() => setHoveredShape(shape.shape)}
                  onMouseLeave={() => setHoveredShape(null)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: -4,
                          background: '#141413',
                          color: '#FFFFFF',
                          padding: '5px 9px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          boxShadow: '0 6px 14px rgba(20,20,19,0.18)',
                          zIndex: 10,
                        }}
                      >
                        {shape.shape}: {shape.pct}%
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? '#F37338' : '#6B6760', marginBottom: 6 }}>
                    {shape.pct}%
                  </span>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                    style={{
                      width: '72%',
                      maxWidth: 40,
                      height: barHeight,
                      background: i === 0 ? '#F37338' : '#141413',
                      borderRadius: '5px 5px 0 0',
                      transformOrigin: 'bottom',
                      opacity: hoveredShape && !isHovered ? 0.55 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${DEMO_NAIL_SHAPES.length}, 1fr)`,
              gap: 12,
              padding: '10px 6px 0',
              textAlign: 'center',
            }}
          >
            {DEMO_NAIL_SHAPES.map((shape) => (
              <span key={shape.shape} style={{ fontSize: 11.5, fontWeight: 500, color: '#141413' }}>
                {shape.shape}
              </span>
            ))}
          </div>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tab: Insight ─────────────────────────────────────────────────────────────

function InsightTab({
  forecastSeries,
  isLoading,
}: {
  forecastSeries: { date: string; actual: number | null; predicted: number | null; lo: number | null; hi: number | null }[];
  isLoading: boolean;
}) {
  const segItems = [
    { icon: <IconRepeat size={15} />, label: 'Repeat Order Rate', value: '34%', note: 'Pelanggan yang kembali memesan dalam 60 hari' },
    { icon: <IconClock size={15} />, label: 'Jam Puncak Order', value: '19:00–21:00', note: 'Waktu lonjakan permintaan terbesar' },
    { icon: <IconStar size={15} />, label: 'Avg. Hari Re-order', value: '28 hari', note: 'Rata-rata jeda antar pesanan pelanggan' },
  ];

  const actionableInsights = [
    { icon: <IconTrendLine size={14} />, text: 'Tingkatkan stok Almond size M — permintaan naik 22% bulan ini.' },
    { icon: <IconUsers size={14} />, text: 'Segmen pelanggan usia 20–25 menunjukkan repeat order tertinggi; pertimbangkan program loyalitas.' },
    { icon: <IconStar size={14} />, text: 'Glazed Donut dan Blush Chrome mendominasi trending — prioritaskan ketersediaan bahan.' },
    { icon: <IconClock size={14} />, text: 'Puncak pesanan 19:00–21:00 WIB; jadwalkan posting konten promosi di jam tersebut.' },
    { icon: <IconRepeat size={14} />, text: 'Forecasting menunjukkan lonjakan omzet +12% dalam 14 hari ke depan — pastikan kapasitas produksi siap.' },
  ];

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="insight-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
          aria-busy="true"
          aria-label="Memuat insight data science"
        >
          {/* Forecasting Skeleton */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton style={{ width: 170, height: 15, borderRadius: 6 }} />
                <Skeleton style={{ width: 270, height: 11, borderRadius: 5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skeleton style={{ width: 64, height: 12, borderRadius: 6 }} />
                <Skeleton style={{ width: 68, height: 12, borderRadius: 6 }} />
              </div>
            </div>
            <Skeleton style={{ width: '100%', height: 200, borderRadius: 10 }} />
          </div>

          {/* Design Trends + Size Distribution Skeleton */}
          <div className="owner-two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
              <Skeleton style={{ width: 160, height: 15, borderRadius: 6, marginBottom: 22 }} />
              {[88, 76, 68, 56, 48].map((w, idx) => (
                <div
                  key={`trend-skel-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingBottom: idx < 4 ? 14 : 0,
                    marginBottom: idx < 4 ? 14 : 0,
                    borderBottom: idx < 4 ? '1px solid #EAE6E1' : 'none',
                  }}
                >
                  <Skeleton style={{ width: 18, height: 12, borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton style={{ width: `${w * 0.65}%`, height: 13, borderRadius: 5 }} />
                      <Skeleton style={{ width: 16, height: 12, borderRadius: 4 }} />
                    </div>
                    <Skeleton style={{ width: `${w}%`, height: 5, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
              <Skeleton style={{ width: 170, height: 15, borderRadius: 6, marginBottom: 20 }} />
              <Skeleton style={{ width: '100%', height: 24, borderRadius: 4, marginBottom: 20 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={`size-skel-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton style={{ width: 92, height: 13, borderRadius: 5 }} />
                    <Skeleton style={{ width: 38, height: 13, borderRadius: 5 }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #EAE6E1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Skeleton style={{ width: 155, height: 12, borderRadius: 5 }} />
                {[0, 1, 2].map((idx) => (
                  <div key={`seg-skel-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Skeleton style={{ width: '62%', height: 13, borderRadius: 5 }} />
                    <Skeleton style={{ width: '82%', height: 11, borderRadius: 5 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Insights Skeleton */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
            <Skeleton style={{ width: 185, height: 15, borderRadius: 6, marginBottom: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[84, 92, 78, 86, 90].map((w, idx) => (
                <div
                  key={`rec-skel-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '15px 0',
                    borderBottom: idx < 4 ? '1px solid #EAE6E1' : 'none',
                  }}
                >
                  <Skeleton style={{ width: 16, height: 16, borderRadius: 999, flexShrink: 0 }} />
                  <Skeleton style={{ width: `${w}%`, height: 14, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="insight-data"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
        >
      {/* Forecasting Chart */}
      <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px 24px 16px' }}>
        <div className="owner-chart-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: 0 }}>Forecasting Penjualan</h2>
            <p style={{ fontSize: 11.5, color: '#9B978F', margin: '2px 0 0' }}>30 hari aktual + prediksi 14 hari ke depan (Tim Data Science)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 2, background: '#141413', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 11.5, color: '#6B6760' }}>Aktual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="4" style={{ display: 'block' }}>
                <line x1="0" y1="2" x2="20" y2="2" stroke="#F37338" strokeWidth="2" strokeDasharray="4 2" />
              </svg>
              <span style={{ fontSize: 11.5, color: '#6B6760' }}>Prediksi</span>
            </div>
          </div>
        </div>
        <ForecastChart series={forecastSeries} height={200} />
      </div>

      {/* Design Trends + Size Distribution — 2 cols */}
      <div className="owner-two-col-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Design Trends */}
        <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: '0 0 20px' }}>Tren Desain Teratas</h2>
          {DEMO_DESIGN_TRENDS.map((trend, i) => (
            <div key={trend.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingBottom: i < DEMO_DESIGN_TRENDS.length - 1 ? 14 : 0,
              marginBottom: i < DEMO_DESIGN_TRENDS.length - 1 ? 14 : 0,
              borderBottom: i < DEMO_DESIGN_TRENDS.length - 1 ? '1px solid #EAE6E1' : 'none',
            }}>
              <span style={{ fontSize: 11, color: '#9B978F', width: 16, textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#141413' }}>{trend.name}</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    color: trend.delta === 'up' ? '#2E7D32' : trend.delta === 'down' ? '#B71C1C' : '#9B978F',
                    fontSize: 11,
                  }}>
                    {trend.delta === 'up' ? <IconChevronUp /> : trend.delta === 'down' ? <IconChevronDown /> : <IconMinus />}
                  </span>
                </div>
                <div style={{ height: 3, background: '#F3F0EE', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                    style={{ width: `${trend.score}%`, height: '100%', background: '#141413', borderRadius: 2, transformOrigin: 'left' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Size Distribution */}
        <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: '0 0 20px' }}>Distribusi Ukuran Kuku</h2>
          {/* Proportional bar */}
          <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 24, marginBottom: 20 }}>
            {DEMO_SIZE_SHARES.map((s, i) => (
              <motion.div
                key={s.label}
                title={`${s.label}: ${s.pct}%`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                style={{
                  width: `${s.pct}%`,
                  background: i === 0 ? '#D0CCC6' : i === 1 ? '#A8A39B' : i === 2 ? '#6B6760' : '#141413',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transformOrigin: 'left',
                }}
              >
                {s.pct > 8 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF' }}>{s.label}</span>
                )}
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_SIZE_SHARES.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                    background: i === 0 ? '#D0CCC6' : i === 1 ? '#A8A39B' : i === 2 ? '#6B6760' : '#141413',
                  }} />
                  <span style={{ fontSize: 13, color: '#141413' }}>Size {s.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#141413' }}>{s.pct}%</span>
              </div>
            ))}
          </div>

          {/* Customer Segmentation summary */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #EAE6E1', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#141413', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Segmentasi Pelanggan</h3>
            {segItems.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#F37338', flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#141413', margin: 0 }}>{s.value} — {s.label}</p>
                  <p style={{ fontSize: 11, color: '#9B978F', margin: '1px 0 0' }}>{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="dashboard-card" style={{ background: '#FFFFFF', borderRadius: 10, padding: '24px' }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#141413', margin: '0 0 18px' }}>Rekomendasi Actionable</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {actionableInsights.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 0',
                borderBottom: i < actionableInsights.length - 1 ? '1px solid #EAE6E1' : 'none',
              }}
            >
              <span style={{ color: '#F37338', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <p style={{ fontSize: 13.5, color: '#141413', margin: 0, lineHeight: 1.55 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Science Status Footer */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 10,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderTop: '2px solid #F3F0EE',
      }}>
        <span style={{ color: '#9B978F', flexShrink: 0 }}><IconInfo /></span>
        <p style={{ fontSize: 12, color: '#9B978F', margin: 0 }}>
          <strong style={{ color: '#6B6760' }}>Data Science Model</strong>
          {' '}·{' '}Terakhir diperbarui: 25 Nov 2026
          {' '}·{' '}Siap integrasi endpoint API
        </p>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
