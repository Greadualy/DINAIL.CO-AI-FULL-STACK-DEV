'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  type OfflineSaleItem,
  type OfflineBatch,
  formatRupiah,
  parseNominal,
  saveOfflineSales,
  saveOfflineBatches,
  IconDownload,
  IconUploadCloud,
  IconInfo,
  IconTrash,
} from '@/components/dashboard/dashboardShared';

export interface OfflineSalesImportViewProps {
  offlineSales: OfflineSaleItem[];
  offlineBatches: OfflineBatch[];
  onOfflineDataChange: (nextSales: OfflineSaleItem[], nextBatches: OfflineBatch[]) => void;
  onShowToast: (message: string) => void;
}

export default function OfflineSalesImportView({
  offlineSales,
  offlineBatches,
  onOfflineDataChange,
  onShowToast,
}: OfflineSalesImportViewProps) {
  const [previewRows, setPreviewRows] = useState<
    Omit<OfflineSaleItem, 'id' | 'batchId' | 'batchFileName' | 'createdAt'>[] | null
  >(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);
  const [isConfirmDiscardDraftOpen, setIsConfirmDiscardDraftOpen] = useState(false);
  const [pendingDeleteBatch, setPendingDeleteBatch] = useState<OfflineBatch | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    saveOfflineSales(updatedSales);
    saveOfflineBatches(updatedBatches);
    onOfflineDataChange(updatedSales, updatedBatches);

    setIsConfirmImportOpen(false);
    setPreviewRows(null);
    setPreviewFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    onShowToast(`Berhasil menggabungkan ${newItems.length} transaksi offline (${formatRupiah(totalBatchNominal)})!`);
  };

  const handleConfirmedDeleteBatch = () => {
    if (!pendingDeleteBatch) return;
    const { batchId, fileName } = pendingDeleteBatch;

    const updatedSales = offlineSales.filter((s) => s.batchId !== batchId);
    const updatedBatches = offlineBatches.filter((b) => b.batchId !== batchId);

    saveOfflineSales(updatedSales);
    saveOfflineBatches(updatedBatches);
    onOfflineDataChange(updatedSales, updatedBatches);
    setPendingDeleteBatch(null);

    onShowToast(`Batch "${fileName}" berhasil dihapus.`);
  };

  const handleConfirmedDiscardDraft = () => {
    setPreviewRows(null);
    setPreviewFileName('');
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsConfirmDiscardDraftOpen(false);
  };

  const previewTotalNominal = previewRows
    ? previewRows.reduce((acc, row) => acc + row.nominal, 0)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                  onClick={() => setIsConfirmDiscardDraftOpen(true)}
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
                  onClick={() => setIsConfirmImportOpen(true)}
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
                        onClick={() => setPendingDeleteBatch(batch)}
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

      {/* Modal Konfirmasi Impor Penjualan Offline */}
      <ConfirmModal
        isOpen={isConfirmImportOpen && Boolean(previewRows && previewRows.length > 0)}
        title="Impor Data Penjualan Offline?"
        description={`Anda akan menggabungkan ${previewRows?.length ?? 0} transaksi dari "${previewFileName}" senilai ${formatRupiah(previewTotalNominal)} ke data penjualan. Pastikan berkas ini belum pernah diimpor agar tidak terjadi duplikasi omzet.`}
        confirmText="Ya, Impor Data"
        variant="primary"
        onConfirm={handleConfirmImport}
        onCancel={() => setIsConfirmImportOpen(false)}
      />

      {/* Modal Konfirmasi Batalkan / Reset Draft Pratinjau */}
      <ConfirmModal
        isOpen={isConfirmDiscardDraftOpen && Boolean(previewRows && previewRows.length > 0)}
        title="Batalkan Draft Pratinjau?"
        description={`Pratinjau ${previewRows?.length ?? 0} baris transaksi dari berkas "${previewFileName}" akan dihapus dari tampilan sebelum diimpor.`}
        confirmText="Ya, Batalkan Draft"
        variant="danger"
        onConfirm={handleConfirmedDiscardDraft}
        onCancel={() => setIsConfirmDiscardDraftOpen(false)}
      />

      {/* Modal Konfirmasi Hapus Batch Penjualan Offline */}
      <ConfirmModal
        isOpen={Boolean(pendingDeleteBatch)}
        title="Hapus Batch Penjualan?"
        description={
          pendingDeleteBatch
            ? `Seluruh ${pendingDeleteBatch.rowCount} transaksi dari berkas "${pendingDeleteBatch.fileName}" (${formatRupiah(pendingDeleteBatch.totalNominal)}) akan dihapus dari data penjualan offline.`
            : ''
        }
        confirmText="Ya, Hapus Batch"
        variant="danger"
        onConfirm={handleConfirmedDeleteBatch}
        onCancel={() => setPendingDeleteBatch(null)}
      />
    </div>
  );
}
