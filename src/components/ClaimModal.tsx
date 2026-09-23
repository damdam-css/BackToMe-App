import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Send, 
  FileText, 
  Lock,
  Sparkles
} from 'lucide-react';
import { Item, Claim } from '../types';
import { store } from '../services/store';

interface ClaimModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: (claim: Claim, item: Item) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const [proofDescription, setProofDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  // TC-09 Guard Check
  const isAlreadyReturned = item.status === 'sudah_dikembalikan';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // TC-09: Claim on returned item
    if (isAlreadyReturned) {
      setErrorMessage('Barang ini sudah dikembalikan kepada pemilik sah dan tidak dapat diklaim lagi.');
      return;
    }

    if (!proofDescription.trim() || proofDescription.trim().length < 5) {
      setErrorMessage('Mohon berikan deskripsi bukti kepemilikan minimal 5 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const claim = store.submitClaim(item.id, proofDescription.trim());
      const updatedItem = store.getItemById(item.id) || item;
      setIsSubmitting(false);
      onClaimSuccess(claim, updatedItem);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal mengajukan klaim.');
    }
  };

  const insertProofSample = (text: string) => {
    setProofDescription(text);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[90vh]">
        
        {/* Mobile Drag Handle Bar (32x4px) */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Klaim Kepemilikan Barang</h2>
              <p className="text-[11px] text-slate-400">Verifikasi Berbasis Bukti Nyata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup form klaim"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Ringkasan Singkat Barang di Atas per Section 7f */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
            <img 
              src={item.photo_url} 
              alt={item.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {item.category}
            </span>
            <h3 className="text-xs font-bold text-slate-900 truncate mt-1">{item.title}</h3>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">Lokasi: {item.location_found}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* TC-09 Guard Notice */}
          {isAlreadyReturned ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Barang Sudah Dikembalikan</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Barang ini telah terverifikasi dan diserahkan kepada pemilik sah. Formulir klaim telah dinonaktifkan sesuai SOP keamanan (TC-09).
                </p>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sample Helper Presets */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pilih Contoh Bukti Cepat:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertProofSample('Ada nomor seri / stiker di pojok kanan, dan wallpaper foto pribadi.')}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-700 hover:bg-slate-50 font-semibold transition-all"
                  >
                    Stiker / Layar
                  </button>
                  <button
                    type="button"
                    onClick={() => insertProofSample('Di dalam terdapat kartu OSIS/Kartu Pelajar atas nama saya serta karcis parkir.')}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-700 hover:bg-slate-50 font-semibold transition-all"
                  >
                    Isi & Identitas
                  </button>
                  <button
                    type="button"
                    onClick={() => insertProofSample('Terdapat goresan kecil di dekat tombol dan gantungan tali warna hitam.')}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-700 hover:bg-slate-50 font-semibold transition-all"
                  >
                    Ciri Fisik Unik
                  </button>
                </div>
              </div>

              {/* Textarea Bukti/Ciri Khusus Kepemilikan per Section 7f */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bukti / Ciri Khusus Kepemilikan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Jelaskan ciri khusus yang hanya diketahui pemilik sah (nomor seri, warna isi, lecet, gantungan khusus)..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keterangan ini akan langsung disiapkan sebagai template pesan WhatsApp ke pelapor temuan.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Setelah klaim dikirim, Anda akan langsung dialihkan ke <strong>WhatsApp Pelapor ({item.reporter_name})</strong> untuk konfirmasi dan mencocokkan fisik barang di Pos Satpam.
                </p>
              </div>
            </>
          )}

          {/* Tombol Submit Primary Full-Width per Section 7f */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white transition-all"
            >
              Tutup
            </button>

            {!isAlreadyReturned && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Klaim'}
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
