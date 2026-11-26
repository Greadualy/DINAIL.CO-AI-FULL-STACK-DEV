'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const MOCK_USERS: Record<string, RoleUser> = {
  customer: { role: 'customer', name: 'Sari Dewi', email: 'sari@example.com' },
  admin: { role: 'admin', name: 'Admin Dinail', email: 'admin@dinail.co' },
  owner: { role: 'owner', name: 'Owner Dinail', email: 'owner@dinail.co' },
  user: { role: 'customer', name: 'Sari Dewi', email: 'sari@example.com' },
};

const generateUserId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DNL-USR-${num}`;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RoleContextType {
  currentUser: RoleUser | null;
  currentRole: UserRole;
  userId: string | null;
  login: (role: Exclude<UserRole, 'guest'>) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<RoleUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync token to Backend Supabase
  const syncWithBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      console.log('[RoleContext] Syncing user to backend:', firebaseUser.email);

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
      console.log('[RoleContext] Sync response:', response.status, data);

      if (response.ok && data.success && data.data) {
        const dbUser = data.data;
        const role = (dbUser.role as UserRole) || 'customer';
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
        const uid = dbUser.id ? `DNL-USR-${dbUser.id.substring(0, 4).toUpperCase()}` : generateUserId();
        setUserId(uid);
        localStorage.setItem('dinail_role', role);
        localStorage.setItem('dinail_userId', uid);
      } else {
        throw new Error(data.message || 'Gagal sinkronisasi data dengan backend.');
      }
    } catch (error) {
      console.warn('[RoleContext] Backend sync unavailable, using Firebase profile:', error);
      const fallbackUser: RoleUser = {
        role: 'customer',
        name: firebaseUser.displayName || 'Customer',
        email: firebaseUser.email || '',
        photoUrl: firebaseUser.photoURL,
      };
      setCurrentUser(fallbackUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncWithBackend(firebaseUser);
      } else {
        const savedRole = localStorage.getItem('dinail_role') as UserRole | null;
        if (savedRole && savedRole !== 'guest' && MOCK_USERS[savedRole]) {
          setCurrentUser(MOCK_USERS[savedRole]);
          setUserId(localStorage.getItem('dinail_userId') || generateUserId());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncWithBackend(result.user);
        setIsModalOpen(false);
      }
    } catch (error: unknown) {
      console.error('Google Sign-In failed:', error);
      alert('Login Google dibatalkan atau popup ditutup.');
    }
  };

  const login = (role: Exclude<UserRole, 'guest'>) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('dinail_role', role);

    const existing = localStorage.getItem('dinail_userId');
    const uid = existing || generateUserId();
    if (!existing) {
      localStorage.setItem('dinail_userId', uid);
    }
    setUserId(uid);
    setIsModalOpen(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('SignOut error:', err);
    }
    setCurrentUser(null);
    setUserId(null);
    localStorage.removeItem('dinail_role');
    localStorage.removeItem('dinail_userId');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role ?? 'guest',
        userId,
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
