import React from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Calendar, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  MessageCircle,
  Lock, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Item, Profile, Claim } from '../types';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenClaim: (item: Item) => void;
  onOpenChat: (claim: Claim | null, item: Item) => void;
  currentUser: Profile;
  existingUserClaim?: Claim;
  allClaimsForItem: Claim[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenClaim,
  onOpenChat,
  currentUser,
  existingUserClaim,
  allClaimsForItem,
}) => {
  const [isImgLoaded, setIsImgLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsImgLoaded(false);
  }, [item?.id]);

  if (!isOpen || !item) return null;

  const isReturned = item.status === 'sudah_dikembalikan';
  const isSecurity = currentUser.role === 'satpam' || currentUser.role === 'admin';

  const formatFullDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return '-';
    }
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'belum_diklaim':
        return {
          label: 'Belum Diklaim',
          className: 'bg-amber-100 text-[#0F172A] border border-amber-300',
        };
      case 'proses_verifikasi':
        return {
          label: 'Proses Verifikasi',
          className: 'bg-orange-100 text-[#EA580C] border border-orange-300',
        };
      case 'sudah_dikembalikan':
        return {
          label: 'Sudah Dikembalikan',
          className: 'bg-emerald-100 text-[#15803D] border border-emerald-300',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[90vh]">
        
        {/* Mobile Drag Handle Bar (32x4px) */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {/* Top App Bar Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-bold tracking-wider">Detail Barang Temuan</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">#{item.id.slice(-5)}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup detail barang"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Foto Besar Full-Width di Atas (Rasio 4:3) per Section 7e */}
          <div className="relative aspect-4/3 w-full bg-slate-200 border-b border-slate-200 overflow-hidden">
            {!isImgLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                <Building2 className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <img
              src={item.photo_url}
              alt={item.title}
              onLoad={() => setIsImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-5 space-y-5">
            {/* Judul + Metadata di Bawah Foto per Section 7e */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 font-bold">
                <span className={`uppercase tracking-wider text-[10px] ${
                  item.status === 'belum_diklaim' ? 'text-blue-600' : item.status === 'proses_verifikasi' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {statusBadge.label}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-700">{item.category}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-normal text-slate-400">{formatFullDate(item.date_found)}</span>
              </div>
            </div>

            {/* Sudah Dikembalikan Notice (TC-09) */}
            {isReturned && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Barang Telah Diserahkan kepada Pemilik Sah</p>
                  <p className="text-emerald-700 mt-0.5 leading-relaxed">
                    Proses serah terima barang telah selesai. Hak pengajuan klaim baru telah ditutup sesuai SOP (TC-09).
                  </p>
                </div>
              </div>
            )}

            {/* Deskripsi Lengkap per Section 7e */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Deskripsi & Ciri-Ciri Khusus
              </h4>
              <div className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-wrap">
                {item.description || 'Tidak ada catatan tambahan mengenai ciri khusus.'}
              </div>
            </div>

            {/* Info Lokasi & Waktu Ditemukan (Ikon + Teks) per Section 7e */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3.5">
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Lokasi Ditemukan</span>
                  <span className="text-slate-500 font-medium">{item.location_found}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs border-t border-slate-100 pt-3">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Lokasi Penyimpanan / Pengambilan</span>
                  <span className="text-slate-500 font-medium">{item.storage_location}</span>
                </div>
              </div>

              <div className="flex items-start justify-between text-xs border-t border-slate-100 pt-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Pelapor Temuan</span>
                    <span className="text-slate-500 font-medium">{item.reporter_name} ({item.reporter_role.toUpperCase()})</span>
                    <span className="block text-emerald-700 font-bold font-mono text-[11px] mt-0.5">
                      WhatsApp: {item.reporter_phone || '0812-3456-7890'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChat(existingUserClaim || null, item)}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full font-bold text-[11px] flex items-center gap-1.5 shrink-0 border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                  <span>Chat WA</span>
                </button>
              </div>
            </div>

            {/* Sesi Klaim Terkait */}
            {allClaimsForItem.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Sesi Klaim Berjalan ({allClaimsForItem.length})</span>
                  {isSecurity && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Panel Satpam</span>}
                </h4>

                <div className="space-y-2">
                  {allClaimsForItem.map((c) => {
                    const isMyClaim = c.claimant_id === currentUser.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => onOpenChat(c, item)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs cursor-pointer hover:border-blue-600 transition-colors ${
                          isMyClaim ? 'bg-blue-50/20 border-blue-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{c.claimant_name}</span>
                            {isMyClaim && (
                              <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                ANDA
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">"{c.proof_description}"</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'valid'
                              ? 'bg-emerald-50 text-emerald-800'
                              : c.status === 'ditolak'
                              ? 'bg-rose-50 text-rose-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            {c.status === 'valid' ? 'Disetujui' : c.status === 'ditolak' ? 'Ditolak' : 'Menunggu'}
                          </span>
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tombol Sticky di Bawah per Section 7e: Dialihkan ke WhatsApp */}
        <div className="p-4 bg-white border-t border-slate-100 shadow-lg shrink-0 flex items-center gap-2.5">
          {/* Tombol Chat WhatsApp Pelapor */}
          <button
            onClick={() => onOpenChat(existingUserClaim || null, item)}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all shrink-0"
            title="Hubungi pelapor via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>Chat Pelapor</span>
          </button>

          {existingUserClaim ? (
            <button
              onClick={() => onOpenChat(existingUserClaim, item)}
              className="flex-1 h-11 px-4 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Status Klaim ({existingUserClaim.status})</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenClaim(item)}
              disabled={isReturned}
              className={`flex-1 h-11 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isReturned
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.98]'
              }`}
            >
              {isReturned ? (
                <>
                  <Lock className="w-4 h-4" />
                  Barang Sudah Dikembalikan
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Klaim Barang Ini
                </>
              )}
            </button>
          )}

          {isSecurity && !isReturned && (
            <button
              onClick={() => onOpenClaim(item)}
              className="h-11 px-3.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center"
              title="Ajukan tes klaim atas nama satpam"
            >
              Uji Klaim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
