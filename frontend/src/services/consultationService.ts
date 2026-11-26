import type { ConsultationOrder, NailSizeData } from '@/types';
import { formatNailSizeSummary, getNailSizeData } from '@/services/nailSizeService';

export function getConsultationsStorageKey(userId?: string | null): string {
  return userId ? `dinail_consultations_${userId}` : 'dinail_consultations_guest';
}

export interface CreateConsultationPayload {
  consultationId: string;
  userId?: string | null;
  customerName: string;
  designName: string;
  serviceType?: string;
  variant?: string;
  notes?: string;
  referenceLink?: string;
  photoUrl: string;
  estimasiHarga?: string;
  submittedAt: string;
  fallbackNailSize?: NailSizeData | null;
}

/**
 * Membuat ConsultationOrder baru dan otomatis melampirkan data ukuran kuku terbaru
 * milik userId (termasuk fourFingersPhotoUrl, thumbPhotoUrl, dan aiConfidenceScore).
 */
export function createConsultation(payload: CreateConsultationPayload): ConsultationOrder {
  const latestNailSize = getNailSizeData(payload.userId) || payload.fallbackNailSize || null;

  const fourFingersUrl = latestNailSize?.fourFingersPhotoUrl || undefined;
  const thumbUrl = latestNailSize?.thumbPhotoUrl || undefined;
  const hasNailPhotos = Boolean(fourFingersUrl || thumbUrl);

  const newOrder: ConsultationOrder = {
    consultationId: payload.consultationId,
    userId: payload.userId || undefined,
    customerName: payload.customerName.trim(),
    nailSizeSummary: latestNailSize ? formatNailSizeSummary(latestNailSize) : undefined,
    nailPhotos: hasNailPhotos
      ? {
          fourFingersUrl,
          thumbUrl,
        }
      : undefined,
    aiConfidenceScore: latestNailSize?.aiConfidenceScore,
    referenceLink: payload.referenceLink?.trim() || undefined,
    submittedAt: payload.submittedAt,
    status: 'menunggu',
    serviceType: payload.serviceType || 'Custom Press-On Nails',
    designName: payload.designName.trim() || 'Custom Press-On Nails',
    variant: payload.variant || 'Custom',
    notes: payload.notes?.trim() || '',
    estimasiHarga: payload.estimasiHarga || 'Menunggu estimasi',
    photoUrl: payload.photoUrl,
  };

  if (typeof window !== 'undefined') {
    try {
      const storageKey = getConsultationsStorageKey(payload.userId);
      const raw = localStorage.getItem(storageKey);
      const existing: ConsultationOrder[] = raw ? (JSON.parse(raw) as ConsultationOrder[]) : [];
      const next = [newOrder, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (err) {
      console.warn('[consultationService] Gagal menyimpan konsultasi ke localStorage:', err);
    }
  }

  return newOrder;
}
