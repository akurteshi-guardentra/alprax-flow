// Environment configuration for production readiness
export const ENV = {
  // Environment flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Application settings
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Supabase configuration (using direct values since VITE_ vars aren't supported)
  SUPABASE_URL: 'https://vixpxmvsndusngxdmjuv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHB4bXZzbmR1c25neGRtanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODI4NjYsImV4cCI6MjA1NDI1ODg2Nn0.P4isRrXOmEkgcSAoI4iQFxKm0eX6Bk0Lk7hBlTyXsyI',
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: import.meta.env.PROD,
    ENABLE_ERROR_REPORTING: import.meta.env.PROD,
    ENABLE_PERFORMANCE_MONITORING: import.meta.env.PROD,
    ENABLE_DEBUG_PANEL: import.meta.env.DEV,
  },
  
  // API settings
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Security settings
  SECURITY: {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  }
} as const;

// Type-safe environment checker
export const checkEnvironment = () => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredEnvVars.filter(key => !ENV[key as keyof typeof ENV]);
  
  if (missing.length > 0 && ENV.isProduction) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

// Initialize environment check
if (ENV.isProduction) {
  checkEnvironment();
}