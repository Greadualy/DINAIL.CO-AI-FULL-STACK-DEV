const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

let auth = null;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    const credential = typeof admin.cert === 'function'
      ? admin.cert(serviceAccount)
      : admin.credential.cert(serviceAccount);

    const apps = typeof admin.getApps === 'function' ? admin.getApps() : admin.apps || [];
    if (apps.length === 0) {
      admin.initializeApp({ credential });
    }

    auth = typeof getAuth === 'function' ? getAuth() : admin.auth();
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error.message);
  }
} else {
  // Defer failure until protected route execution when secret is mounted later
  console.warn('Firebase serviceAccountKey.json not found in backend directory');
}

module.exports = {
  admin,
  auth,
};
