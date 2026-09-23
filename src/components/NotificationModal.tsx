import React from 'react';
import { X, Bell, CheckCircle2, ShieldAlert, MessageSquare } from 'lucide-react';
import { Item, Claim } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Claim[];
  items: Item[];
  onOpenChat: (claim: Claim, item: Item) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  claims,
  items,
  onOpenChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[80vh]">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-blue-400 animate-bounce" />
            <h2 className="text-sm font-bold tracking-tight">Pemberitahuan & Aktivitas</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto divide-y divide-slate-100 space-y-1">
          <div className="p-4 bg-blue-50/20 rounded-2xl border border-blue-200 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>SOP Pengambilan Barang Temuan</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-semibold">
              Bawa kartu tanda pengenal (Kartu Siswa/KTM/KTP) saat mengambil barang yang telah disetujui di Pos Satpam.
            </p>
          </div>

          {claims.slice(0, 6).map((claim) => {
            const item = items.find((i) => i.id === claim.item_id);
            return (
              <div
                key={claim.id}
                onClick={() => {
                  if (item) {
                    onOpenChat(claim, item);
                    onClose();
                  }
                }}
                className="py-3 px-2 flex items-start gap-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      Klaim: {item?.title || 'Barang'}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      claim.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : claim.status === 'ditolak'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {claim.status === 'valid' ? 'Disetujui' : claim.status === 'ditolak' ? 'Ditolak' : 'Menunggu'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    Pengklaim: {claim.claimant_name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold">Ketuk untuk membuka ruang chat</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
