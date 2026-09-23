import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'pill' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleAction = async () => {
    if (isInstalled) {
      setShowModal(true);
      return;
    }

    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'pill' ? (
        <button
          onClick={handleAction}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isInstalled ? 'Aplikasi Terpasang ✓' : 'Pasang App HP'}</span>
        </button>
      ) : variant === 'full' ? (
        <button
          onClick={handleAction}
          className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{isInstalled ? 'Aplikasi Mobile Sudah Terpasang' : 'Pasang di Layar Utama (PWA Mobile)'}</span>
        </button>
      ) : variant === 'banner' ? (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm border border-blue-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold leading-tight">Pasang Aplikasi BackToMe</h4>
              <p className="text-[11px] text-blue-100 mt-0.5">Buka lebih cepat dari Home Screen HP tanpa kuota boros.</p>
            </div>
          </div>
          <button
            onClick={handleAction}
            className="px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs shrink-0 transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleAction}
          className={`h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${className}`}
          title="Pasang Aplikasi ke Layar Utama HP"
        >
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">{isInstalled ? 'App Terpasang' : 'Instal App'}</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {/* Detail / Panduan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                <img src="/icon.svg" alt="App Icon" className="w-10 h-10 rounded-xl" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Progressive Web App (PWA)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">BackToMe SMKN 24</h3>
              </div>
            </div>

            {/* Explanatory badge */}
            <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Apa itu Web App / PWA?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Teknologi PWA mengubah situs web ini menjadi <strong>aplikasi mobile mandiri</strong> yang dapat diinstal langsung ke layar utama smartphone (Android & iPhone) tanpa perlu mengunduh file APK besar dari Play Store/App Store.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white p-2 rounded-xl border border-blue-100/80">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-800 block">Sangat Cepat</span>
                  <span className="text-[9px] text-slate-400">Ukuran ringan &lt; 1MB</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-100/80">
                  <Layers className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-800 block">Layar Penuh</span>
                  <span className="text-[9px] text-slate-400">Tanpa bar URL browser</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-100/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-800 block">Aman & Terkini</span>
                  <span className="text-[9px] text-slate-400">Update otomatis</span>
                </div>
              </div>
            </div>

            {/* Platform Guides */}
            {isInstalled ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800">Aplikasi Sudah Terpasang!</h4>
                <p className="text-xs text-emerald-700">
                  Anda sudah menjalankan BackToMe dalam mode aplikasi mandiri. Ikon aplikasi telah ada di layar utama perangkat Anda.
                </p>
              </div>
            ) : isIOS ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cara Pasang di iPhone / iPad (iOS):</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>Buka halaman ini menggunakan browser <strong>Safari</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> di bilah bawah Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <p>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di menu iPhone Anda!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cara Pasang di Android / Laptop:</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>Klik tombol <strong>"Instal Sekarang"</strong> di bawah ini.</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p>Jika browser (Chrome / Edge / Samsung Internet) memunculkan dialog, konfirmasi dengan memilih <strong>"Instal" / "Tambahkan"</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p>Atau buka menu browser (titik 3 di kanan atas) &gt; pilih <strong>"Instal Aplikasi" / "Tambahkan ke Layar Utama"</strong>.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      alert('Untuk menginstal di browser ini, buka menu titik 3 di browser Anda lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
                    }
                    setShowModal(false);
                  }}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Instal Sekarang
                </button>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
