-- ==============================================================================
-- BACKTOME - LOST & FOUND PLATFORM
-- Supabase PostgreSQL Schema & Security Rules (RLS)
-- Project ID: eerdjbxjtifcxuyqdpsm
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('siswa', 'guru', 'staff', 'satpam', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('belum_diklaim', 'proses_verifikasi', 'sudah_dikembalikan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE claim_status AS ENUM ('menunggu', 'valid', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM (
        'Elektronik', 
        'Dokumen & Kartu', 
        'Pakaian & Tas', 
        'Aksesoris & Kunci', 
        'Buku & Alat Tulis', 
        'Lainnya'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'siswa',
    avatar_url TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    institution TEXT NOT NULL DEFAULT 'SMA / Kampus Terpadu',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ITEMS TABLE (Katalog Barang Hilang & Temuan)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_role TEXT NOT NULL DEFAULT 'siswa',
    reporter_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Lainnya',
    description TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    location_found TEXT NOT NULL,
    date_found TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    storage_location TEXT NOT NULL DEFAULT 'Pos Satpam Utama',
    status TEXT NOT NULL DEFAULT 'belum_diklaim',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLAIMS TABLE (Klaim Kepemilikan Barang)
CREATE TABLE IF NOT EXISTS public.claims (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    claimant_id TEXT NOT NULL,
    claimant_name TEXT NOT NULL,
    claimant_role TEXT NOT NULL DEFAULT 'siswa',
    proof_description TEXT NOT NULL,
    proof_attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'menunggu',
    decision_note TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MESSAGES TABLE (Chat & Catatan Verifikasi)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'siswa',
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant_id ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_messages_claim_id ON public.messages(claim_id);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to items catalog
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

-- Allow inserting items
CREATE POLICY "Anyone can report an item" 
ON public.items FOR INSERT WITH CHECK (true);

-- Allow updating items (e.g. status changes by satpam or reporters)
CREATE POLICY "Anyone can update items status" 
ON public.items FOR UPDATE USING (true);

-- Allow public read and write access to claims
CREATE POLICY "Claims are viewable by everyone" 
ON public.claims FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a claim" 
ON public.claims FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update claims status" 
ON public.claims FOR UPDATE USING (true);

-- Allow read and write to messages
CREATE POLICY "Messages are viewable by everyone" 
ON public.messages FOR SELECT USING (true);

CREATE POLICY "Anyone can post a message" 
ON public.messages FOR INSERT WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Anyone can insert or update profiles" 
ON public.profiles FOR ALL USING (true);

-- 9. REALTIME PUBLICATION SETUP
-- Enables Supabase Realtime websocket broadcasting
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
