import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  MapPin, 
  Building2, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Phone
} from 'lucide-react';
import { store } from '../services/store';
import { Item, ItemCategory } from '../types';
import { ASSET_IMAGES } from '../data/mockData';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: Item) => void;
  itemToEdit?: Item | null;
}

const CATEGORIES: ItemCategory[] = [
  'Elektronik',
  'Dokumen & Kartu',
  'Pakaian & Tas',
  'Aksesoris & Kunci',
  'Buku & Alat Tulis',
  'Lainnya',
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSuccess, itemToEdit = null }) => {
  // 2-Step wizard per Section 7d
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Elektronik');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState(() => new Date().toISOString().slice(0, 16));
  const [storageLocation, setStorageLocation] = useState('Pos Satpam SMKN 24 Jakarta');
  const [reporterPhone, setReporterPhone] = useState(() => store.getCurrentUser().phone || '0812-3456-7890');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customErrorField, setCustomErrorField] = useState<'title' | 'photo' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync / Reset on Open or itemToEdit change
  React.useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setStep(2);
        setTitle(itemToEdit.title);
        setCategory(itemToEdit.category);
        setDescription(itemToEdit.description);
        setLocationFound(itemToEdit.location_found);
        try {
          setDateFound(new Date(itemToEdit.date_found).toISOString().slice(0, 16));
        } catch {
          setDateFound(new Date().toISOString().slice(0, 16));
        }
        setStorageLocation(itemToEdit.storage_location);
        setReporterPhone(itemToEdit.reporter_phone || '0812-3456-7890');
        setPhotoUrl(itemToEdit.photo_url);
        setPhotoFileName('foto_sebelumnya.jpg');
      } else {
        setStep(1);
        setTitle('');
        setCategory('Elektronik');
        setDescription('');
        setLocationFound('');
        setDateFound(new Date().toISOString().slice(0, 16));
        setStorageLocation('Pos Satpam SMKN 24 Jakarta');
        setReporterPhone(store.getCurrentUser().phone || '0812-3456-7890');
        setPhotoUrl('');
        setPhotoFileName('');
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  // Handle file selection with TC-01 & TC-04 validation
  const processFile = async (file: File) => {
    setErrorMessage(null);
    setCustomErrorField(null);

    try {
      const result = await store.uploadPhoto(file);
      setPhotoUrl(result.publicUrl);
      setPhotoFileName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah foto');
      setCustomErrorField('photo');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Quick Preset Sample Fillers (For convenient demonstration & testing)
  const applyPreset = (type: 'kamera' | 'kunci' | 'dompet') => {
    setErrorMessage(null);
    setCustomErrorField(null);
    if (type === 'kamera') {
      setTitle('Kamera Digital Sony Alpha 6000');
      setCategory('Elektronik');
      setDescription('Warna hitam dengan lensa kit 16-50mm, terdapat tali leher warna oranye bertuliskan Sony.');
      setLocationFound('Aula Sekolah, Kursi Baris G');
      setStorageLocation('Pos Satpam SMKN 24 Jakarta');
      setPhotoUrl(ASSET_IMAGES.camera);
      setPhotoFileName('sony_alpha_sample.jpg');
    } else if (type === 'kunci') {
      setTitle('Kunci Motor Honda Vario & Gantungan Karakter');
      setCategory('Aksesoris & Kunci');
      setDescription('Satu buah anak kunci motor bertutup magnet dan gantungan akrilik karakter anime.');
      setLocationFound('Area Parkir Sepeda Motor Siswa');
      setStorageLocation('Pos Satpam Gerbang Utama');
      setPhotoUrl(ASSET_IMAGES.wallet);
      setPhotoFileName('kunci_motor_sample.jpg');
    } else {
      setTitle('Kartu Pelajar & Dompet Kartu Kulit');
      setCategory('Dokumen & Kartu');
      setDescription('Dompet kartu ramping warna cokelat tua dengan 3 kartu identitas siswa dan stnk.');
      setLocationFound('Kantin SMKN 24 Jakarta, Meja Depan');
      setStorageLocation('Ruang Tata Usaha (TU) SMKN 24 Jakarta');
      setPhotoUrl(ASSET_IMAGES.wallet);
      setPhotoFileName('dompet_kulit_sample.jpg');
    }
  };

  // Step 1 Validation
  const handleNextStep1 = () => {
    setErrorMessage(null);
    setCustomErrorField(null);

    if (!photoUrl) {
      setErrorMessage('Silakan unggah atau pilih foto barang temuan terlebih dahulu.');
      setCustomErrorField('photo');
      return;
    }

    setStep(2);
  };

  // Final Submit (TC-03 & TC-05)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setCustomErrorField(null);

    // Validate Title (TC-03)
    if (!title || title.trim() === '') {
      setErrorMessage('Judul barang tidak boleh kosong');
      setCustomErrorField('title');
      return;
    }

    if (!locationFound || locationFound.trim() === '') {
      setErrorMessage('Lokasi ditemukan wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedItem: Item;
      if (itemToEdit) {
        savedItem = store.updateItem(itemToEdit.id, {
          title: title.trim(),
          category,
          description: description.trim() || 'Tidak ada deskripsi tambahan.',
          photo_url: photoUrl,
          location_found: locationFound.trim(),
          date_found: new Date(dateFound).toISOString(),
          storage_location: storageLocation.trim() || 'Pos Satpam Gedung Utama',
          reporter_phone: reporterPhone.trim() || '0812-3456-7890',
        });
      } else {
        savedItem = store.createItem({
          title: title.trim(),
          category,
          description: description.trim() || 'Tidak ada deskripsi tambahan.',
          photo_url: photoUrl,
          location_found: locationFound.trim(),
          date_found: new Date(dateFound).toISOString(),
          storage_location: storageLocation.trim() || 'Pos Satpam Gedung Utama',
          reporter_phone: reporterPhone.trim() || '0812-3456-7890',
          status: 'belum_diklaim',
        });
      }

      setIsSubmitting(false);
      onSuccess(savedItem);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal mempublikasikan laporan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#CBD5E1] max-h-[90vh] flex flex-col">
        
        {/* Mobile Drag Handle Bar (32x4px) per Section 6 */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight">
              {itemToEdit ? 'Edit Laporan Barang Temuan' : 'Laporkan Barang Temuan'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {itemToEdit 
                ? 'Perbarui rincian dan lokasi penyimpanan barang' 
                : `Langkah ${step} dari 2 — ${step === 1 ? 'Unggah Foto' : 'Rincian & Lokasi'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Progress Indicator 2 Titik per Section 7d */}
        {!itemToEdit && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step >= 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                </div>
                <span className={`text-xs ${step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                  Foto Barang
                </span>
              </div>

              <div className={`w-8 h-0.5 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                }`}>
                  2
                </div>
                <span className={`text-xs ${step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                  Detail & Lokasi
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Perhatian: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* STEP 1: Upload Foto (Section 7d) */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Foto Barang Temuan <span className="text-rose-500">*</span> (Maksimal 25MB, JPG/PNG)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/20' 
                      : customErrorField === 'photo'
                      ? 'border-rose-500 bg-rose-50/10'
                      : 'border-slate-200 hover:border-blue-500 bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {photoUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative mb-2.5">
                        <img 
                           src={photoUrl} 
                           alt="Preview Barang" 
                           className="w-full h-full object-cover" 
                           referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Foto berhasil dipilih
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Ketuk untuk mengganti foto</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2.5">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Tarik dan lepas foto atau ketuk untuk unggah</p>
                      <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Maksimal 25MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Detail, Kategori & Lokasi (Section 7d) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Photo preview summary */}
              {photoUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <img src={photoUrl} alt="Thumbnail" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-emerald-700 block">Foto Terunggah</span>
                    <span className="text-[10px] text-slate-400 truncate block">{photoFileName || 'Gambar barang'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline shrink-0"
                  >
                    Ganti
                  </button>
                </div>
              )}

              {/* Title Field (TC-03) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama / Judul Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (customErrorField === 'title') setCustomErrorField(null);
                  }}
                  placeholder="Contoh: Kamera Sony, Kunci Kontak..."
                  className={`w-full h-11 px-4 rounded-full border text-xs font-semibold focus:outline-none transition-all ${
                    customErrorField === 'title'
                      ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kategori Barang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full h-11 px-4 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ciri-Ciri Khusus / Deskripsi <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sebutkan warna, lecet, stiker, atau ciri unik..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              {/* Location Found */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lokasi Ditemukan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={locationFound}
                    onChange={(e) => setLocationFound(e.target.value)}
                    placeholder="Contoh: Gedung C Lt 2, Kantin Meja 5..."
                    className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Date Found */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Waktu / Tanggal Ditemukan
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="datetime-local"
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Storage Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lokasi Penyimpanan Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Contoh: Pos Satpam Gedung Utama, Ruang Guru..."
                    className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Reporter WhatsApp Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp Pelapor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890..."
                    className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Nomor WhatsApp ini digunakan pemilik sah untuk menghubungi Anda secara langsung saat verifikasi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Sticky Actions (Section 6 & 7d) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold bg-white transition-all"
            >
              Batal
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextStep1}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              Lanjutkan ke Rincian
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting 
                ? 'Memproses...' 
                : itemToEdit 
                ? 'Simpan Perubahan Laporan' 
                : 'Kirim Laporan Temuan'}
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
