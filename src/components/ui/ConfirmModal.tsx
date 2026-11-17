import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LogOut, Pencil, Trash2 } from 'lucide-react';
import './ConfirmModal.css';

export type ConfirmVariant = 'logout' | 'delete' | 'update' | 'generic';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const ICONS = {
  logout: LogOut,
  delete: Trash2,
  update: Pencil,
  generic: AlertTriangle,
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'generic',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const Icon = ICONS[variant];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className={`confirm-modal confirm-modal--${variant}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal__icon">
              <Icon size={22} />
            </div>
            <h2 id="confirm-title">{title}</h2>
            <p>{message}</p>
            <div className="confirm-modal__actions">
              <button type="button" className="btn btn--ghost" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${variant === 'delete' || variant === 'logout' ? 'btn--danger' : 'btn--primary'}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
