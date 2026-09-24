import React, { useState, useRef } from 'react';
import { 
  Mail, 
  Building2, 
  FileText, 
  Clock, 
  LogOut,
  ChevronRight,
  HelpCircle,
  Database,
  CheckCircle2,
  User,
  Phone,
  Camera,
  X,
  Save,
  Loader2,
  Building
} from 'lucide-react';
import { Profile, Item, Claim } from '../types';
import { getSupabaseConfig } from '../services/supabase';
import { store } from '../services/store';

interface ProfileViewProps {
  currentUser: Profile;
  items: Item[];
  claims: Claim[];
  onOpenAuth: () => void;
  onViewMyReports?: () => void;
  onViewMyClaims?: () => void;
  onOpenWelcome?: () => void;
  onUpdateProfile?: (updated: Profile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  items,
  claims,
  onOpenAuth,
  onViewMyReports,
  onViewMyClaims,
  onOpenWelcome,
  onUpdateProfile,
}) => {
  const supabaseConfig = getSupabaseConfig();
  const reportedByMe = items.filter((i) => i.reporter_id === currentUser.id);
  const claimedByMe = claims.filter((c) => c.claimant_id === currentUser.id);
  const successfullyReturned = claims.filter(
    (c) => c.claimant_id === currentUser.id && c.status === 'valid'
  );

  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [institution, setInstitution] = useState(currentUser.institution || 'SMKN 24 Jakarta');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'satpam':
        return 'Petugas Satpam (Verifikator)';
      case 'admin':
        return 'Administrator Sekolah';
      case 'guru':
        return 'Guru / Tenaga Pendidik';
      default:
        return 'Siswa';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg('');
      const res = await store.uploadPhoto(file);
      setAvatarUrl(res.publicUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong');
      return;
    }

    const updatedProfile: Profile = {
      ...currentUser,
      full_name: fullName.trim(),
      phone: phone.trim(),
      institution: institution.trim(),
      avatar_url: avatarUrl.trim(),
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto animate-in fade-in duration-200">
      {/* Profil Header per Section 7h */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-18 h-18 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-800 shadow-xs shrink-0 relative group">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">{currentUser.full_name}</h2>
              <button 
                onClick={() => {
                  setFullName(currentUser.full_name);
                  setPhone(currentUser.phone || '');
                  setInstitution(currentUser.institution || 'SMKN 24 Jakarta');
                  setAvatarUrl(currentUser.avatar_url || '');
                  setErrorMsg('');
                  setIsEditOpen(true);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200 transition-all self-center sm:self-auto mt-2 sm:mt-0"
              >
                Edit Profil
              </button>
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.institution}</span>
              </p>
              {currentUser.phone && (
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.phone}</span>
                </p>
              )}
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
        {/* Edit Profil Menu Option */}
        <button
          onClick={() => {
            setFullName(currentUser.full_name);
            setPhone(currentUser.phone || '');
            setInstitution(currentUser.institution || 'SMKN 24 Jakarta');
            setAvatarUrl(currentUser.avatar_url || '');
            setErrorMsg('');
            setIsEditOpen(true);
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Edit Informasi Profil</span>
              <span className="text-[11px] text-slate-500 font-medium">Ubah foto profil, nama pengguna, dan instansi</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

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
                  Informasi SOP sekolah, keamanan, dan petunjuk sistem
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}

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

      {/* EDIT PROFILE MODAL / OVERLAY */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Edit Informasi Profil</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-150">
                  {errorMsg}
                </div>
              )}

              {/* Profile Photo Selector */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">{fullName.charAt(0) || '?'}</span>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Unggah Foto
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <span className="text-[10px] text-slate-400">Rekomendasi file JPG, PNG, atau WEBP maksimal 2MB</span>
              </div>

              {/* Input Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Input WhatsApp Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Input Institution */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Instansi / Sekolah
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Nama sekolah atau universitas"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
