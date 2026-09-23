import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  MessageCircle,
  Building2, 
  MapPin, 
  Check, 
  X
} from 'lucide-react';
import { Item, Claim, Profile } from '../types';
import { store } from '../services/store';
import { SatpamDashboardSkeleton } from './SkeletonLoader';

interface SatpamDashboardProps {
  items: Item[];
  claims: Claim[];
  currentUser: Profile;
  onOpenChat: (claim: Claim, item: Item) => void;
  onSelectItem: (item: Item) => void;
  isLoading?: boolean;
  onDeleteItem?: (item: Item) => void;
}

export const SatpamDashboard: React.FC<SatpamDashboardProps> = ({
  items,
  claims,
  currentUser,
  onOpenChat,
  onSelectItem,
  isLoading = false,
  onDeleteItem,
}) => {
  if (isLoading) {
    return <SatpamDashboardSkeleton />;
  }

  // Tab/filter status per Section 7i: Menunggu / Valid / Ditolak / Daftar Barang
  const [filterTab, setFilterTab] = useState<'menunggu' | 'valid' | 'ditolak' | 'items'>('menunggu');

  // Statistics
  const totalItems = items.length;
  const pendingClaims = claims.filter((c) => c.status === 'menunggu');
  const validClaims = claims.filter((c) => c.status === 'valid');
  const rejectedClaims = claims.filter((c) => c.status === 'ditolak');

  const filteredClaims = claims.filter((c) => {
    if (filterTab === 'menunggu') return c.status === 'menunggu';
    if (filterTab === 'valid') return c.status === 'valid';
    if (filterTab === 'ditolak') return c.status === 'ditolak';
    return true;
  });

  const formatClaimDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Bar Judul "Verifikasi Klaim" per Section 7i */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>POS SATPAM & MODERASI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Verifikasi Klaim & Antrean Barang</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola verifikasi bukti kepemilikan dan serah terima barang temuan SMKN 24 Jakarta.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-xs shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px]">Petugas Login</span>
              <span className="font-bold text-slate-200">{currentUser.full_name}</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-500 block text-[10px]">Peran</span>
              <span className="font-bold text-blue-400">Verifikator</span>
            </div>
          </div>
        </div>

        {/* Visual Statistik Grafik Breakdown Klaim */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Grafik Status Klaim Pemilik
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Total {claims.length} Klaim Diajukan · {totalItems} Barang Temuan
            </span>
          </div>

          {/* Stacked Percentage Progress Bar Chart */}
          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex mb-4 border border-slate-700 shadow-inner">
            {claims.length === 0 ? (
              <div className="w-full bg-slate-700 text-[9px] text-slate-400 flex items-center justify-center font-bold">
                Belum ada pengajuan klaim aktif
              </div>
            ) : (
              <>
                {pendingClaims.length > 0 && (
                  <div 
                    style={{ width: `${(pendingClaims.length / claims.length) * 100}%` }} 
                    className="bg-blue-500 h-full relative group transition-all duration-500 hover:opacity-90 animate-pulse"
                    title={`Menunggu: ${pendingClaims.length}`}
                  />
                )}
                {validClaims.length > 0 && (
                  <div 
                    style={{ width: `${(validClaims.length / claims.length) * 100}%` }} 
                    className="bg-emerald-500 h-full relative group transition-all duration-500 hover:opacity-90"
                    title={`Disetujui: ${validClaims.length}`}
                  />
                )}
                {rejectedClaims.length > 0 && (
                  <div 
                    style={{ width: `${(rejectedClaims.length / claims.length) * 100}%` }} 
                    className="bg-rose-500 h-full relative group transition-all duration-500 hover:opacity-90"
                    title={`Ditolak: ${rejectedClaims.length}`}
                  />
                )}
              </>
            )}
          </div>

          {/* Interactive Legend Counters with matching theme colors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Temuan</span>
                <p className="text-sm font-extrabold text-white mt-0.5">{totalItems}</p>
              </div>
              <div className="w-1.5 h-6 bg-slate-600 rounded-full" />
            </div>

            <div className="bg-blue-950/20 p-2.5 rounded-2xl border border-blue-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-400 block font-medium">Menunggu</span>
                <p className="text-sm font-extrabold text-blue-400 mt-0.5">
                  {pendingClaims.length}{' '}
                  <span className="text-[9px] text-blue-500/80 font-normal">
                    ({claims.length > 0 ? Math.round((pendingClaims.length / claims.length) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            </div>

            <div className="bg-emerald-950/20 p-2.5 rounded-2xl border border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 block font-medium">Disetujui</span>
                <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                  {validClaims.length}{' '}
                  <span className="text-[9px] text-emerald-500/80 font-normal">
                    ({claims.length > 0 ? Math.round((validClaims.length / claims.length) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            </div>

            <div className="bg-rose-950/20 p-2.5 rounded-2xl border border-rose-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-300 block font-medium">Ditolak</span>
                <p className="text-sm font-extrabold text-rose-400 mt-0.5">
                  {rejectedClaims.length}{' '}
                  <span className="text-[9px] text-rose-500/80 font-normal">
                    ({claims.length > 0 ? Math.round((rejectedClaims.length / claims.length) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab/Filter Status (Menunggu/Valid/Ditolak) per Section 7i */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full max-w-lg overflow-x-auto">
        <button
          onClick={() => setFilterTab('menunggu')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'menunggu'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Menunggu ({pendingClaims.length})
        </button>
        <button
          onClick={() => setFilterTab('valid')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'valid'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Valid ({validClaims.length})
        </button>
        <button
          onClick={() => setFilterTab('ditolak')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'ditolak'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Ditolak ({rejectedClaims.length})
        </button>
        <button
          onClick={() => setFilterTab('items')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'items'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Barang ({items.length})
        </button>
      </div>

      {/* Tab Content */}
      {filterTab !== 'items' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0F172A] text-sm">
              Antrean Klaim: {filterTab === 'menunggu' ? 'Menunggu Keputusan' : filterTab === 'valid' ? 'Telah Disetujui' : 'Telah Ditolak'} ({filteredClaims.length})
            </h3>
            <span className="text-xs text-[#64748B]">Ketuk kartu untuk buka Chat Verifikasi</span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#CBD5E1]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-[#0F172A] text-sm">Tidak ada klaim dalam status ini</p>
              <p className="text-xs text-[#64748B] mt-1">Semua klaim pada kategori ini sudah terorganisir.</p>
            </div>
          ) : (
            /* List card klaim (foto barang + nama pengklaim + waktu ajukan) per Section 7i */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredClaims.map((claim) => {
                const targetItem = items.find((i) => i.id === claim.item_id);
                if (!targetItem) return null;

                return (
                  <div
                    key={claim.id}
                    onClick={() => onOpenChat(claim, targetItem)}
                    className="bg-white rounded-xl border border-[#CBD5E1] p-3.5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Foto barang + Info Dasar */}
                      <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-[#CBD5E1]">
                          <img 
                            src={targetItem.photo_url} 
                            alt={targetItem.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                            {targetItem.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate mt-0.5" title={targetItem.title}>
                            {targetItem.title}
                          </h4>
                          <p className="text-[11px] text-[#64748B] truncate">
                            Penyimpanan: {targetItem.storage_location}
                          </p>
                        </div>
                      </div>

                      {/* Nama Pengklaim & Waktu Ajukan (Section 7i) */}
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Pengklaim:</span>
                          <span className="font-bold text-[#0F172A]">{claim.claimant_name} ({claim.claimant_role.toUpperCase()})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Waktu Pengajuan:</span>
                          <span className="text-[#64748B] font-mono text-[11px]">{formatClaimDate(claim.created_at)}</span>
                        </div>
                        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                          <span className="text-[10px] font-bold text-amber-900 block mb-0.5">Bukti Diajukan:</span>
                          <p className="text-xs text-slate-700 italic line-clamp-2">"{claim.proof_description}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Keputusan & Chat via WhatsApp per Section 7i */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChat(claim, targetItem);
                        }}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                        Hubungi via WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Tab Daftar Barang Fisik */
        <div className="space-y-3">
          <h3 className="font-bold text-[#0F172A] text-sm">Semua Barang Temuan di Pos ({items.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white rounded-xl border border-[#CBD5E1] p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-[#CBD5E1]">
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#0F172A] truncate mt-1">{item.title}</h4>
                  <p className="text-[11px] text-[#64748B] truncate">Simpan: {item.storage_location}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 text-center"
                  >
                    Detail
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Apakah Anda yakin ingin menghapus laporan barang ini secara permanen? Semua klaim terkait juga akan ikut dihapus.')) {
                        onDeleteItem?.(item);
                      }
                    }}
                    className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 shrink-0 text-center"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
