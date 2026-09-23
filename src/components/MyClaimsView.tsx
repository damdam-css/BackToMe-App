import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { Claim, Item, Profile } from '../types';
import { MyClaimsSkeleton } from './SkeletonLoader';

interface MyClaimsViewProps {
  claims: Claim[];
  items: Item[];
  currentUser: Profile;
  onOpenChat: (claim: Claim, item: Item) => void;
  onSelectItem: (item: Item) => void;
  isLoading?: boolean;
}

export const MyClaimsView: React.FC<MyClaimsViewProps> = ({
  claims,
  items,
  currentUser,
  onOpenChat,
  onSelectItem,
  isLoading = false,
}) => {
  if (isLoading) {
    return <MyClaimsSkeleton />;
  }

  const isSecurity = currentUser.role === 'satpam' || currentUser.role === 'admin';
  const myClaims = isSecurity
    ? claims
    : claims.filter((c) => c.claimant_id === currentUser.id);

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {isSecurity ? 'Semua Status Sesi Klaim' : 'Riwayat & Status Klaim Saya'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
              Pantau progres verifikasi bukti fisik barang temuan
            </p>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
            {myClaims.length} Pengajuan
          </span>
        </div>
      </div>

      {myClaims.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-800 text-sm">Belum Ada Pengajuan Klaim</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Jika barang Anda tertinggal di area SMKN 24 Jakarta, cari di katalog dan klik "Klaim Barang Ini" untuk memulai sesi verifikasi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myClaims.map((claim) => {
            const item = items.find((i) => i.id === claim.item_id);
            if (!item) return null;

            return (
              <div
                key={claim.id}
                onClick={() => onOpenChat(claim, item)}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={item.photo_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        claim.status === 'valid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : claim.status === 'ditolak'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {claim.status === 'valid' ? 'Disetujui' : claim.status === 'ditolak' ? 'Ditolak' : 'Verifikasi'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Lokasi: {item.location_found} · Simpan: {item.storage_location}
                    </p>
                    <p className="text-[11px] text-slate-600 font-semibold truncate mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      "{claim.proof_description}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-left sm:text-right text-[10px] text-slate-400 font-medium">
                    <span>Pengklaim: {claim.claimant_name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChat(claim, item);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                    WhatsApp Pelapor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
