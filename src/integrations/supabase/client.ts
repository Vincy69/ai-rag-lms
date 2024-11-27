import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://snommmnxkkhtfwixfpso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNub21tbW54a2todGZ3aXhmcHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0ODg0ODAsImV4cCI6MjAyMzA2NDQ4MH0.96XBYYZXwXqA0bTDJ6N5qXg_H_J1vBXf_P_Pb1MOwxE';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNub21tbW54a2todGZ3aXhmcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNzQ4ODQ4MCwiZXhwIjoyMDIzMDY0NDgwfQ.Gy5LR9finn_gBwvV8-vBGVSVVFxXQVXQDvXkL_6YDWM';

// Client standard pour les utilisateurs normaux
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec le service role pour les opérations d'administration
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);