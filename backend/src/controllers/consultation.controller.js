const prisma = require('../config/prisma');

const generateConsultationCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomSeq = String(Math.floor(10 + Math.random() * 90));
  return `DNL-KNS-${dateStr}-${randomSeq}`;
};

const createConsultation = async (req, res, next) => {
  try {
    let dbUser = null;

    if (req.user && req.user.uid) {
      // Authenticated user: Strictly bind to verified Firebase token data
      const { uid, email, name: tokenName, picture } = req.user;
      const verifiedEmail = email || `${uid}@dinail.local`;
      const displayName = tokenName || req.body.customerName || 'Customer';

      dbUser = await prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: uid,
            email: verifiedEmail,
            name: displayName,
            photoUrl: picture || null,
            role: 'customer',
          },
        });
      }
    } else {
      // Guest submission: Strictly isolated to designated guest account
      // NEVER allow linking to registered user accounts by arbitrary client-supplied email/UID
      const GUEST_UID = 'guest-user';
      const GUEST_EMAIL = 'guest@dinail.co';

      dbUser = await prisma.user.findUnique({
        where: { firebaseUid: GUEST_UID },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: GUEST_UID,
            email: GUEST_EMAIL,
            name: req.body.customerName || 'Guest Customer',
            role: 'customer',
          },
        });
      }
    }

    const {
      consultationCode,
      designName,
      serviceType,
      variant,
      referenceLink,
      photoUrl,
      customerNotes,
      estimatedPrice,
      productId,
      isValidPhoto,
      coinDetected,
      aiSuggestedSize,
      aiMeasurements,
      confirmedSize,
      confirmedMeasurements,
    } = req.body;

    const assignedCode = consultationCode || generateConsultationCode();

    const consultation = await prisma.consultation.create({
      data: {
        consultationCode: assignedCode,
        userId: dbUser.id,
        productId: productId || null,
        serviceType: serviceType || 'Custom Press-On Nails',
        designName: designName || 'Custom Press-On Nails',
        variant: variant || 'Custom',
        referenceLink: referenceLink || null,
        photoUrl: photoUrl || null,
        customerNotes: customerNotes || null,
        estimatedPrice: estimatedPrice || 'Menunggu estimasi',
        isValidPhoto: Boolean(isValidPhoto),
        coinDetected: Boolean(coinDetected),
        aiSuggestedSize: aiSuggestedSize || null,
        aiMeasurements: aiMeasurements || null,
        confirmedSize: confirmedSize || null,
        confirmedMeasurements: confirmedMeasurements || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
            savedSizePreset: true,
            savedMeasurements: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pengajuan konsultasi berhasil dibuat.',
      data: consultation,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyConsultations = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi diperlukan untuk melihat riwayat konsultasi.',
      });
    }

    const { uid } = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!dbUser) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const consultations = await prisma.consultation.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
            savedSizePreset: true,
            savedMeasurements: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    return next(error);
  }
};

const getAllConsultations = async (req, res, next) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status && status !== 'semua' && status !== 'Semua') {
      const normalized = status.toUpperCase();
      if (['PENDING', 'CONFIRMED', 'NEED_REPHOTO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(normalized)) {
        whereClause.status = normalized;
      }
    }

    const consultations = await prisma.consultation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
            savedSizePreset: true,
            savedMeasurements: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            tier: true,
            price: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      total: consultations.length,
      data: consultations,
    });
  } catch (error) {
    return next(error);
  }
};

const updateConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminFeedback,
      estimatedPrice,
      shopeeUrl,
      confirmedSize,
      confirmedMeasurements,
    } = req.body;

    const existing = await prisma.consultation.findFirst({
      where: {
        OR: [{ id }, { consultationCode: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data konsultasi tidak ditemukan.',
      });
    }

    const updatePayload = {};

    if (status) {
      const statusMap = {
        menunggu: 'PENDING',
        antrian: 'PENDING',
        pending: 'PENDING',
        proses: 'IN_PROGRESS',
        in_progress: 'IN_PROGRESS',
        siap_checkout: 'CONFIRMED',
        disetujui: 'CONFIRMED',
        confirmed: 'CONFIRMED',
        selesai: 'COMPLETED',
        completed: 'COMPLETED',
        dibatalkan: 'CANCELLED',
        ditolak: 'CANCELLED',
        cancelled: 'CANCELLED',
      };
      const mapped = statusMap[status.toLowerCase()] || status.toUpperCase();
      const validStatuses = ['PENDING', 'CONFIRMED', 'NEED_REPHOTO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(mapped)) {
        return res.status(400).json({
          success: false,
          message: `Nilai status '${status}' tidak valid. Status yang didukung: ${validStatuses.join(', ')}`,
        });
      }

      updatePayload.status = mapped;
      updatePayload.reviewedAt = new Date();
    }

    if (shopeeUrl !== undefined && shopeeUrl !== null && shopeeUrl !== '') {
      if (typeof shopeeUrl !== 'string' || (!shopeeUrl.startsWith('https://') && !shopeeUrl.startsWith('http://'))) {
        return res.status(400).json({
          success: false,
          message: 'Tautan Shopee harus berupa URL web yang valid (diawali https://).',
        });
      }
      updatePayload.shopeeUrl = shopeeUrl;
    } else if (shopeeUrl === null || shopeeUrl === '') {
      updatePayload.shopeeUrl = null;
    }

    if (adminFeedback !== undefined) updatePayload.adminFeedback = adminFeedback;
    if (estimatedPrice !== undefined) updatePayload.estimatedPrice = estimatedPrice;
    if (confirmedSize !== undefined) updatePayload.confirmedSize = confirmedSize;
    if (confirmedMeasurements !== undefined) updatePayload.confirmedMeasurements = confirmedMeasurements;

    const updated = await prisma.consultation.update({
      where: { id: existing.id },
      data: updatePayload,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
            savedSizePreset: true,
            savedMeasurements: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Status konsultasi berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  updateConsultation,
};
