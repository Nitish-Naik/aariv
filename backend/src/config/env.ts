import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend root
// Since env.ts is in src/config, we go up two levels to backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validate required environment variables
 */
function validateEnv() {
  const required = ['OPENAI_API_KEY', 'COMPOSIO_API_KEY'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 Create a .env file in the backend/ directory with these variables.');
    console.error('   See backend/.env.example for reference.\n');
    
    // Only exit in production, allow dev to continue with warnings
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode without required env vars.\n');
    }
  }
}

// Run validation on import
validateEnv();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase (optional)
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Required APIs
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  composioApiKey: process.env.COMPOSIO_API_KEY || '',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  
  // Optional
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Helper to check if running in production
export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
