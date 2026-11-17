import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import type { ToastItem } from '../../types';
import './Toast.css';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), 4200);
    return () => window.clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      className={`toast toast--${toast.type}`}
      initial={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 10 }}
      exit={{ opacity: 0, x: 36, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      role="status"
    >
      <div className="toast__icon">
        <Icon size={18} />
      </div>
      <div className="toast__body">
        <strong>{toast.title}</strong>
        {toast.message ? <p>{toast.message}</p> : null}
      </div>
      <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
      <motion.div
        className="toast__progress"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4.2, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function ToastViewport({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-viewport" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
