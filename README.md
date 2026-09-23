# BackToMe: Sistem Informasi Kehilangan & Temuan Barang (SMKN 24 Jakarta)

Selamat datang di repositori **BackToMe**, sebuah aplikasi berbasis Web (SPA) modern yang dirancang khusus untuk memfasilitasi pelaporan, pencarian, klaim, dan serah terima barang temuan di lingkungan sekolah **SMKN 24 Jakarta** secara aman, transparan, dan sesuai dengan Prosedur Operasional Standar (SOP) sekolah.

Aplikasi ini mengusung pendekatan **Offline-First** dengan sinkronisasi waktu nyata (real-time) serta dukungan autentikasi ganda (Supabase + Local-first fallback state engine).

---

## 📌 DAFTAR ISI
1. [Gambaran Umum & Alur Kerja](#1-gambaran-umum--alur-kerja)
2. [Fitur Utama Aplikasi](#2-fitur-utama-aplikasi)
3. [Arsitektur Teknis & Struktur Folder](#3-arsitektur-teknis--struktur-folder)
4. [Persyaratan Sistem & Instalasi](#4-persyaratan-sistem--instalasi)
5. [Panduan Penggunaan & Akun Simulasi](#5-panduan-penggunaan--akun-simulasi)
6. [Skenario Pengujian (Test Cases & SOP Keamanan)](#6-skenario-pengujian-test-cases--sop-keamanan)
7. [Panduan Build & Deploy](#7-panduan-build--deploy)
8. [Penyelesaian Masalah (Troubleshooting)](#8-penyelesaian-masalah-troubleshooting)

---

## 1. GAMBARAN UMUM & ALUR KERJA

BackToMe dirancang untuk memecahkan masalah hilangnya barang berharga di lingkungan sekolah dengan melibatkan 3 aktor utama:
*   **Penemu (Reporter)**: Melaporkan barang yang ditemukan, mengisi formulir lengkap dengan foto, lokasi penemuan, dan lokasi penyimpanan barang saat ini (misal: Pos Satpam).
*   **Pemilik (Claimant)**: Mencari barang di katalog, mengajukan bukti/ciri fisik unik kepemilikan barang, dan memulai klaim.
*   **Petugas Keamanan (Satpam / Verifikator)**: Memverifikasi bukti yang diajukan. Jika bukti valid, Satpam menyetujui klaim, otomatis menolak klaim peniru lainnya, mengunci barang tersebut, dan memandu serah terima fisik barang.

```
[Penemu] -> Melaporkan Barang -> [Katalog Barang]
                                         |
[Pemilik] -> Cari & Klaim Barang --------+
                                         |
                                  (Sesi Verifikasi)
                                         |
[Satpam] -> Cek Bukti & Setujui Klaim ---+
                                         |
     (Barang Diserahkan & Klaim Dikunci Sesuai SOP)
```

---

## 2. FITUR UTAMA APLIKASI

*   **Autentikasi & Multi-Role**: Dukungan penuh untuk peran **Siswa**, **Guru**, **Satpam (Verifikator)**, dan **Admin**.
*   **Upload Foto Valid & Terkompresi**: Dilengkapi validasi berkas foto bawaan. Menolak file non-gambar dan membatasi ukuran unggahan hingga maksimal 25 MB sesuai dokumen SRS.
*   **Mesin Sinkronisasi Luring (Offline-First State Engine)**: Menggunakan `BackToMeStore` untuk menyimpan data di penyimpanan lokal jika koneksi internet atau Supabase terputus, sehingga aplikasi tetap berfungsi penuh 100%.
*   **Sistem Chat & Negosiasi Verifikasi**: Ruang diskusi langsung dan integrasi otomatis dengan WhatsApp Reporter untuk mencocokkan jadwal pengambilan barang fisik di Pos Satpam.
*   **Dashboard Keamanan Khusus (Satpam)**: Tampilan khusus satpam untuk memvalidasi bukti klaim secara instan (TC-06, TC-07, TC-08).
*   **Desain Minimalis Premium**: Menggunakan palet warna solid *Royal Blue & Slate* yang elegan, bersih, tanpa gradasi yang mengganggu, dan bebas dari ornamen yang tidak perlu.

---

## 3. ARSITEKTUR TEKNIS & STRUKTUR FOLDER

### Teknologi yang Digunakan:
*   **Frontend**: React (v19) + TypeScript + Vite.
*   **Styling**: Tailwind CSS (v4) untuk antarmuka pengguna yang responsif dan berkinerja tinggi.
*   **Icons**: Lucide React.
*   **Backend & DB**: Integrasi ganda (Supabase client jika `.env` terkonfigurasi, dengan fallback otomatis ke *Local Storage Store* yang robust).

### Struktur Direktori Utama:
```text
├── public/                 # Aset statis publik
├── src/
│   ├── assets/             # Aset gambar bawaan (mock) & banner
│   ├── components/         # Komponen UI modular
│   │   ├── AuthModal.tsx         # Modal masuk/daftar akun
│   │   ├── BottomNav.tsx         # Navigasi bawah untuk mobile view
│   │   ├── ChatRoomModal.tsx     # Ruang diskusi & persetujuan keputusan klaim
│   │   ├── ClaimModal.tsx        # Formulir klaim dengan contoh bukti instan
│   │   ├── FilterBottomSheet.tsx # Penyaringan katalog interaktif
│   │   ├── Header.tsx            # Header utama & status koneksi internet
│   │   ├── ItemCard.tsx          # Kartu katalog barang temuan
│   │   ├── ItemDetailModal.tsx   # Informasi detail penemuan barang
│   │   ├── MyClaimsView.tsx      # Riwayat klaim milik pengguna saat ini
│   │   ├── NotificationModal.tsx # Pusat notifikasi sistem & aktivitas terbaru
│   │   ├── ProfileView.tsx       # Detail profil, statistik, dan keluar sesi
│   │   ├── ReportModal.tsx       # Formulir pelaporan barang temuan baru
│   │   ├── SatpamDashboard.tsx   # Panel verifikator otorisasi satpam
│   │   ├── WelcomeAuthPage.tsx   # Halaman awal perkenalan SOP sekolah
│   │   └── Toast.tsx             # Toast notifikasi melayang
│   ├── data/
│   │   └── mockData.ts     # Data awal akun simulasi, barang, dan aset
│   ├── services/
│   │   ├── store.ts        # Mesin State Engine BackToMe (Offline-First)
│   │   └── supabase.ts     # Konfigurasi & inisialisasi Supabase SDK
│   ├── types.ts            # Skema basis data & tipe TypeScript (BAB 2 SRS)
│   ├── main.tsx            # Entry point aplikasi React
│   └── index.css           # Konfigurasi Tailwind CSS global
├── .env.example            # Contoh berkas konfigurasi variabel lingkungan
├── package.json            # Daftar dependensi & naskah perintah pengerjaan
└── tsconfig.json           # Konfigurasi TypeScript Compiler
```

---

## 4. PERSYARATAN SISTEM & INSTALASI

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di lingkungan lokal Anda.

### Persyaratan Sebelum Memulai:
*   **Node.js** versi `18.x` atau yang lebih baru (disarankan menggunakan versi LTS).
*   Manajer paket **npm** (bawaan Node.js), **yarn**, atau **bun**.

### Langkah-Langkah Instalasi:

1.  **Unduh atau Klon Repositori**:
    ```bash
    git clone <url-repositori-anda>
    cd <nama-folder-projek>
    ```

2.  **Instal Dependensi**:
    Gunakan npm untuk memasang semua modul yang dibutuhkan:
    ```bash
    npm install
    ```

3.  **Konfigurasi Variabel Lingkungan**:
    Salin berkas contoh `.env.example` menjadi `.env` di direktori utama:
    ```bash
    cp .env.example .env
    ```
    Isi nilai variabel sesuai kebutuhan Anda:
    ```env
    VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```
    *Catatan: Jika Anda tidak mengisi variabel di atas, aplikasi akan secara otomatis beralih ke mode **Simulasi Lokal Luring (LocalStorage Store)** dengan lancar tanpa ada error.*

4.  **Jalankan Server Pengembangan**:
    Mulai server lokal Anda di port `3000`:
    ```bash
    npm run dev
    ```
    Buka peramban (browser) Anda dan akses alamat `http://localhost:3000`.

---

## 5. PANDUAN PENGGUNAAN & AKUN SIMULASI

Untuk mempermudah pengujian alur kerja, sistem telah menyediakan satu akun simulasi default di dalam data lokal. Anda dapat menggunakannya langsung tanpa mendaftar terlebih dahulu.

### Akun Simulasi Bawaan:
*   **Siswa (Damar)**:
    *   **Email**: `damarareefanaraya@gmail.com`
    *   **Nama**: Damar Areefa Naraya
    *   **Role**: Siswa SMKN 24 Jakarta

### Cara Mengganti Akun & Simulasi Berbagai Peran:
1.  Masuk ke tab **Profil** di pojok kanan bawah navigasi.
2.  Klik tombol **Keluar Akun** di bagian paling bawah daftar menu.
3.  Anda akan diarahkan kembali ke halaman Selamat Datang / Autentikasi.
4.  Pada panel simulasi cepat di bagian atas formulir masuk, Anda dapat langsung mengeklik salah satu peran:
    *   **Masuk Sebagai Siswa** (untuk simulasi mengklaim barang)
    *   **Masuk Sebagai Satpam** (untuk menyetujui/menolak klaim)
    *   **Masuk Sebagai Admin** (untuk memantau seluruh aktivitas sistem)

---

## 6. SKENARIO PENGUJIAN (TEST CASES & SOP KEAMANAN)

Aplikasi ini mengimplementasikan aturan ketat sesuai dengan SOP penanganan kehilangan barang sekolah SMKN 24 Jakarta:

*   **TC-01 (Batas Ukuran Berkas)**: Mengunggah foto barang temuan di atas **25 MB** akan ditolak secara instan dengan peringatan demi menghemat bandwidth server.
*   **TC-04 (Validasi Format Berkas)**: Sistem mendeteksi ekstensi file secara ketat. Mengunggah file non-gambar (seperti `.pdf`, `.docx`, atau `.txt`) akan diblokir.
*   **TC-05 (Status Awal Temuan)**: Barang baru yang dilaporkan otomatis menyandang status **Belum Diklaim**.
*   **TC-06 (Konfirmasi Serah Terima)**: Ketika klaim disetujui oleh Satpam, status barang berubah menjadi **Sudah Dikembalikan**, dan semua obrolan/klaim terkait otomatis terkunci.
*   **TC-07 (Keputusan Penolakan)**: Klaim yang ditolak oleh Satpam akan mengembalikan status barang ke **Belum Diklaim** (jika tidak ada klaim penunggu lainnya), memberikan kesempatan bagi pemilik sah yang sebenarnya.
*   **TC-08 (Klaim Ganda & Auto-Reject)**: Jika suatu barang diklaim oleh beberapa orang berbeda, persetujuan satu klaim sah oleh Satpam akan **otomatis menolak** semua klaim peniru lainnya dengan pesan sistem penutupan sesi.
*   **TC-09 (Kunci SOP Barang Kembali)**: Tombol "Klaim Barang Ini" dinonaktifkan sepenuhnya untuk barang yang sudah berstatus *Sudah Dikembalikan* demi mencegah penipuan berulang.
*   **TC-10 & TC-11 (Simulasi Kehilangan Jaringan)**: Pengguna dapat menguji ketahanan aplikasi dengan menekan tombol luring/daring di bagian header. Saat luring, data disimpan lokal dan akan disinkronisasikan ulang saat internet terhubung kembali.

---

## 7. PANDUAN BUILD & DEPLOY

Aplikasi ini siap dideploy ke berbagai layanan hosting statis (SPA).

### Langkah 1: Membangun Aplikasi untuk Produksi
Jalankan perintah berikut untuk menghasilkan bundle produksi yang terkompresi dan dioptimalkan:
```bash
npm run build
```
Hasil kompilasi akan berada di dalam direktori `/dist`.

### Langkah 2: Cara Deploy ke Berbagai Platform

#### 1. Deploy ke Vercel (Paling Direkomendasikan):
Jika Anda memiliki Vercel CLI terpasang, cukup jalankan perintah berikut dari direktori utama projek:
```bash
npm install -g vercel
vercel
```
Atau hubungkan repositori GitHub Anda ke dashboard Vercel untuk deployment otomatis setiap kali ada perubahan pada branch utama (`main`).

#### 2. Deploy ke Netlify:
*   Membangun perintah build: `npm run build`
*   Folder tujuan: `dist`
*   Konfigurasi rute SPA (opsional, buat berkas `_redirects` di folder `public` jika menggunakan routing internal):
    ```text
    /*   /index.html   200
    ```

#### 3. Deploy ke Firebase Hosting:
Inisialisasi Firebase di komputer Anda, lalu deploy folder hasil build:
```bash
firebase init hosting
# Pilih folder publik: dist
# Konfigurasi sebagai single-page app: Yes
firebase deploy
```

---

## 8. PENYELAMATAN MASALAH (TROUBLESHOOTING)

### ❓ Terjadi Galat "Vite: Command Not Found" saat menjalankan proyek
**Penyebab**: Dependensi lokal belum terpasang atau folder `node_modules` terhapus.  
**Solusi**: Jalankan perintah `npm install` kembali sebelum menjalankan `npm run dev`.

### ❓ Perubahan pada file tidak langsung terlihat di browser (HMR Mati)
**Penyebab**: Sistem Hot Module Replacement (HMR) sedang tidak berjalan di beberapa lingkungan wadah isolasi.  
**Solusi**: Lakukan refresh browser secara manual (`Ctrl + F5` atau `Cmd + Shift + R`) untuk mengambil ulang skrip terbaru, atau mulai ulang server pengembangan dengan menghentikan terminal (`Ctrl + C`) dan menjalankan kembali `npm run dev`.

### ❓ Tidak Bisa Mengunggah Foto Barang Temuan
**Penyebab**: Ukuran gambar terlalu besar atau koneksi internet tidak stabil saat menginisiasi proses data URL.  
**Solusi**: Pastikan ukuran berkas di bawah 25 MB dan berformat gambar standar (PNG/JPG/WEBP).

---

Dibuat dengan dedikasi penuh untuk keamanan dan ketertiban penanganan barang temuan siswa di lingkungan sekolah **SMKN 24 Jakarta**. Jika terjadi kendala sistem lanjutan, silakan hubungi tim administrator kampus.

---
*BackToMe - Verifikasi Berbasis Bukti Nyata.*
