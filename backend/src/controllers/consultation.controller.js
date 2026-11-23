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
    const userPayload = req.user || {};
    const uid = userPayload.uid || req.body.userId || 'guest-user';
    const email = userPayload.email || req.body.email || 'guest@dinail.co';
    const name = userPayload.name || req.body.customerName || 'Customer';
    const picture = userPayload.picture || null;

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
    } = req.body;

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email }],
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name,
          photoUrl: picture,
          role: 'customer',
        },
      });
    }

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
    const { uid, email } = req.user;

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email }],
      },
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
      updatePayload.status = mapped;
      updatePayload.reviewedAt = new Date();
    }

    if (adminFeedback !== undefined) updatePayload.adminFeedback = adminFeedback;
    if (estimatedPrice !== undefined) updatePayload.estimatedPrice = estimatedPrice;
    if (shopeeUrl !== undefined) updatePayload.shopeeUrl = shopeeUrl;
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
