const prisma = require('../config/prisma');

const syncUser = async (req, res, next) => {
  try {
    const { uid, email, name: tokenName, picture } = req.user;
    const { name: bodyName, photoUrl: bodyPhotoUrl, phone } = req.body || {};

    const userEmail = email || req.body?.email;
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email pengguna tidak ditemukan dalam data token autentikasi.',
      });
    }

    const displayName = bodyName || tokenName || 'Customer Dinail';
    const userPhoto = bodyPhotoUrl || picture || null;

    console.log(`[Sync] Upserting user ${userEmail} (${uid})...`);

    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: userEmail,
        name: displayName,
        photoUrl: userPhoto,
        ...(phone ? { phone } : {}),
      },
      create: {
        firebaseUid: uid,
        email: userEmail,
        name: displayName,
        photoUrl: userPhoto,
        phone: phone || null,
        role: 'customer',
      },
    });

    console.log(`[Sync] User upserted successfully: ${user.id}`);

    return res.status(200).json({
      success: true,
      message: 'User berhasil disinkronkan.',
      data: user,
    });
  } catch (error) {
    console.error('[Sync] Error upserting user:', error.message);
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan di database.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const saveNailSize = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { preset, measurements } = req.body || {};

    if (!measurements) {
      return res.status(400).json({
        success: false,
        message: 'Data ukuran kuku (measurements) wajib disertakan.',
      });
    }

    console.log(`[Auth] Saving nail size measurements for user (${uid})...`);

    const updatedUser = await prisma.user.update({
      where: { firebaseUid: uid },
      data: {
        savedSizePreset: preset || 'Custom',
        savedMeasurements: measurements,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Ukuran kuku berhasil disimpan ke database Supabase.',
      data: {
        savedSizePreset: updatedUser.savedSizePreset,
        savedMeasurements: updatedUser.savedMeasurements,
      },
    });
  } catch (error) {
    console.error('[Auth] Error saving nail size to DB:', error.message);
    next(error);
  }
};

module.exports = {
  syncUser,
  getMe,
  saveNailSize,
};
