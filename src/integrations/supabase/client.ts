
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// Hardcoded values for Supabase
const supabaseUrl = 'https://hrsyrvidofafaxfeonol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3lydmlkb2ZhZmF4ZmVvbm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTc3MzMsImV4cCI6MjA2MDAzMzczM30.vPAaie42E5bIHgS5Ff0Ur2HjKgrF2Bl03HtscSbHhgY';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
