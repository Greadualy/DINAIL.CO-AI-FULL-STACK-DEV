import type { NailAIAnalysisResult, NailSizeData } from '@/types';

const LS_KEY_NAIL_SIZE_GLOBAL = 'dinail_nail_sizes';

export function getNailSizeStorageKey(userId?: string | null): string {
  return userId ? `dinail_nail_sizes_${userId}` : LS_KEY_NAIL_SIZE_GLOBAL;
}

/**
 * Mengompres gambar menggunakan HTML5 <canvas> (maks lebar 600px, JPEG kualitas 0.7)
 * agar ringan dan aman disimpan di localStorage tanpa QuotaExceededError.
 */
export function compressImageToDataUrl(
  file: File,
  maxWidth = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Image compression requires a browser environment.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Data gambar kosong.'));
        return;
      }

      const img = new window.Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const targetWidth = Math.max(1, Math.round(img.width * scale));
          const targetHeight = Math.max(1, Math.round(img.height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed || rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export function getNailSizeData(userId?: string | null): NailSizeData | null {
  if (typeof window === 'undefined') return null;
  const candidateKeys = userId
    ? [getNailSizeStorageKey(userId), LS_KEY_NAIL_SIZE_GLOBAL]
    : [LS_KEY_NAIL_SIZE_GLOBAL];

  for (const key of candidateKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as NailSizeData;
        if (parsed && parsed.leftHand) {
          return parsed;
        }
      }
    } catch {
      // Ignore corrupt localStorage entry
    }
  }
  return null;
}

export function saveNailSizeData(data: NailSizeData, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(data);
  try {
    localStorage.setItem(LS_KEY_NAIL_SIZE_GLOBAL, payload);
  } catch (err) {
    console.warn('[nailSizeService] Gagal menyimpan ke storage global:', err);
  }
  if (userId) {
    try {
      localStorage.setItem(getNailSizeStorageKey(userId), payload);
    } catch (err) {
      console.warn('[nailSizeService] Gagal menyimpan ke storage user:', err);
    }
  }
}

export function formatNailSizeSummary(data: NailSizeData): string {
  const { preset, leftHand, rightHand } = data;
  const leftStr = `${leftHand.thumb}-${leftHand.index}-${leftHand.middle}-${leftHand.ring}-${leftHand.pinky} mm`;
  const rightStr = `${rightHand.thumb}-${rightHand.index}-${rightHand.middle}-${rightHand.ring}-${rightHand.pinky} mm`;

  if (preset !== 'Custom') {
    return `Size ${preset} (${leftStr})`;
  }
  if (leftStr === rightStr) {
    return `Custom (${leftStr})`;
  }
  return `Custom (Kiri: ${leftStr} · Kanan: ${rightStr})`;
}

// API Endpoint: POST /api/ai/measure-nails (multipart/form-data: fourFingers, thumb)
export async function analyzeNailPhotos(
  fourFingers: File | string,
  thumb: File | string
): Promise<NailAIAnalysisResult> {
  if (!fourFingers || !thumb) {
    return {
      success: false,
      recommendedPreset: 'Kustom',
      measurements: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
      errorMessage:
        'Kedua foto (4 jari dan ibu jari) wajib diunggah agar AI dapat mengukur kelima kuku dengan akurat.',
    };
  }

  const isValidImageInput = (input: File | string): boolean => {
    if (typeof input === 'string') {
      return input.trim().length > 0;
    }
    return input.type.startsWith('image/');
  };

  if (!isValidImageInput(fourFingers) || !isValidImageInput(thumb)) {
    return {
      success: false,
      recommendedPreset: 'Kustom',
      measurements: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
      errorMessage:
        'Format file tidak didukung. Pastikan kedua file yang diunggah berupa gambar (JPG, PNG, atau WEBP).',
    };
  }

  // Simulasi waktu pemrosesan deteksi koin & pengukuran kuku via AI (2500ms)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return {
    success: true,
    recommendedPreset: 'M',
    measurements: {
      thumb: 16,
      index: 12,
      middle: 13,
      ring: 12,
      pinky: 9,
    },
    confidenceScore: 96,
  };
}
