import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, ShieldAlert, User } from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'home' | 'catalog' | 'report' | 'claims' | 'admin' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUserRole: UserRole;
  pendingClaimsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentUserRole,
  pendingClaimsCount = 0,
}) => {
  const isSecurityOrAdmin = currentUserRole === 'satpam' || currentUserRole === 'admin';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#CBD5E1] md:hidden shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {/* Tab 1: Beranda */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'home' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
          aria-label="Beranda"
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className={`text-[11px] mt-0.5 ${activeTab === 'home' ? 'font-bold text-[#0F172A]' : 'font-normal'}`}>
            Beranda
          </span>
        </button>

        {/* Tab 2: Cari Katalog */}
        <button
          onClick={() => onSelectTab('catalog')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'catalog' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
          aria-label="Cari"
        >
          <Search className={`w-5 h-5 ${activeTab === 'catalog' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className={`text-[11px] mt-0.5 ${activeTab === 'catalog' ? 'font-bold text-[#0F172A]' : 'font-normal'}`}>
            Cari
          </span>
        </button>

        {/* Tab 3: FAB Lapor (56px circular elevated button) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => onSelectTab('report')}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-300/40 flex items-center justify-center active:scale-95 transition-all border-4 border-white"
            aria-label="Laporkan Barang Temuan"
            title="Lapor Barang Temuan"
          >
            <PlusCircle className="w-7 h-7 fill-blue-600 text-white stroke-[1.5]" />
          </button>
          <span className="text-[11px] font-bold text-[#0F172A] mt-0.5">
            Lapor
          </span>
        </div>

        {/* Tab 4: WhatsApp / Klaim */}
        <button
          onClick={() => onSelectTab('claims')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] relative transition-colors ${
            activeTab === 'claims' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
          aria-label="WhatsApp Pelapor & Status Klaim"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${activeTab === 'claims' ? 'stroke-[2.5] text-emerald-600' : 'stroke-[1.75]'}`} />
            {pendingClaimsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#EF4444] text-white text-[9px] font-bold px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center leading-none">
                {pendingClaimsCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] mt-0.5 ${activeTab === 'claims' ? 'font-bold text-[#0F172A]' : 'font-normal'}`}>
            WhatsApp
          </span>
        </button>

        {/* Tab 5: Satpam Panel atau Profil */}
        <button
          onClick={() => onSelectTab(isSecurityOrAdmin ? 'admin' : 'profile')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] relative transition-colors ${
            (activeTab === 'admin' || activeTab === 'profile')
              ? 'text-[#0F172A]' 
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
          aria-label={isSecurityOrAdmin ? 'Pos Satpam' : 'Profil'}
        >
          {isSecurityOrAdmin ? (
            <>
              <div className="relative">
                <ShieldAlert className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <span className={`text-[11px] mt-0.5 ${(activeTab === 'admin') ? 'font-bold text-[#0F172A]' : 'font-normal'}`}>
                Satpam
              </span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 stroke-[1.75]" />
              <span className={`text-[11px] mt-0.5 ${(activeTab === 'profile') ? 'font-bold text-[#0F172A]' : 'font-normal'}`}>
                Profil
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
