
/**
 * Environment variables type definition
 * This extends the Vite's ImportMeta interface to provide typing for our custom env variables
 */

interface ImportMetaEnv {
  // API & Services
  readonly VITE_STELLAR_NETWORK?: string;
  readonly VITE_HORIZON_URL?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Feature Flags
  readonly VITE_ENABLE_TEST_FEATURES?: string;
  readonly VITE_ENABLE_DETAILED_LOGS?: string;
  
  // Analytics
  readonly VITE_ANALYTICS_ENABLED?: string;
  readonly VITE_ANALYTICS_KEY?: string;
  
  // Deployment
  readonly VITE_APP_VERSION?: string;
  readonly VITE_BUILD_TIME?: string;
  readonly VITE_DEPLOY_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_STAGING_API_URL?: string;
  readonly VITE_DEV_API_URL?: string;
  
  // Vercel
  readonly VITE_VERCEL_ENV?: string;
  readonly VITE_VERCEL_URL?: string;
  readonly VITE_VERCEL_REGION?: string;
  readonly VITE_VERCEL_GIT_COMMIT_SHA?: string;
  readonly VITE_VERCEL_GIT_COMMIT_MESSAGE?: string;
  readonly VITE_VERCEL_GIT_COMMIT_REF?: string;
  
  // Netlify
  readonly VITE_NETLIFY?: string;
  readonly VITE_NETLIFY_URL?: string;
  readonly VITE_NETLIFY_BRANCH?: string;
  readonly VITE_NETLIFY_CONTEXT?: string;
  readonly VITE_NETLIFY_LOCAL_DEV?: string;
  
  // CI/CD
  readonly VITE_CI?: string;
  readonly VITE_GITHUB_ACTIONS?: string;
  readonly VITE_GITLAB_CI?: string;
  
  // App Configuration
  readonly VITE_MAX_TRANSACTION_AMOUNT?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_API_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
