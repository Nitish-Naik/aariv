import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Make Supabase optional for prototype to prevent crash
const supabaseUrl = config.supabaseUrl || "https://placeholder.supabase.co";
const supabaseKey = config.supabaseServiceRoleKey || "placeholder";

if (!config.supabaseUrl) {
  console.warn("WARN: Missing Supabase URL. DB sync will be disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

