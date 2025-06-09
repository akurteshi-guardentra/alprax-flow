
/**
 * Environment configuration module
 * 
 * This module centralizes all environment variables and provides
 * appropriate defaults for development. In production, these values
 * should be set through environment variables.
 */

interface EnvironmentConfig {
  // API & Services
  stellarNetwork: 'TESTNET' | 'PUBLIC';
  horizonUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Feature Flags
  enableTestFeatures: boolean;
  enableDetailedLogs: boolean;
  
  // Analytics
  analyticsEnabled: boolean;
  analyticsKey: string | null;
  
  // App Configuration
  maxTransactionAmount: number;
  defaultCurrency: string;
  apiTimeout: number;
}

// Get environment variables with fallbacks
const getEnvVar = (name: string, defaultValue: string = ''): string => {
  const envVar = import.meta.env[`VITE_${name}`];
  return envVar !== undefined ? String(envVar) : defaultValue;
};

const getBoolEnvVar = (name: string, defaultValue: boolean = false): boolean => {
  const envVar = getEnvVar(name, String(defaultValue));
  return envVar.toLowerCase() === 'true';
};

const getNumEnvVar = (name: string, defaultValue: number): number => {
  const envVar = getEnvVar(name, String(defaultValue));
  const parsed = parseFloat(envVar);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Create and export environment configuration
export const config: EnvironmentConfig = {
  // API & Services
  stellarNetwork: getEnvVar('STELLAR_NETWORK', 'TESTNET') as 'TESTNET' | 'PUBLIC',
  horizonUrl: getEnvVar('HORIZON_URL', 'https://horizon-testnet.stellar.org'),
  supabaseUrl: getEnvVar('SUPABASE_URL', ''),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', ''),
  
  // Feature Flags
  enableTestFeatures: getBoolEnvVar('ENABLE_TEST_FEATURES', true),
  enableDetailedLogs: getBoolEnvVar('ENABLE_DETAILED_LOGS', true),
  
  // Analytics
  analyticsEnabled: getBoolEnvVar('ANALYTICS_ENABLED', false),
  analyticsKey: getEnvVar('ANALYTICS_KEY', null),
  
  // App Configuration
  maxTransactionAmount: getNumEnvVar('MAX_TRANSACTION_AMOUNT', 1000),
  defaultCurrency: getEnvVar('DEFAULT_CURRENCY', 'USD'),
  apiTimeout: getNumEnvVar('API_TIMEOUT', 30000),
};

// Helper function to log configuration on app startup
export const logEnvironmentConfig = (): void => {
  if (config.enableDetailedLogs) {
    console.log('Environment Configuration:', {
      ...config,
      // Hide sensitive keys
      supabaseAnonKey: config.supabaseAnonKey ? '[HIDDEN]' : null,
      analyticsKey: config.analyticsKey ? '[HIDDEN]' : null,
    });
  }
};

// Validate critical configuration
export const validateEnvironmentConfig = (): string[] => {
  const errors: string[] = [];
  
  if (!config.supabaseUrl && process.env.NODE_ENV === 'production') {
    errors.push('Missing Supabase URL in production environment');
  }
  
  if (!config.supabaseAnonKey && process.env.NODE_ENV === 'production') {
    errors.push('Missing Supabase anonymous key in production environment');
  }
  
  return errors;
};
