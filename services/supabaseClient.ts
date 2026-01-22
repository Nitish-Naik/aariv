import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project URL and anon key
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yquolfsomedcwniwcyhb.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdW9sZnNvbWVkY3duaXdjeWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTExNDYsImV4cCI6MjA4Mzk4NzE0Nn0.Jydyrnt3-7W9SDPMk__OmDwcCahbvDrzFo7txVSoVmE'
);
