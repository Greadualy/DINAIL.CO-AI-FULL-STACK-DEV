'use client';

import { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  const isDanger = variant === 'danger';
  const confirmBg = isDanger ? '#DC2626' : '#F37338';
  const confirmHoverBg = isDanger ? '#B91C1C' : '#CF4500';
  const iconBg = isDanger ? '#FEF2F2' : '#FFF5F0';
  const iconBorder = isDanger ? '#FECACA' : '#FDDCC8';
  const iconColor = isDanger ? '#DC2626' : '#F37338';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dinail-confirm-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoading) onCancel();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10050,
            backgroundColor: 'rgba(20, 20, 19, 0.42)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            fontFamily: 'var(--font-primary, Poppins, sans-serif)',
          }}
        >
          <motion.div
            key="dinail-confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
            style={{
              width: '100%',
              maxWidth: 'min(420px, 92vw)',
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE6E1',
              padding: '26px 24px 22px',
              boxShadow: '0 24px 56px rgba(20, 20, 19, 0.2)',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            {/* Icon Badge */}
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: iconBg,
                border: `1.5px solid ${iconBorder}`,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
              aria-hidden="true"
            >
              {isDanger ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>

            {/* Title & Description */}
            <h3
              id={titleId}
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#141413',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            <p
              id={descriptionId}
              style={{
                fontSize: 13,
                color: '#696969',
                margin: '0 0 22px',
                lineHeight: 1.55,
              }}
            >
              {description}
            </p>

            {/* Action Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-full"
                style={{
                  flex: '1 1 120px',
                  padding: '10px 18px',
                  borderRadius: 9999,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE6E1',
                  color: '#141413',
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  fontFamily: 'inherit',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#F8F5F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={isLoading}
                className="rounded-full"
                style={{
                  flex: '1 1 130px',
                  padding: '10px 20px',
                  borderRadius: 9999,
                  backgroundColor: confirmBg,
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.8 : 1,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isDanger
                    ? '0 4px 12px rgba(220, 38, 38, 0.22)'
                    : '0 4px 12px rgba(243, 115, 56, 0.24)',
                  transition: 'background-color 0.15s ease, transform 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = confirmHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = confirmBg;
                }}
              >
                {isLoading && (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.35)',
                      borderTopColor: '#FFFFFF',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
                <span>{isLoading ? 'Memproses...' : confirmText}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
