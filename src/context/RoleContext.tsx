'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'guest' | 'user';

export interface RoleUser {
  role: UserRole;
  name: string;
  email: string;
}

const MOCK_USERS: Record<Exclude<UserRole, 'guest'>, RoleUser> = {
  user: { role: 'user', name: 'Sari Dewi', email: 'sari@example.com' },
};

const generateUserId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DNL-USR-${num}`;
};

interface RoleContextType {
  currentUser: RoleUser | null;
  currentRole: UserRole;
  userId: string | null;
  login: (role: Exclude<UserRole, 'guest'>) => void;
  logout: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<RoleUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('dinail_role') as UserRole | null;
    if (savedRole && savedRole !== 'guest' && MOCK_USERS[savedRole]) {
      setCurrentUser(MOCK_USERS[savedRole]);
    }

    let savedUserId = localStorage.getItem('dinail_userId');
    if (!savedUserId && savedRole && savedRole !== 'guest') {
      savedUserId = generateUserId();
      localStorage.setItem('dinail_userId', savedUserId);
    }
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  const login = (role: Exclude<UserRole, 'guest'>) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('dinail_role', role);

    // Reuse existing userId or generate a new one
    const existing = localStorage.getItem('dinail_userId');
    const uid = existing || generateUserId();
    if (!existing) {
      localStorage.setItem('dinail_userId', uid);
    }
    setUserId(uid);
    setIsModalOpen(false);
  };

  const logout = () => {
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
