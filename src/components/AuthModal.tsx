import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { store } from '../services/store';
import { getSupabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: Profile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('siswa');
  const [institution, setInstitution] = useState('SMKN 24 Jakarta');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verification / OTP state
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingUser, setPendingUser] = useState<Profile | null>(null);

  const handleQuickLogin = (quickRole: 'siswa' | 'satpam') => {
    const demoUser: Profile = quickRole === 'siswa' ? {
      id: 'user-siswa-1',
      full_name: 'Damar Areefa Naraya',
      role: 'siswa',
      email: 'damarareefanaraya@gmail.com',
      phone: '0812-3456-7890',
      institution: 'SMKN 24 Jakarta',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    } : {
      id: 'user-satpam-1',
      full_name: 'Pak Joko (Satpam)',
      role: 'satpam',
      email: 'pakjoko.satpam@smkn24jakarta.sch.id',
      phone: '0819-8765-4321',
      institution: 'SMKN 24 Jakarta',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };

    store.registerNewUser(demoUser);
    store.setCurrentUser(demoUser);
    onSuccess(demoUser);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      if (tab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        // Success will be handled by App.tsx session state changes
        onClose();
        return;
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Nama lengkap wajib diisi.');
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
              institution,
            }
          }
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setErrorMessage('Registrasi sukses! Silakan periksa email masuk di Gmail Anda untuk memverifikasi akun Anda di Supabase, lalu masuk.');
        setTab('login');
        return;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationEmail(email.trim());

    if (tab === 'login') {
      const allUsers = store.getAllUsers();
      const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setPendingUser(existing);
      } else {
        const newUser: Profile = {
          id: `user-${Date.now()}`,
          full_name: email.split('@')[0].toUpperCase(),
          role: 'siswa',
          email: email.trim(),
          institution: 'SMKN 24 Jakarta',
          created_at: new Date().toISOString(),
        };
        setPendingUser(newUser);
      }
    } else {
      // Register validation
      if (!fullName.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        setVerificationEmail(null);
        return;
      }

      const newUser: Profile = {
        id: `user-${Date.now()}`,
        full_name: fullName.trim(),
        role,
        email: email.trim(),
        institution,
        created_at: new Date().toISOString(),
      };
      setPendingUser(newUser);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCodeInput !== generatedCode) {
      setErrorMessage('Kode OTP yang Anda masukkan salah. Silakan coba lagi.');
      return;
    }

    if (pendingUser) {
      store.registerNewUser(pendingUser);
      store.setCurrentUser(pendingUser);
      onSuccess(pendingUser);
      setVerificationEmail(null);
      setVerificationCodeInput('');
      onClose();
    }
  };

  const handleGoogleAuth = () => {
    const googleUser: Profile = {
      id: `user-google-${Date.now()}`,
      full_name: 'Damar Areefa Naraya',
      role: 'siswa',
      email: 'damarareefanaraya@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      institution: 'SMKN 24 Jakarta',
      created_at: new Date().toISOString(),
    };
    store.setCurrentUser(googleUser);
    onSuccess(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[92vh]">
        
        {/* Mobile Drag Handle */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {/* Header Logo & Tagline (top, center per Section 7a) */}
        <div className="bg-[#2563EB] text-white p-5 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1D4ED8] flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#FFC570] flex items-center justify-center text-[#1D4ED8] shadow-md font-bold text-xl mx-auto mb-2">
            B
          </div>
          <h2 className="text-lg font-bold">BackToMe</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Lost & Found SMKN 24 Jakarta
          </p>
        </div>

        {verificationEmail ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl space-y-1">
              <p className="font-bold text-xs">Informasi Sandbox AI Studio & Supabase:</p>
              <p className="text-[11px]">Masukkan kode verifikasi berikut untuk mengaktifkan akun Anda secara instan:</p>
              <div className="text-center py-1">
                <span className="font-extrabold text-[#1D4ED8] text-sm bg-white px-3 py-1 rounded border border-amber-300 select-all tracking-wider">{generatedCode}</span>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Masukkan Kode OTP 6-Digit
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 123456"
                  className="w-full h-12 text-center text-xl font-bold tracking-[0.5em] rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#FFC570] bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#FFC570] hover:bg-[#F5B050] text-[#1D4ED8] font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all animate-none"
              >
                Verifikasi & Masuk
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setVerificationEmail(null);
                setVerificationCodeInput('');
              }}
              className="w-full text-xs text-[#64748B] hover:text-[#0F172A] font-semibold text-center"
            >
              Kembali ke Login / Daftar
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switch "Masuk / Daftar" per Section 7a */}
            <div className="flex border-b border-[#CBD5E1] bg-slate-50 shrink-0">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  tab === 'login'
                    ? 'text-[#0F172A] border-b-2 border-[#2563EB] bg-white'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  tab === 'register'
                    ? 'text-[#0F172A] border-b-2 border-[#2563EB] bg-white'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-[#EF4444] text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Damar Areefa Naraya"
                        className="w-full h-12 pl-9 pr-3.5 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#FFC570]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Peran di Sekolah</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-12 px-3 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#FFC570] bg-white"
                    >
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="w-full h-12 pl-9 pr-3.5 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#FFC570]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0F172A]">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-[#64748B] hover:text-[#0F172A]"
                  >
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full h-12 pl-9 pr-3.5 rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#FFC570]"
                  />
                </div>
              </div>

              {/* Tombol Primary "Masuk"/"Daftar" full-width per Section 7a */}
              <button
                type="submit"
                className="w-full h-12 bg-[#FFC570] hover:bg-[#F5B050] text-[#1D4ED8] font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
              >
                {tab === 'login' ? 'Masuk' : 'Daftar'}
              </button>

              {/* Demo Quick Login Options */}
              {tab === 'login' && (
                <div className="pt-2.5 pb-1 px-1 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-800 text-center">
                    ⚡ MASUK CEPAT AKUN DEMO
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('siswa')}
                      className="h-10 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-bold rounded-xl border border-slate-200 transition-all flex flex-col items-center justify-center shadow-3xs"
                    >
                      <span className="text-[#2563EB]">Siswa (Damar)</span>
                      <span className="text-[8px] text-slate-400 font-medium">Bisa lapor & klaim</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('satpam')}
                      className="h-10 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-bold rounded-xl border border-slate-200 transition-all flex flex-col items-center justify-center shadow-3xs"
                    >
                      <span className="text-amber-700">Satpam (Pak Joko)</span>
                      <span className="text-[8px] text-slate-400 font-medium">Bisa verifikasi klaim</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Divider "atau" per Section 7a */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#CBD5E1]"></div>
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-3 text-[#64748B] font-medium">atau</span>
                </div>
              </div>

              {/* Tombol Secondary "Lanjutkan dengan Google" (ikon Google 20px) per Section 7a */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full h-12 bg-white border-1.5 border-[#2563EB] text-[#1D4ED8] hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Lanjutkan dengan Google
              </button>

              {/* Link "Lupa password?" di bawah per Section 7a */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setErrorMessage('Fitur pemulihan kata sandi via email sekolah akan dikirimkan ke alamat terdaftar.')}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] underline"
                >
                  Lupa password?
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
