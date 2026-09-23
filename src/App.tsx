import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Building2, 
  Filter, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Wifi,
  WifiOff,
  CheckCircle2,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

import { store } from './services/store';
import { Item, Claim, Profile, ItemCategory, ItemStatus } from './types';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ReportModal } from './components/ReportModal';
import { ClaimModal } from './components/ClaimModal';
import { ChatRoomModal } from './components/ChatRoomModal';
import { SatpamDashboard } from './components/SatpamDashboard';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { MyClaimsView } from './components/MyClaimsView';
import { ProfileView } from './components/ProfileView';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { Toast, ToastData } from './components/Toast';
import { ASSET_IMAGES } from './data/mockData';
import { WelcomeAuthPage, WelcomeAuthViewMode } from './components/WelcomeAuthPage';
import { ItemGridSkeleton } from './components/SkeletonLoader';
import { getSupabase } from './services/supabase';

const ALL_CATEGORIES: ('Semua' | ItemCategory)[] = [
  'Semua',
  'Elektronik',
  'Dokumen & Kartu',
  'Pakaian & Tas',
  'Aksesoris & Kunci',
  'Buku & Alat Tulis',
  'Lainnya',
];

export default function App() {
  // App state
  const [currentUser, setCurrentUser] = useState<Profile>(() => store.getCurrentUser());
  const [items, setItems] = useState<Item[]>(() => store.getItems());
  const [claims, setClaims] = useState<Claim[]>(() => store.getClaims());
  const [isOnline, setIsOnline] = useState<boolean>(() => store.getNetworkStatus());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => store.getIsLoggedIn());
  const [welcomeMode, setWelcomeMode] = useState<WelcomeAuthViewMode | null>(() => store.getIsLoggedIn() ? null : 'welcome');

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ItemCategory>('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | ItemStatus>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [activeClaimForChat, setActiveClaimForChat] = useState<{ claim: Claim | null; item: Item } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    setToast({ id: `${Date.now()}`, type, message });
  };

  // Listen to Supabase Auth Changes & Sessions
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Get current active session from Supabase
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session;
      if (session && session.user) {
        const userEmail = session.user.email || '';
        const userFullName = session.user.user_metadata?.full_name || userEmail.split('@')[0].toUpperCase();
        
        const allUsers = store.getAllUsers();
        let existing = allUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
        
        if (!existing) {
          existing = {
            id: session.user.id,
            full_name: userFullName,
            role: (session.user.user_metadata?.role as any) || 'siswa',
            email: userEmail,
            phone: session.user.phone || '',
            institution: session.user.user_metadata?.institution || 'SMKN 24 Jakarta',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          store.registerNewUser(existing);
        }
        
        store.setCurrentUser(existing);
        setCurrentUser(existing);
        setIsLoggedIn(true);
        setWelcomeMode(null);
      }
    });

    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session && session.user) {
        const userEmail = session.user.email || '';
        const userFullName = session.user.user_metadata?.full_name || userEmail.split('@')[0].toUpperCase();
        
        const allUsers = store.getAllUsers();
        let existing = allUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
        
        if (!existing) {
          existing = {
            id: session.user.id,
            full_name: userFullName,
            role: (session.user.user_metadata?.role as any) || 'siswa',
            email: userEmail,
            phone: session.user.phone || '',
            institution: session.user.user_metadata?.institution || 'SMKN 24 Jakarta',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          store.registerNewUser(existing);
        }
        
        store.setCurrentUser(existing);
        setCurrentUser(existing);
        setIsLoggedIn(true);
        setWelcomeMode(null);
        showToast('success', `Berhasil terautentikasi: ${existing.full_name}`);
      } else if (event === 'SIGNED_OUT') {
        store.setIsLoggedIn(false);
        setIsLoggedIn(false);
        setWelcomeMode('welcome');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync state with store and subscribe to Realtime events (TC-10, TC-11, TC-12)
  useEffect(() => {
    const unsubItems = store.subscribe('items-status', () => {
      setItems(store.getItems());
      showToast('info', 'Status katalog barang diperbarui secara realtime.');
    });

    const unsubClaims = store.subscribe('claims-status', () => {
      setClaims(store.getClaims());
      setItems(store.getItems());
    });

    const unsubAuth = store.subscribe('auth-change', (payload: { user?: Profile; loggedIn?: boolean }) => {
      if (payload && payload.user) {
        setCurrentUser(payload.user);
        showToast('success', `Beralih peran sebagai: ${payload.user.full_name}`);
      }
      if (payload && typeof payload.loggedIn === 'boolean') {
        setIsLoggedIn(payload.loggedIn);
      }
    });

    const unsubNetwork = store.subscribe('network-status', (payload: { online: boolean }) => {
      setIsOnline(payload.online);
      if (payload.online) {
        showToast('success', 'Koneksi jaringan realtime terhubung kembali.');
      } else {
        showToast('warning', 'Simulasi jaringan offline diaktifkan (TC-11).');
      }
    });

    return () => {
      unsubItems();
      unsubClaims();
      unsubAuth();
      unsubNetwork();
    };
  }, []);

  const refreshState = () => {
    setIsLoading(true);
    setItems(store.getItems());
    setClaims(store.getClaims());
    setCurrentUser(store.getCurrentUser());
    setIsOnline(store.getNetworkStatus());
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleToggleOnline = () => {
    store.setNetworkStatus(!isOnline);
  };

  // Open Item Detail
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  // Open Direct Claim
  const handleClaimDirect = (item: Item) => {
    setSelectedItem(item);
    setIsClaimOpen(true);
  };

  // Open Chat / WhatsApp Room
  const handleOpenChat = (claim: Claim | null, item: Item) => {
    setActiveClaimForChat({ claim, item });
    setIsChatOpen(true);
  };

  // Callback when a new claim is created
  const handleClaimSuccess = (newClaim: Claim, updatedItem: Item) => {
    refreshState();
    showToast('success', 'Klaim berhasil diajukan! Menyiapkan kontak WhatsApp pelapor...');
    setActiveClaimForChat({ claim: newClaim, item: updatedItem });
    setIsChatOpen(true);
  };

  // Callback when a new report is created
  const handleReportSuccess = (newItem: Item) => {
    refreshState();
    showToast('success', `Laporan "${newItem.title}" berhasil dipublikasikan!`);
    handleSelectItem(newItem);
  };

  // Extract unique locations for filtering
  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(items.map((i) => i.location_found)));
    return locs.filter(Boolean);
  }, [items]);

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchLoc = item.location_found.toLowerCase().includes(query);
        const matchStorage = item.storage_location.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchStorage && !matchCat) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
        return false;
      }

      // Location filter
      if (selectedLocation && item.location_found !== selectedLocation) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedStatusFilter, selectedLocation]);

  const pendingClaimsCount = useMemo(() => {
    if (currentUser.role === 'satpam' || currentUser.role === 'admin') {
      return claims.filter((c) => c.status === 'menunggu').length;
    }
    return claims.filter((c) => c.claimant_id === currentUser.id && c.status === 'menunggu').length;
  }, [claims, currentUser]);

  if (welcomeMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <WelcomeAuthPage
          initialMode={welcomeMode}
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            store.setCurrentUser(user);
            store.setIsLoggedIn(true);
            setCurrentUser(user);
            setIsLoggedIn(true);
            setWelcomeMode(null);
            showToast('success', `Berhasil masuk sebagai ${user.full_name} (${user.role}).`);
          }}
          onExploreCatalog={() => {
            setWelcomeMode(null);
            setActiveTab('catalog');
          }}
          onBackToApp={isLoggedIn ? () => setWelcomeMode(null) : undefined}
        />
        {toast && (
          <Toast
            toast={toast}
            onDismiss={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased selection:bg-[#FFC570] selection:text-[#1A3263]">
      {/* Top App Bar Header (Section 6 & 7b) */}
      <Header
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && activeTab === 'home') {
            setActiveTab('catalog');
          }
        }}
        unreadCount={pendingClaimsCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenWelcome={() => setWelcomeMode('welcome')}
        onOpenAuth={(mode = 'login') => setWelcomeMode(mode)}
        isLoggedIn={isLoggedIn}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenReport={() => {
          if (!isLoggedIn) {
            showToast('warning', 'Silakan masuk atau daftar terlebih dahulu untuk melaporkan barang.');
            setWelcomeMode('login');
            return;
          }
          setIsReportOpen(true);
        }}
      />

      {/* Main Container: Max-width 1200px, 16px mobile, 24px tablet, 32px desktop per Section 2 */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        

        {/* View Switcher based on Active Tab */}
        {activeTab === 'claims' ? (
          <MyClaimsView
            claims={claims}
            items={items}
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onSelectItem={handleSelectItem}
            isLoading={isLoading || isFiltering}
          />
        ) : activeTab === 'admin' ? (
          <SatpamDashboard
            items={items}
            claims={claims}
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onSelectItem={handleSelectItem}
            isLoading={isLoading || isFiltering}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView
            currentUser={currentUser}
            items={items}
            claims={claims}
            onOpenAuth={async () => {
              const supabase = getSupabase();
              if (supabase) {
                await supabase.auth.signOut();
              }
              store.logout();
              setIsLoggedIn(false);
              setWelcomeMode('welcome');
              showToast('info', 'Anda telah keluar. Silakan masuk kembali.');
            }}
            onOpenWelcome={() => setWelcomeMode('welcome')}
            onViewMyReports={() => {
              setSelectedCategory('Semua');
              setSelectedStatusFilter('all');
              setActiveTab('catalog');
            }}
            onViewMyClaims={() => setActiveTab('claims')}
          />
        ) : (
          /* Dashboard & Katalog Views */
          <div className="space-y-4 sm:space-y-6">
            
            {/* Top Bar Greeting: Sapaan "Hai, [Nama]" */}
            {activeTab === 'home' && (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Selamat datang kembali</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Hai {currentUser.full_name.split(' ')[0]}!
                </h1>
              </div>
            )}

            {/* Banner Info / Pengumuman per Section 7b */}
            {activeTab === 'home' && searchQuery === '' && (
              <div className="relative overflow-hidden rounded-3xl bg-blue-600 text-white shadow-md border border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  <div className="p-5 sm:p-7 md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Sistem Terverifikasi SOP Satpam</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                      Kehilangan atau Menemukan Barang di SMKN 24 Jakarta?
                    </h2>

                    <p className="text-xs sm:text-sm text-blue-100 max-w-lg leading-relaxed">
                      Cek katalog temuan transparan atau laporkan barang yang Anda temukan agar dapat diambil pemilik sah melalui pencocokan bukti.
                    </p>

                    {/* 2 Tombol Akses Cepat Berdampingan per Section 7b:
                        "Cari Barang" & "Lapor Barang" */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setIsReportOpen(true)}
                        className="h-11 px-5 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-full text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 fill-current text-white stroke-blue-600" />
                        Lapor Barang
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('catalog');
                          const catalogEl = document.getElementById('katalog-section');
                          catalogEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-11 px-5 bg-transparent hover:bg-blue-700 text-white font-semibold rounded-full text-xs sm:text-sm border border-white/40 transition-colors flex items-center gap-1.5"
                      >
                        <Search className="w-4 h-4" />
                        Cari Barang
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-5 h-44 md:h-full relative overflow-hidden bg-blue-700 flex items-center justify-center">
                    <img
                      src={ASSET_IMAGES.heroBanner}
                      alt="Lost and Found Campus Hub"
                      className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-blue-600/10 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Menu (4 Column Shortcut per Section 4.2) */}
            {activeTab === 'home' && searchQuery === '' && (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="bg-white hover:bg-slate-50/50 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center transition-colors mb-2 shadow-2xs">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Lapor</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Unggah temuan</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    const el = document.getElementById('katalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-slate-50/50 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-50 text-slate-700 group-hover:bg-slate-100 flex items-center justify-center transition-colors mb-2 shadow-2xs">
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Katalog</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Cari barang</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className="bg-white hover:bg-slate-50/50 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center transition-colors mb-2 shadow-2xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Pos Satpam</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Verifikasi</span>
                </button>

                <button
                  onClick={() => setActiveTab('claims')}
                  className="bg-white hover:bg-slate-50/50 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 flex items-center justify-center transition-colors mb-2 shadow-2xs">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Status</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Pantau klaim</span>
                </button>
              </div>
            )}

            {/* Catalog Section Header & Sticky Filter Trigger (Section 7c) */}
            <div id="katalog-section" className="space-y-3 pt-2">
              {/* Horizontal Scrollable Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Tombol Filter Ikon Membuka Bottom Sheet per Section 7c */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="h-8 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                  aria-label="Buka Filter Kategori & Lokasi"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter</span>
                  {(selectedCategory !== 'Semua' || selectedStatusFilter !== 'all' || selectedLocation) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </button>

                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setIsFiltering(true);
                        setSelectedCategory(cat);
                        setTimeout(() => setIsFiltering(false), 200);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skeleton Loading State per Section 6 & 8 */}
            {(isLoading || isFiltering) ? (
              <ItemGridSkeleton count={8} />
            ) : filteredItems.length === 0 ? (
              /* Empty State per Section 6 & 7c:
                 Ikon/ilustrasi sederhana + teks singkat + CTA ("Belum ada barang ditemukan" + tombol "Lapor Barang") */
              <div className="bg-white rounded-2xl p-10 text-center border border-[#CBD5E1] shadow-2xs my-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-8 h-8 text-[#64748B]" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">Belum ada barang ditemukan</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  Barang yang Anda cari belum dilaporkan, atau kata kunci dan filter Anda tidak cocok.
                </p>
                <div className="mt-5 flex justify-center items-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Semua');
                      setSelectedStatusFilter('all');
                      setSelectedLocation('');
                    }}
                    className="h-12 px-4 bg-white border border-[#CBD5E1] text-[#0F172A] rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Reset Filter
                  </button>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Lapor Barang
                  </button>
                </div>
              </div>
            ) : (
              /* Grid Layout per Section 2:
                 Mobile (< 640px): 2 kolom bersebelahan (gaya Tokopedia)
                 Tablet (640px – 1024px): 2 kolom grid
                 Desktop (> 1024px): 3–4 kolom grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectItem}
                    onClaimDirect={handleClaimDirect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Desktop / Tablet Quick Nav Helper Bar */}
      <div className="hidden md:block fixed bottom-4 right-6 z-30">
        <div className="bg-slate-900 text-white p-2 rounded-full shadow-2xl border border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Katalog
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                showToast('warning', 'Silakan masuk atau daftar terlebih dahulu untuk melaporkan barang.');
                setWelcomeMode('login');
                return;
              }
              setIsReportOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Lapor Temuan
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'claims' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Klaim ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Pos Satpam
          </button>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Section 6 & 7b) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'report') {
            if (!isLoggedIn) {
              showToast('warning', 'Silakan masuk atau daftar terlebih dahulu untuk melaporkan barang.');
              setWelcomeMode('login');
              return;
            }
            setIsReportOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        currentUserRole={currentUser.role}
        pendingClaimsCount={pendingClaimsCount}
      />

      {/* Floating Toast / Snackbar per Section 6 */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Filter Bottom Sheet per Section 7c */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatusFilter}
        onSelectStatus={setSelectedStatusFilter}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        availableLocations={availableLocations}
        onResetFilters={() => {
          setSelectedCategory('Semua');
          setSelectedStatusFilter('all');
          setSelectedLocation('');
        }}
      />

      {/* MODALS & BOTTOM SHEETS */}
      {/* 1. Item Detail Modal / Bottom Sheet */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenClaim={(item) => {
          setIsDetailOpen(false);
          setSelectedItem(item);
          setIsClaimOpen(true);
        }}
        onOpenChat={(claim, item) => {
          setIsDetailOpen(false);
          handleOpenChat(claim, item);
        }}
        currentUser={currentUser}
        existingUserClaim={claims.find(
          (c) => c.item_id === selectedItem?.id && c.claimant_id === currentUser.id
        )}
        allClaimsForItem={claims.filter((c) => c.item_id === selectedItem?.id)}
      />

      {/* 2. Report Form 2-Step Modal / Bottom Sheet */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={handleReportSuccess}
      />

      {/* 3. Claim Form Modal / Bottom Sheet */}
      <ClaimModal
        item={selectedItem}
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* 4. Verification Chat Room Modal / Bottom Sheet */}
      <ChatRoomModal
        claim={activeClaimForChat?.claim || null}
        item={activeClaimForChat?.item || null}
        currentUser={currentUser}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onClaimUpdated={(updatedClaim, updatedItem) => {
          refreshState();
          setActiveClaimForChat({ claim: updatedClaim, item: updatedItem });
        }}
      />

      {/* 7. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setCurrentUser(u)}
      />

      {/* 8. Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        claims={claims}
        items={items}
        onOpenChat={handleOpenChat}
      />
    </div>
  );
}
