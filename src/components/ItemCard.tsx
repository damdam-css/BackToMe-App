import React, { useState } from 'react';
import { MapPin, Building2, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Item, ItemStatus } from '../types';

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  onClaimDirect?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onClaimDirect }) => {
  const [imageError, setImageError] = useState(false);

  // Status Badge per Section 3 & 6 of UI/UX Guideline
  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'belum_diklaim':
        return {
          label: 'Belum Diklaim',
          className: 'bg-blue-50 text-blue-700 border border-blue-200',
          icon: <HelpCircle className="w-3 h-3 text-blue-600" />,
        };
      case 'proses_verifikasi':
        return {
          label: 'Proses Verifikasi',
          className: 'bg-amber-50 text-amber-800 border border-amber-200',
          icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
        };
      case 'sudah_dikembalikan':
        return {
          label: 'Sudah Dikembalikan',
          className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
        };
      default:
        return {
          label: status,
          className: 'bg-slate-50 text-slate-700 border border-slate-200',
          icon: null,
        };
    }
  };

  const statusBadge = getStatusBadge(item.status);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div 
      onClick={() => onSelect(item)}
      className="group bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98]"
    >
      {/* 1:1 Thumbnail with Status Badge Overlay */}
      <div className="relative w-full aspect-square bg-slate-50 shrink-0 overflow-hidden">
        {!imageError && item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-400">
            <Building2 className="w-8 h-8 stroke-[1.5] text-slate-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-500">{item.category}</span>
          </div>
        )}

        {/* Top-Right Status Badge Overlay */}
        <div className="absolute top-2 right-2 z-10">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${statusBadge.className}`}>
            {statusBadge.icon}
            <span className="hidden xs:inline sm:inline">{statusBadge.label}</span>
          </span>
        </div>

        {/* Category Chip at Bottom-Left */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Judul 1 baris (truncate + ellipsis) per Section 6 */}
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate leading-snug group-hover:text-blue-600 transition-colors" title={item.title}>
            {item.title}
          </h3>

          {/* Location Found with 14px Pin & text-secondary */}
          <div className="flex items-center gap-1 mt-1 text-slate-500 text-[10px] sm:text-xs font-semibold">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{item.location_found}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-slate-400 font-semibold">
            <Clock className="w-2.5 h-2.5 shrink-0" />
            <span>{formatDate(item.date_found)}</span>
          </div>

          {/* Storage location chip */}
          <div className="mt-1.5">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 text-left truncate max-w-full font-bold" title={item.storage_location}>
              <Building2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.storage_location}</span>
            </div>
          </div>
        </div>

        {/* Action Button: compact on grid list */}
        <div className="mt-3.5 pt-2 border-t border-slate-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.status === 'sudah_dikembalikan') {
                onSelect(item);
              } else if (onClaimDirect) {
                onClaimDirect(item);
              } else {
                onSelect(item);
              }
            }}
            className={`w-full py-1.5 px-2 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              item.status === 'sudah_dikembalikan'
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
            }`}
          >
            {item.status === 'sudah_dikembalikan' ? 'Riwayat' : 'Klaim'}
          </button>
        </div>
      </div>
    </div>
  );
};
