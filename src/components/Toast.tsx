import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000); // 3 detik per Section 6
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-[#F97316] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#FACC15] shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          {getIcon()}
          <span className="font-medium truncate">{toast.message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-full shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
