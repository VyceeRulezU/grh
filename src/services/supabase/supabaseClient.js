// Deployment trigger: 2026-03-12T12:35
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[GRH] CRITICAL: Supabase credentials missing during build time! \n' +
    'The app is currently using fallback URLs which will not work. \n' +
    'Please verify that VITE_SUPABASE_URL is set in your GitHub Secrets.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabaseAnonKey || 'missing-key'
);
