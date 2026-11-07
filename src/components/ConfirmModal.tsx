import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 size={26} className="text-rose-600" />,
      bg: 'bg-rose-100 ring-8 ring-rose-50',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-200',
    },
    warning: {
      icon: <AlertTriangle size={26} className="text-amber-600" />,
      bg: 'bg-amber-100 ring-8 ring-amber-50',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200',
    },
    info: {
      icon: <AlertCircle size={26} className="text-sky-600" />,
      bg: 'bg-sky-100 ring-8 ring-sky-50',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-200',
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm transition-all animate-fadeIn"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-emerald-950/10 transition-all animate-scaleUp"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            type="button"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          {/* Animated Icon Circle */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconConfig.bg} mb-4 transition`}
          >
            {iconConfig.icon}
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-extrabold text-emerald-950">{title}</h3>
          {description && (
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-6 flex w-full items-center gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              type="button"
              className="flex-1 rounded-xl border border-emerald-950/15 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition focus:ring-4 disabled:opacity-50 ${iconConfig.buttonBg}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
