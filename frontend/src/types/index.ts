export interface NailMeasurements {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export type NailRecommendedPreset = 'XS' | 'S' | 'M' | 'L' | 'Kustom';

export type NailSizePreset = 'XS' | 'S' | 'M' | 'L' | 'Custom';

export interface NailSizeData {
  preset: NailSizePreset;
  leftHand: NailMeasurements;
  rightHand: NailMeasurements;
  syncHands: boolean;
  photoUrl: string | null;
  fourFingersPhotoUrl?: string;
  thumbPhotoUrl?: string;
  aiConfidenceScore?: number;
  lastAiResult?: NailAIAnalysisResult;
  updatedAt?: string;
}

export interface NailAIAnalysisResult {
  success: boolean;
  recommendedPreset: NailRecommendedPreset;
  measurements: NailMeasurements;
  confidenceScore?: number;
  errorMessage?: string;
}

export interface ConsultationNailPhotos {
  fourFingersUrl?: string;
  thumbUrl?: string;
}

export interface ConsultationOrder {
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
}
