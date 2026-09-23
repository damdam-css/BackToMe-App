import React from 'react';
import { 
  Search, 
  Bell,
  LogIn,
  Home,
  PlusCircle,
  MessageCircle,
  ShieldAlert,
  User,
  Plus,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Profile } from '../types';
import { NavTab } from './BottomNav';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentUser: Profile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenWelcome?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  isLoggedIn?: boolean;
  activeTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenReport?: () => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  unreadCount = 2,
  onOpenNotifications,
  onOpenWelcome,
  onOpenAuth,
  isLoggedIn = true,
  activeTab,
  onSelectTab,
  onOpenReport,
  isMobileFrame = false,
  onToggleMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-100 shadow-xs">
      {/* Main App Bar */}
      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3.5 max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name / Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {isLoggedIn ? (
            <button 
              onClick={() => onSelectTab && onSelectTab('profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-blue-600 focus:outline-none ring-2 ring-transparent active:scale-95 transition-all"
            >
              {currentUser.avatar_url ? (
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-slate-700">{currentUser.full_name.charAt(0)}</span>
              )}
            </button>
          ) : (
            <button 
              onClick={onOpenWelcome}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs"
            >
              B
            </button>
          )}

          <div className="leading-tight">
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
              {isLoggedIn ? 'SMKN 24 JAKARTA' : 'APP MOBILE'}
            </span>
            <span 
              onClick={onOpenWelcome}
              className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
            >
              {isLoggedIn ? currentUser.full_name.split(' ')[0] : 'BackToMe'}
            </span>
          </div>
        </div>

        {/* Search Input - Minimalist */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari barang temuan / hilang..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-10 pr-8 h-9 sm:h-10 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-sm font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Toggle Mobile Phone Simulator View (desktop only) */}
          {onToggleMobileFrame && (
            <button
              onClick={onToggleMobileFrame}
              className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
              title={isMobileFrame ? 'Kembali ke Layar Lebar' : 'Simulasi Tampilan Layar HP'}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mode Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mode HP</span>
                </>
              )}
            </button>
          )}

          {/* In-App PWA Install Trigger */}
          <PWAInstallButton variant="compact" />

          {isLoggedIn ? (
            <>
              {/* Lapor barang desktop shortcut */}
              <button
                onClick={onOpenReport}
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Lapor</span>
              </button>

              {/* Notification badge */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none border border-slate-100"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : onOpenWelcome?.()}
              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search input row (only visible on smallest screens) */}
      <div className="px-3.5 pb-2.5 block sm:hidden">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari barang hilang di SMKN 24..."
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-9 pr-8 h-9 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 text-sm font-bold w-4 h-4 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
