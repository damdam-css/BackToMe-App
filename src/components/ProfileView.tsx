import React from 'react';
import { 
  Mail, 
  Building2, 
  FileText, 
  Clock, 
  LogOut,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Database,
  CheckCircle2
} from 'lucide-react';
import { Profile, Item, Claim } from '../types';
import { getSupabaseConfig } from '../services/supabase';

interface ProfileViewProps {
  currentUser: Profile;
  items: Item[];
  claims: Claim[];
  onOpenAuth: () => void;
  onViewMyReports?: () => void;
  onViewMyClaims?: () => void;
  onOpenWelcome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  items,
  claims,
  onOpenAuth,
  onViewMyReports,
  onViewMyClaims,
  onOpenWelcome,
}) => {
  const supabaseConfig = getSupabaseConfig();
  const reportedByMe = items.filter((i) => i.reporter_id === currentUser.id);
  const claimedByMe = claims.filter((c) => c.claimant_id === currentUser.id);
  const successfullyReturned = claims.filter(
    (c) => c.claimant_id === currentUser.id && c.status === 'valid'
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'satpam':
        return 'Petugas Satpam (Verifikator)';
      case 'admin':
        return 'Administrator Kampus';
      case 'guru':
        return 'Guru / Tenaga Pendidik';
      default:
        return 'Siswa / Mahasiswa';
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto animate-in fade-in duration-200">
      {/* Profil Header per Section 7h */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-18 h-18 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-800 shadow-xs shrink-0">
            {currentUser.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              currentUser.full_name.charAt(0)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] font-extrabold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200 mb-1.5 uppercase tracking-wider">
              {getRoleLabel(currentUser.role)}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">{currentUser.full_name}</h2>
            
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.institution}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-base font-extrabold text-slate-900">{reportedByMe.length}</span>
            <span className="text-[10px] text-slate-500 block font-bold mt-0.5">Barang Temuan</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-base font-extrabold text-slate-900">{claimedByMe.length}</span>
            <span className="text-[10px] text-slate-500 block font-bold mt-0.5">Klaim Diajukan</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-base font-extrabold text-slate-900">{successfullyReturned.length}</span>
            <span className="text-[10px] text-slate-500 block font-bold mt-0.5">Selesai Kembali</span>
          </div>
        </div>
      </div>

      {/* Menu List per Section 7h */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Laporan Saya */}
        <button
          onClick={onViewMyReports}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Katalog Barang Saya</span>
              <span className="text-[11px] text-slate-500 font-medium">Lihat {reportedByMe.length} temuan barang yang Anda laporkan</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Klaim Saya */}
        <button
          onClick={onViewMyClaims}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Klaim Kepemilikan Saya</span>
              <span className="text-[11px] text-slate-500 font-medium">Pantau status verifikasi ({claimedByMe.length} klaim)</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Halaman Selamat Datang & Informasi */}
        {onOpenWelcome && (
          <button
            onClick={onOpenWelcome}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  Panduan Alur & Panduan Awal
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Informasi SOP kampus, keamanan, dan petunjuk sistem
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* Supabase Cloud Connection Status */}
        <div className="p-4 flex items-center justify-between bg-slate-50/70 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 block">Supabase Backend</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Terhubung
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[220px] sm:max-w-xs">
                {supabaseConfig.url ? 'eerdjbxjtifcxuyqdpsm.supabase.co' : 'Mode offline aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* Keluar (danger) per Section 7h */}
        <button
          onClick={onOpenAuth}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-50/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-rose-600 block">Keluar Akun</span>
              <span className="text-[11px] text-rose-400 font-medium">Akhiri sesi autentikasi atau ganti profil</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
