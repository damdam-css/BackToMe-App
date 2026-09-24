import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  Eye, 
  EyeOff, 
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  Check,
  Filter,
  Send,
  Compass,
  Bookmark
} from 'lucide-react';
import { Profile, UserRole } from '../types';
import { store } from '../services/store';
import { MOCK_USERS } from '../data/mockData';
import { getSupabase } from '../services/supabase';
import welcomeIllustration from '../assets/images/welcome_search_illustration_1790164318567.jpg';

export type WelcomeAuthViewMode = 'welcome' | 'login' | 'register';

interface WelcomeAuthPageProps {
  initialMode?: WelcomeAuthViewMode;
  onLoginSuccess: (user: Profile) => void;
  onExploreCatalog: () => void;
  onBackToApp?: () => void;
  currentUser?: Profile;
}

export const WelcomeAuthPage: React.FC<WelcomeAuthPageProps> = ({
  initialMode = 'welcome',
  onLoginSuccess,
  onExploreCatalog,
  onBackToApp,
  currentUser,
}) => {
  const [mode, setMode] = useState<WelcomeAuthViewMode>(initialMode);

  // Verification / OTP state
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingUser, setPendingUser] = useState<Profile | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('siswa');
  const [regInstitution, setRegInstitution] = useState('SMKN 24 Jakarta');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreed, setRegAgreed] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Email dan kata sandi wajib diisi.');
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) {
        setLoginError(error.message);
        return;
      }
      return;
    }

    const allUsers = store.getAllUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationEmail(loginEmail.trim());

    if (existing) {
      setPendingUser(existing);
    } else {
      const newUser: Profile = {
        id: `user-${Date.now()}`,
        full_name: loginEmail.split('@')[0].toUpperCase(),
        role: 'siswa',
        email: loginEmail.trim(),
        institution: 'SMKN 24 Jakarta',
        created_at: new Date().toISOString(),
      };
      setPendingUser(newUser);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Alamat email wajib diisi.');
      return;
    }
    if (!regPassword) {
      setRegError('Kata sandi wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!regAgreed) {
      setRegError('Anda harus menyetujui komitmen integritas dan SOP sekolah.');
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            role: regRole,
            institution: regInstitution.trim(),
            phone: regPhone.trim(),
          }
        }
      });
      if (error) {
        setRegError(error.message);
        return;
      }
      setLoginEmail(regEmail.trim());
      setMode('login');
      setLoginError('Registrasi berhasil! Silakan periksa email masuk di Gmail Anda untuk memverifikasi akun Anda, lalu masuk.');
      return;
    }

    const newUser: Profile = {
      id: `user-${Date.now()}`,
      full_name: regFullName.trim(),
      role: regRole,
      email: regEmail.trim(),
      phone: regPhone.trim() || undefined,
      institution: regInstitution.trim() || 'SMKN 24 Jakarta',
      created_at: new Date().toISOString(),
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationEmail(regEmail.trim());
    setPendingUser(newUser);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCodeInput !== generatedCode) {
      setLoginError('Kode OTP yang Anda masukkan salah. Silakan coba lagi.');
      return;
    }

    if (pendingUser) {
      store.registerNewUser(pendingUser);
      store.setCurrentUser(pendingUser);
      onLoginSuccess(pendingUser);
      setVerificationEmail(null);
      setVerificationCodeInput('');
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setLoginError(error.message);
      }
    } else {
      const mockGUser: Profile = {
        id: `g-user-${Date.now()}`,
        full_name: 'Mahdi',
        role: 'siswa',
        email: 'mahdi@smkn24jakarta.sch.id',
        institution: 'SMKN 24 Jakarta',
        created_at: new Date().toISOString(),
      };
      store.registerNewUser(mockGUser);
      store.setCurrentUser(mockGUser);
      onLoginSuccess(mockGUser);
    }
  };

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
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        {verificationEmail ? (
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center mx-auto">
                V
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verifikasi OTP</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kode keamanan 6 digit telah dikirimkan ke <span className="font-semibold text-slate-800">{verificationEmail}</span>.
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl space-y-2">
              <p className="font-bold">Informasi OTP Instan:</p>
              <p className="text-[11px] leading-relaxed">Salin kode verifikasi di bawah ini untuk masuk secara cepat:</p>
              <div className="text-center py-1">
                <span className="font-extrabold text-blue-600 text-base bg-white px-3 py-1 rounded-lg border border-amber-300 select-all tracking-wider">{generatedCode}</span>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masukkan Kode OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full h-12 text-center text-xl font-bold tracking-[0.5em] rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-98"
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
              className="w-full text-xs text-slate-400 hover:text-slate-600 font-semibold text-center transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <div className={`w-full ${mode === 'welcome' ? 'max-w-4xl' : 'max-w-[340px]'} mx-auto`}>
            {/* ======================================================== */}
            {/* VIEW 1: WELCOME MODE (Onboarding Side-by-Side Mockup)    */}
            {/* ======================================================== */}
            {mode === 'welcome' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full py-6">
                
                {/* SCREEN 1: ONBOARDING SCREEN (Left Device) */}
                <div className="relative bg-white rounded-[2.5rem] shadow-[0_12px_36px_rgba(15,23,42,0.06)] border border-slate-200/60 p-7 flex flex-col justify-between w-full max-w-[340px] h-[580px] overflow-hidden shrink-0 transition-all hover:scale-[1.01]">
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-10"></div>
                  
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">SMKN 24 JAKARTA</span>
                    </div>
                    <button 
                      onClick={onExploreCatalog}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Katalog
                    </button>
                  </div>

                  {/* Vector Illustration */}
                  <div className="flex-1 flex items-center justify-center pt-2 overflow-hidden rounded-2xl">
                    <img 
                      src={welcomeIllustration} 
                      alt="Ilustrasi Cari Barang" 
                      className="w-full h-auto max-h-[190px] object-contain object-center rounded-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Onboarding Text Layout */}
                  <div className="text-center space-y-2 mt-2 px-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                      Find your
                    </h1>
                    <h1 className="text-3xl font-black text-[#EF4444] tracking-tight leading-none">
                      lost item!
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium px-2 mt-2 leading-normal">
                      Temukan barang Anda yang tertinggal di area sekolah SMKN 24 Jakarta dengan cepat dan aman.
                    </p>
                  </div>

                  {/* "Let's start" Pill Button */}
                  <div className="mt-5">
                    <button
                       onClick={() => setMode('login')}
                       className="w-full h-11 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-sm transition-all active:scale-[0.98]"
                    >
                      Let's start
                    </button>
                  </div>
                </div>

                {/* SCREEN 2: LIVE PREVIEW APP DASHBOARD (Right Device) */}
                <div className="hidden md:flex relative bg-[#F8FAFC] rounded-[2.5rem] shadow-[0_12px_36px_rgba(15,23,42,0.05)] border border-slate-200/60 p-5 flex-col justify-between w-full max-w-[340px] h-[580px] overflow-hidden shrink-0 transition-all hover:scale-[1.01]">
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-10"></div>
                  
                  {/* Avatar Greeting Bar */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
                        M
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] text-slate-400 font-bold leading-none">HALO SISWA</p>
                        <h4 className="text-xs font-black text-slate-800 mt-0.5">Hi, Mahdi</h4>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Search bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-9 bg-slate-100 rounded-xl px-3 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-medium">Cari barang hilang...</span>
                    </div>
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Categories layout */}
                  <div className="mt-3 text-left">
                    <h4 className="text-[10px] font-bold text-slate-800 tracking-wider mb-2">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1">
                        <div className="w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center">
                          <PlusCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700">Elektronik</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1">
                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700">Dokumen</span>
                      </div>
                    </div>
                  </div>

                  {/* Royal Blue Featured item card */}
                  <div className="mt-3 text-left flex-1 flex flex-col justify-end mb-3">
                    <h4 className="text-[10px] font-bold text-slate-800 tracking-wider mb-2">Terbaru untuk Anda</h4>
                    <div className="bg-[#2563EB] text-white p-3.5 rounded-2xl flex flex-col justify-between h-[115px] shadow-sm relative overflow-hidden">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Kunci Motor</span>
                          <Bookmark className="w-3 h-3 text-white/80" />
                        </div>
                        <h5 className="text-xs font-black mt-1">Honda Key Gantungan Merah</h5>
                        <p className="text-[8px] text-slate-200">Area Parkir Siswa · Gerbang Depan</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                        <span className="text-[8px] font-bold text-emerald-300">Siap Verifikasi</span>
                        <span className="text-[8px] text-slate-300">1 hari lalu</span>
                      </div>
                    </div>
                  </div>

                  {/* Auth Actions inside Preview */}
                  <div className="space-y-1.5 pb-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode('login')}
                        className="flex-1 h-8 bg-white hover:bg-slate-50 border border-slate-200 text-[#2563EB] font-bold text-[9px] rounded-lg transition-colors"
                      >
                        Masuk
                      </button>
                      <button
                        onClick={() => setMode('register')}
                        className="flex-1 h-8 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[9px] rounded-lg transition-colors"
                      >
                        Daftar Baru
                      </button>
                    </div>
                    <button
                      onClick={onExploreCatalog}
                      className="w-full text-[8px] text-slate-500 hover:text-slate-900 font-bold text-center underline block"
                    >
                      Jelajahi Katalog Publik
                    </button>
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="border-t border-slate-100 bg-white -mx-5 -mb-5 px-5 py-2 flex items-center justify-between">
                    <div className="p-1 rounded-full bg-blue-50 text-[#2563EB]">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 text-slate-300">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 text-slate-300">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 text-slate-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: LOGIN SCREEN (Halaman Masuk)                      */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_12px_36px_rgba(15,23,42,0.06)] border border-slate-200/60 p-7 flex flex-col justify-between w-full max-w-[340px] h-[580px] overflow-hidden transition-all hover:scale-[1.01]">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-10"></div>
                
                <div className="pt-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Small clean logo header */}
                    <div className="text-center mt-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white font-black text-base flex items-center justify-center mx-auto mb-1.5">
                        B
                      </div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">Masuk ke BackToMe</h2>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Gunakan akun SMKN 24 Jakarta
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-[#EF4444] text-[9px] rounded-xl font-bold mb-3 leading-normal">
                        {loginError}
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-800 mb-1 uppercase tracking-wide">
                          Alamat Email
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="nama@smkn24jakarta.sch.id"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-slate-50 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[9px] font-bold text-slate-800 uppercase tracking-wide">Kata Sandi</label>
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="text-[9px] text-slate-400 hover:text-slate-950 font-bold"
                          >
                            {showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Masukkan kata sandi"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-slate-50 font-medium"
                          />
                        </div>
                      </div>

                      {/* Submit Button - solid blue rounded-full */}
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-sm transition-colors mt-2 active:scale-98"
                      >
                        Masuk Sekarang
                      </button>
                    </form>

                    {/* Google Login with clean white frame */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-9 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-[10px] font-bold flex items-center justify-center gap-2 transition-colors shadow-3xs"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>Hubungkan Akun Google</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Switcher */}
                  <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Belum punya akun?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="font-bold text-[#2563EB] hover:underline"
                      >
                        Daftar Baru
                      </button>
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => setMode('welcome')}
                      className="text-[9px] text-slate-400 hover:text-slate-900 font-bold flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Kembali ke Awal</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: REGISTER SCREEN (Halaman Daftar Akun)            */}
            {/* ======================================================== */}
            {mode === 'register' && (
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_12px_36px_rgba(15,23,42,0.06)] border border-slate-200/60 p-6 flex flex-col justify-between w-full max-w-[340px] h-[580px] overflow-hidden transition-all hover:scale-[1.01]">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-10"></div>
                
                <div className="pt-4 flex-1 flex flex-col justify-between overflow-y-auto scrollbar-none">
                  <div>
                    <div className="text-center mt-2 mb-3">
                      <h2 className="text-base font-black text-slate-900 tracking-tight">Daftar Akun Baru</h2>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Lengkapi data identitas warga sekolah
                      </p>
                    </div>

                    {regError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-[#EF4444] text-[9px] rounded-xl font-bold mb-2 leading-normal">
                        {regError}
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                      {/* Nama Lengkap */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                          Nama Lengkap
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            required
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="Nama sesuai kartu pelajar"
                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                          Alamat Email
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="nama@smkn24jakarta.sch.id"
                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Telepon */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                          No. WhatsApp (Aktif)
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="Contoh: 0812345678"
                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Peran & Instansi */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                            Peran
                          </label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as UserRole)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50 font-bold text-slate-700"
                          >
                            <option value="siswa">Siswa</option>
                            <option value="guru">Guru</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                            Sekolah
                          </label>
                          <input
                            type="text"
                            disabled
                            value={regInstitution}
                            className="w-full h-8 px-2 rounded-lg border border-slate-100 text-[10px] bg-slate-100 text-slate-500 font-bold"
                          />
                        </div>
                      </div>

                      {/* Sandi & Konfirmasi Sandi */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                            Kata Sandi
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Minimal 6 karakter"
                              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-800 mb-0.5 uppercase tracking-wide">
                            Konfirmasi Sandi
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="password"
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Ketik ulang kata sandi"
                              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:border-[#2563EB] bg-slate-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="pt-0.5">
                        <label className="flex items-start gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={regAgreed}
                            onChange={(e) => setRegAgreed(e.target.checked)}
                            className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <span className="text-[8px] text-slate-400 font-bold leading-normal">
                            Saya bersedia menaati prosedur klaim barang di Pos Satpam SMKN 24 Jakarta.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-9 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[11px] rounded-full shadow-sm transition-colors active:scale-98"
                      >
                        Daftar Akun
                      </button>
                    </form>
                  </div>

                  {/* Footer Switcher */}
                  <div className="pt-3 border-t border-slate-100 text-center space-y-1.5">
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Sudah punya akun?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="font-bold text-[#2563EB] hover:underline"
                      >
                        Masuk
                      </button>
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => setMode('welcome')}
                      className="text-[9px] text-slate-400 hover:text-slate-900 font-bold flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Kembali ke Awal</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
