import { createClient } from '@supabase/supabase-js';
import { config } from './env';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key in environment variables');
}

// We use the Service Role Key for the backend to have admin access (bypass RLS)
// Be careful with this client and only use it for trusted backend operations.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
