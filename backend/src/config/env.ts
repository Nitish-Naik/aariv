import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend root
// Since env.ts is in src/config, we go up two levels to backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  composioApiKey: process.env.COMPOSIO_API_KEY,
};
