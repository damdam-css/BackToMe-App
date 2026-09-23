import { createClient } from '@supabase/supabase-js';

// Default Supabase credentials provided by project
export const DEFAULT_SUPABASE_URL = 'https://eerdjbxjtifcxuyqdpsm.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcmRqYnhqdGlmY3h1eXFkcHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTY2MTUsImV4cCI6MjEwNTM3MjYxNX0.RYCeAENiw3A6_nOk5yATPETXt07w0y3nx7GNY5KeLgQ';

// Read from env, localStorage, or fallback
export const getSupabaseConfig = () => {
  let envUrl = import.meta.env.VITE_SUPABASE_URL;
  let envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  let localUrl = localStorage.getItem('supabase_url');
  let localKey = localStorage.getItem('supabase_anon_key');

  // Filter out system environment placeholder values
  if (envUrl && (envUrl.includes('your-project-id') || envUrl.includes('placeholder'))) {
    envUrl = undefined;
  }
  if (envKey && (envKey.includes('your-anon') || envKey.includes('placeholder'))) {
    envKey = undefined;
  }

  // If local storage has placeholder values from previous session, clear them
  if (localUrl && (localUrl.includes('your-project-id') || localUrl.includes('placeholder'))) {
    localStorage.removeItem('supabase_url');
    localUrl = null;
  }
  if (localKey && (localKey.includes('your-anon') || localKey.includes('placeholder'))) {
    localStorage.removeItem('supabase_anon_key');
    localKey = null;
  }

  const url = envUrl || localUrl || DEFAULT_SUPABASE_URL;
  const key = envKey || localKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url,
    key,
    isConfigured: !!(url && key),
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
