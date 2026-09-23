import { createClient } from '@supabase/supabase-js';

// Read from env or dynamic localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');

  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || '',
    isConfigured: !!(envUrl || localUrl) && !!(envKey || localKey),
  };
};

let supabaseClient: any = null;

export const getSupabase = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
};

// Simulation of verification when Supabase is not connected
export interface AuthVerificationState {
  email: string;
  code: string;
  createdAt: number;
}
