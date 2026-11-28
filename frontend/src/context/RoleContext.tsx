'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';

export type UserRole = 'guest' | 'user' | 'customer' | 'admin' | 'owner';

export interface RoleUser {
  role: UserRole;
  name: string;
  email: string;
  photoUrl?: string | null;
  phone?: string | null;
  id?: string;
  savedSizePreset?: string | null;
  savedMeasurements?: unknown;
}

export interface OpenAuthModalOptions {
  redirectAfterLogin?: string;
  onDismissWithoutLogin?: () => void;
}

const CUSTOMER_FALLBACK_USER: RoleUser = {
  role: 'customer',
  name: 'Sari Dewi',
  email: 'sari@example.com',
};

const generateUserId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DNL-USR-${num}`;
};

const normalizeDatabaseRole = (rawRole: unknown): Exclude<UserRole, 'guest' | 'user'> => {
  const value = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : '';
  if (value === 'owner') return 'owner';
  if (value === 'admin') return 'admin';
  return 'customer';
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RoleContextType {
  currentUser: RoleUser | null;
  currentRole: UserRole;
  userId: string | null;
  isAuthLoading: boolean;
  login: (role: Exclude<UserRole, 'guest'>) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isModalOpen: boolean;
  openModal: (options?: string | OpenAuthModalOptions) => void;
  closeModal: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<RoleUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pendingRedirectRef = useRef<string | null>(null);
  const onDismissRef = useRef<(() => void) | null>(null);

  // Sync Firebase ID token to Backend Database to obtain authoritative role
  const syncWithBackend = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
          email: firebaseUser.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const dbUser = data.data;
        const role = normalizeDatabaseRole(dbUser.role);
        const mappedUser: RoleUser = {
          role,
          name: dbUser.name || firebaseUser.displayName || 'Customer',
          email: dbUser.email || firebaseUser.email || '',
          photoUrl: dbUser.photoUrl || firebaseUser.photoURL,
          phone: dbUser.phone,
          id: dbUser.id,
          savedSizePreset: dbUser.savedSizePreset,
          savedMeasurements: dbUser.savedMeasurements,
        };
        setCurrentUser(mappedUser);
        const uid = dbUser.id
          ? `DNL-USR-${String(dbUser.id).substring(0, 4).toUpperCase()}`
          : generateUserId();
        setUserId(uid);
        localStorage.setItem('dinail_userId', uid);
      } else {
        throw new Error(data.message || 'Gagal sinkronisasi data dengan backend.');
      }
    } catch (error) {
      console.warn('[RoleContext] Backend sync unavailable, defaulting to customer role:', error);
      // Never elevate role when backend database verification is unavailable
      const fallbackUser: RoleUser = {
        role: 'customer',
        name: firebaseUser.displayName || 'Customer',
        email: firebaseUser.email || '',
        photoUrl: firebaseUser.photoURL,
      };
      setCurrentUser(fallbackUser);
      const existing = localStorage.getItem('dinail_userId');
      const uid = existing || generateUserId();
      if (!existing) localStorage.setItem('dinail_userId', uid);
      setUserId(uid);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await syncWithBackend(firebaseUser);
        } else {
          // Clear any legacy elevated role cache; unauthenticated visitors are strictly guest
          // (Only allow restoring a local non-privileged customer session if explicitly saved)
          const savedRole = localStorage.getItem('dinail_role');
          if (savedRole === 'customer' || savedRole === 'user') {
            if (isMounted) {
              setCurrentUser(CUSTOMER_FALLBACK_USER);
              setUserId(localStorage.getItem('dinail_userId') || generateUserId());
            }
          } else {
            localStorage.removeItem('dinail_role');
            if (isMounted) {
              setCurrentUser(null);
              setUserId(null);
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncWithBackend]);

  const completeLoginSuccess = useCallback(() => {
    const target = pendingRedirectRef.current;
    pendingRedirectRef.current = null;
    onDismissRef.current = null;
    setIsModalOpen(false);
    if (target) {
      router.push(target);
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncWithBackend(result.user);
        completeLoginSuccess();
      }
    } catch (error: unknown) {
      console.error('Google Sign-In failed:', error);
      alert('Login Google dibatalkan atau popup ditutup.');
    } finally {
      setIsAuthLoading(false);
    }
  }, [syncWithBackend, completeLoginSuccess]);

  // Client-side login never grants privileged roles (admin/owner come strictly from database)
  const login = useCallback(
    (_role: Exclude<UserRole, 'guest'>) => {
      void _role;
      setCurrentUser(CUSTOMER_FALLBACK_USER);
      localStorage.setItem('dinail_role', 'customer');

      const existing = localStorage.getItem('dinail_userId');
      const uid = existing || generateUserId();
      if (!existing) {
        localStorage.setItem('dinail_userId', uid);
      }
      setUserId(uid);
      setIsAuthLoading(false);
      completeLoginSuccess();
    },
    [completeLoginSuccess]
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('SignOut error:', err);
    }
    setCurrentUser(null);
    setUserId(null);
    localStorage.removeItem('dinail_role');
    localStorage.removeItem('dinail_userId');
  }, []);

  const openModal = useCallback((options?: string | OpenAuthModalOptions) => {
    if (typeof options === 'string') {
      pendingRedirectRef.current = options;
      onDismissRef.current = null;
    } else if (options && typeof options === 'object') {
      pendingRedirectRef.current = options.redirectAfterLogin ?? null;
      onDismissRef.current = options.onDismissWithoutLogin ?? null;
    } else {
      pendingRedirectRef.current = null;
      onDismissRef.current = null;
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    const dismissCallback = onDismissRef.current;
    pendingRedirectRef.current = null;
    onDismissRef.current = null;
    if (dismissCallback) {
      dismissCallback();
    }
  }, []);

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role ?? 'guest',
        userId,
        isAuthLoading,
        login,
        loginWithGoogle,
        logout,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}

export function useAuthModal() {
  const { isModalOpen, openModal, closeModal, currentUser, isAuthLoading } = useRole();
  return { isModalOpen, openModal, closeModal, currentUser, isAuthLoading };
}
