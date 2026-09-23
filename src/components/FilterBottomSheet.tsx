import React from 'react';
import { X, Check, Filter, RotateCcw } from 'lucide-react';
import { ItemCategory, ItemStatus } from '../types';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: 'Semua' | ItemCategory;
  onSelectCategory: (cat: 'Semua' | ItemCategory) => void;
  selectedStatus: 'all' | ItemStatus;
  onSelectStatus: (status: 'all' | ItemStatus) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  availableLocations: string[];
  onResetFilters: () => void;
}

const CATEGORIES: ('Semua' | ItemCategory)[] = [
  'Semua',
  'Elektronik',
  'Dokumen & Kartu',
  'Pakaian & Tas',
  'Aksesoris & Kunci',
  'Buku & Alat Tulis',
  'Lainnya',
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  selectedLocation,
  onSelectLocation,
  availableLocations,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[90vh]">
        
        {/* Drag Handle Bar 32x4px (Section 6) */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight">Filter Katalog Barang</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup filter"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Filter 1: Kategori Barang */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Kategori Barang
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 2: Status Barang */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Status Barang
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectStatus('all')}
                className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua Status
              </button>
              <button
                onClick={() => onSelectStatus('belum_diklaim')}
                className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all ${
                  selectedStatus === 'belum_diklaim'
                    ? 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Belum Diklaim
              </button>
              <button
                onClick={() => onSelectStatus('proses_verifikasi')}
                className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all ${
                  selectedStatus === 'proses_verifikasi'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Proses Verifikasi
              </button>
              <button
                onClick={() => onSelectStatus('sudah_dikembalikan')}
                className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all ${
                  selectedStatus === 'sudah_dikembalikan'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Sudah Dikembalikan
              </button>
            </div>
          </div>

          {/* Filter 3: Lokasi Ditemukan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Lokasi Ditemukan
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="w-full h-11 px-3.5 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="">Semua Lokasi Kampus</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onResetFilters}
            className="h-11 px-5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 bg-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            Terapkan Filter
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
