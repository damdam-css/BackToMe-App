/**
 * BackToMe - Types & Database Schema
 * Matches BAB 2 SRS & Design System Specification
 */

export type UserRole = 'siswa' | 'guru' | 'staff' | 'satpam' | 'admin';

export type ItemStatus = 'belum_diklaim' | 'proses_verifikasi' | 'sudah_dikembalikan';

export type ClaimStatus = 'menunggu' | 'valid' | 'ditolak';

export type ItemCategory = 
  | 'Elektronik'
  | 'Dokumen & Kartu'
  | 'Pakaian & Tas'
  | 'Aksesoris & Kunci'
  | 'Buku & Alat Tulis'
  | 'Lainnya';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  email: string;
  phone?: string;
  institution: string;
  created_at: string;
}

export interface Item {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_role: UserRole;
  reporter_phone?: string;
  title: string;
  category: ItemCategory;
  description: string;
  photo_url: string;
  location_found: string;
  date_found: string; // ISO string
  storage_location: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name: string;
  claimant_role: UserRole;
  proof_description: string;
  proof_attachment_url?: string;
  status: ClaimStatus;
  decision_note?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  claim_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  sent_at: string;
  is_system?: boolean;
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: string;
  expected: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  actualMessage?: string;
  timestamp?: string;
}
