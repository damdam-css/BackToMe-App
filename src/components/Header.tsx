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
  Plus
} from 'lucide-react';
import { Profile } from '../types';
import { NavTab } from './BottomNav';

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
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white text-slate-800 border-b border-slate-100 shadow-xs">
      {/* Main App Bar */}
      <div className="px-4 py-3.5 max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name / Greeting */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button 
              onClick={() => onSelectTab && onSelectTab('profile')}
              className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-blue-600 focus:outline-none"
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
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base"
            >
              B
            </button>
          )}

          <div className="leading-tight">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isLoggedIn ? 'Halo,' : 'SMKN 24 JAKARTA'}
            </span>
            <span 
              onClick={onOpenWelcome}
              className="font-extrabold text-sm text-slate-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
            >
              {isLoggedIn ? currentUser.full_name.split(' ')[0] : 'BackToMe App'}
            </span>
          </div>
        </div>

        {/* Search Input - Minimalist, light grey input */}
        <div className="flex-1 max-w-md relative hidden xs:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari barang hilang di sekolah..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-10 pr-8 h-10 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Lapor barang desktop shortcut */}
              <button
                onClick={onOpenReport}
                className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Lapor Temuan</span>
              </button>

              {/* Notification badge */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none border border-slate-100"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : onOpenWelcome?.()}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search input row (only visible on smallest screens) */}
      <div className="px-4 pb-3.5 block xs:hidden">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari barang hilang di sekolah..."
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-10 pr-8 h-10 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
