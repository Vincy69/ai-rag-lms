import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://snommmnxkkhtfwixfpso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNub21tbW54a2todGZ3aXhmcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjYyNzMyOCwiZXhwIjoyMDQ4MjAzMzI4fQ.v_ZadnckG5ADX27aW7u0D2r1A6KEInHQXCEY7cDLatg';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNub21tbW54a2todGZ3aXhmcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjYyNzMyOCwiZXhwIjoyMDQ4MjAzMzI4fQ.v_ZadnckG5ADX27aW7u0D2r1A6KEInHQXCEY7cDLatg';

// Client standard pour les utilisateurs normaux
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Client avec le service role pour les opérations d'administration
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});