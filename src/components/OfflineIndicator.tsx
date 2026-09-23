import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-slate-700 animate-in slide-in-from-bottom duration-300">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>Mode Offline — Aplikasi tetap berjalan menggunakan cache PWA lokal.</span>
    </div>
  );
};
