'use client';

/**
 * components/common/Toast.jsx
 * Lightweight toast / snackbar notification system.
 * No external dependencies — uses React context + Portal.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Project created!');
 *   toast.error('Failed to save.');
 *   toast.info('Meeting scheduled.');
 *   toast.warning('Permission denied.');
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

// ─── Individual Toast Item ───────────────────────────────────────────────────

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  info: <Info className="w-4 h-4 text-brand shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
};

const BG = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900',
  error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900',
  info: 'border-brand/30 bg-white dark:bg-slate-900',
  warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900',
};

function ToastItem({ id, type = 'info', message, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg shadow-slate-200/60 dark:shadow-black/40 text-sm font-medium text-slate-800 dark:text-slate-100 max-w-sm w-full transition-all duration-300 ${BG[type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {ICONS[type]}
      <span className="flex-1 text-xs leading-snug">{message}</span>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mt-0.5 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, ms) => addToast('success', msg, ms),
    error: (msg, ms) => addToast('error', msg, ms),
    info: (msg, ms) => addToast('info', msg, ms),
    warning: (msg, ms) => addToast('warning', msg, ms),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Portal — fixed bottom-right on desktop, bottom-center on mobile */}
      <div
        aria-label="Notifications"
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
