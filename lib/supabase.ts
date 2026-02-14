import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '⚠ Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.'
  );
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

export { supabase };
