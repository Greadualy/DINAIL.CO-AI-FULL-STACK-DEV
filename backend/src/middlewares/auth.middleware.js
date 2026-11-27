const { auth } = require('../config/firebase');
const prisma = require('../config/prisma');

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
    });
  }

  if (!auth) {
    return res.status(503).json({
      success: false,
      message: 'Layanan autentikasi Firebase belum terkonfigurasi di server (serviceAccountKey.json belum siap).',
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    req.user = await auth.verifyIdToken(token);
    console.log(`[Auth] Token verified for UID: ${req.user.uid}, email: ${req.user.email}`);
    return next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kedaluwarsa.',
      error: error.message,
    });
  }
};

const optionalFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !auth) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7).trim();
  try {
    req.user = await auth.verifyIdToken(token);
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

/**
 * Enforces server-side authorization: requires caller to possess admin or owner role in database
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi diperlukan untuk operasi administratif.',
    });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
      select: { id: true, role: true, email: true },
    });

    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Operasi ini hanya diperbolehkan untuk pengguna dengan peran Admin atau Owner.',
      });
    }

    req.dbUser = dbUser;
    return next();
  } catch (error) {
    console.error('[Auth] Error checking administrative authorization:', error.message);
    return next(error);
  }
};

module.exports = {
  verifyFirebaseToken,
  optionalFirebaseToken,
  requireAdmin,
};
