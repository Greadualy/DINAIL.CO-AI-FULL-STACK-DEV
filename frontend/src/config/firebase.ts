import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAtDsWwXF4usagjrUN1k1L0ppkoeb9DS5o",
  authDomain: "dinailco.firebaseapp.com",
  projectId: "dinailco",
  storageBucket: "dinailco.firebasestorage.app",
  messagingSenderId: "276583957391",
  appId: "1:276583957391:web:0933b7c19bfa05e130c1fa"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
