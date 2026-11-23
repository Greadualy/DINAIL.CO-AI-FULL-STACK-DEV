const { auth } = require('../config/firebase');

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

module.exports = {
  verifyFirebaseToken,
  optionalFirebaseToken,
};
