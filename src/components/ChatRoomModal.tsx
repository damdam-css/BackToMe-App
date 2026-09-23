import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { Claim, Item, Profile } from '../types';
import { store } from '../services/store';
import { cleanPhoneNumber, generateWhatsAppMessage, openWhatsAppRedirect } from '../utils/whatsapp';

interface ChatRoomModalProps {
  claim: Claim | null;
  item: Item | null;
  currentUser: Profile;
  isOpen: boolean;
  onClose: () => void;
  onClaimUpdated?: (updatedClaim: Claim, updatedItem: Item) => void;
}

export const ChatRoomModal: React.FC<ChatRoomModalProps> = ({
  claim,
  item,
  currentUser,
  isOpen,
  onClose,
  onClaimUpdated,
}) => {
  if (!isOpen || !item) return null;

  const reporterPhone = item.reporter_phone || '0812-3456-7890';
  const cleanPhone = cleanPhoneNumber(reporterPhone);

  const [customMessage, setCustomMessage] = useState(() => {
    return generateWhatsAppMessage({
      reporterName: item.reporter_name,
      itemTitle: item.title,
      itemId: item.id,
      userName: currentUser.full_name,
      proofDescription: claim?.proof_description,
    });
  });

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const isSatpamOrAdmin = currentUser.role === 'satpam' || currentUser.role === 'admin';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(cleanPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppRedirect(cleanPhone, customMessage);
  };

  // Verifikasi Klaim: Setujui (Satpam)
  const handleApproveClaim = () => {
    if (!claim) return;
    setIsVerifying(true);
    try {
      const { claim: updatedClaim, item: updatedItem } = store.verifyClaimDecision(
        claim.id,
        'valid',
        'Klaim disetujui setelah diverifikasi langsung bukti dan identitas pengklaim.'
      );
      setIsVerifying(false);
      setActionSuccessNotice('Klaim BERHASIL DISETUJUI! Status barang kini "Sudah Dikembalikan"');
      if (onClaimUpdated) onClaimUpdated(updatedClaim, updatedItem);
    } catch (err: any) {
      setIsVerifying(false);
      alert(err.message || 'Gagal menyetujui klaim');
    }
  };

  // Verifikasi Klaim: Tolak (Satpam)
  const handleRejectClaim = () => {
    if (!claim) return;
    if (!rejectNote.trim()) {
      alert('Harap isi alasan penolakan klaim');
      return;
    }
    setIsVerifying(true);
    try {
      const { claim: updatedClaim, item: updatedItem } = store.verifyClaimDecision(
        claim.id,
        'ditolak',
        rejectNote.trim()
      );
      setIsVerifying(false);
      setRejectReasonPrompt(false);
      setActionSuccessNotice('Klaim telah DITOLAK dengan catatan tersimpan.');
      if (onClaimUpdated) onClaimUpdated(updatedClaim, updatedItem);
    } catch (err: any) {
      setIsVerifying(false);
      alert(err.message || 'Gagal menolak klaim');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Mobile Drag Handle Bar */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto" />
        </div>

        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 fill-white text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white">Hubungi Pelapor via WhatsApp</h2>
                <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  wa.me
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Koordinasi Langsung & Verifikasi Fisik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {actionSuccessNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{actionSuccessNotice}</span>
              </div>
              <button 
                onClick={() => setActionSuccessNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-bold underline"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Reporter Contact Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Kontak Pelapor Temuan
              </span>
              <span className="text-[9px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Terverifikasi Kampus
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-300 shrink-0">
                {item.reporter_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate">
                  {item.reporter_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="capitalize font-bold text-slate-700">{item.reporter_role}</span>
                  <span>·</span>
                  <span className="truncate">{item.storage_location}</span>
                </p>
              </div>
            </div>

            {/* Nomor WhatsApp & Tombol Salin */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-500 font-bold">WhatsApp:</span>
                <span className="font-mono font-extrabold text-slate-800 text-sm tracking-wide truncate">
                  {reporterPhone}
                </span>
              </div>
              <button
                onClick={handleCopyPhone}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-full text-[11px] flex items-center gap-1 transition-colors shrink-0 border border-slate-200"
                title="Salin nomor WhatsApp"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Item Summary Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <img
                src={item.photo_url}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase">
                  {item.category}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] text-slate-400 font-mono">#{item.id.slice(-5)}</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                <span>Disimpan di: {item.storage_location}</span>
              </p>
            </div>
          </div>

          {/* Klaim Bukti */}
          {claim && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Bukti Kepemilikan yang Diajukan:</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  claim.status === 'valid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : claim.status === 'ditolak'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Status: {claim.status === 'valid' ? 'Disetujui' : claim.status === 'ditolak' ? 'Ditolak' : 'Menunggu'}
                </span>
              </div>
              <p className="text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 leading-relaxed font-semibold">
                "{claim.proof_description}"
              </p>
            </div>
          )}

          {/* Template Pesan WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Format Pesan WhatsApp (Dapat Diedit)
              </label>
              <button
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Pesan Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <p className="text-[10px] text-slate-400">
              Pesan ini akan otomatis terisi saat Anda mengklik tombol "Lanjut ke Chat WhatsApp" di bawah.
            </p>
          </div>

          {/* Keamanan & SOP Satpam Notice */}
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">SOP Pengambilan Barang Kampus</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed font-medium">
                Hindari serah terima barang di tempat sepi atau tanpa saksi. Selalu sepakati pertemuan di <strong>{item.storage_location}</strong> didampingi petugas keamanan sekolah/kampus.
              </p>
            </div>
          </div>

          {/* Panel Kontrol Khusus Satpam (Jika Login sebagai Satpam) */}
          {isSatpamOrAdmin && claim && claim.status === 'menunggu' && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Keputusan Verifikasi Satpam (TC-06)
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                  Otoritas Petugas
                </span>
              </div>

              {!rejectReasonPrompt ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApproveClaim}
                    disabled={isVerifying}
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui Klaim (Valid)
                  </button>
                  <button
                    onClick={() => setRejectReasonPrompt(true)}
                    disabled={isVerifying}
                    className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak Klaim
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Alasan penolakan (misal: ciri fisik tidak cocok)..."
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 text-white text-xs rounded-full focus:outline-none focus:border-rose-400 placeholder-slate-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectReasonPrompt(false)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleRejectClaim}
                      disabled={isVerifying}
                      className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Sticky */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shadow-md shrink-0 flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white transition-colors"
          >
            Tutup
          </button>

          {/* Tombol Utama WhatsApp */}
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4.5 h-4.5 fill-white text-emerald-600" />
            <span>Lanjut ke Chat WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
