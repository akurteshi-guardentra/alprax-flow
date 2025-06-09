
/**
 * Deployment configuration
 * 
 * This module contains configuration for different deployment targets
 * and CI/CD pipelines.
 */

type DeploymentPlatform = 'vercel' | 'netlify' | 'github-pages' | 'custom';
type DeploymentEnvironment = 'development' | 'staging' | 'production';

interface DeploymentConfig {
  platform: DeploymentPlatform;
  environment: DeploymentEnvironment;
  version: string;
  buildTime: string;
  deployUrl: string;
  baseUrl: string;
  basePath: string;
  isGitHubPages: boolean;
}

// Detect deployment platform
const detectPlatform = (): DeploymentPlatform => {
  if (import.meta.env.VITE_GITHUB_PAGES === 'true' || 
      window.location.hostname.includes('github.io')) {
    return 'github-pages';
  } else if (import.meta.env.VITE_VERCEL_ENV) {
    return 'vercel';
  } else if (import.meta.env.VITE_NETLIFY) {
    return 'netlify';
  } else {
    return 'custom';
  }
};

// Detect deployment environment
const detectEnvironment = (): DeploymentEnvironment => {
  const envName = import.meta.env.MODE || 'development';
  
  if (envName === 'production') {
    return 'production';
  } else if (envName === 'preview' || envName === 'staging') {
    return 'staging';
  } else {
    return 'development';
  }
};

// Get deployment URL
const getDeployUrl = (): string => {
  const platform = detectPlatform();
  
  if (platform === 'vercel') {
    return import.meta.env.VITE_VERCEL_URL || '';
  } else if (platform === 'netlify') {
    return import.meta.env.VITE_NETLIFY_URL || '';
  } else {
    return import.meta.env.VITE_DEPLOY_URL || window.location.origin;
  }
};

// Get base URL for API calls
const getBaseUrl = (): string => {
  const environment = detectEnvironment();
  const deployUrl = getDeployUrl();
  
  if (environment === 'production') {
    return import.meta.env.VITE_API_URL || deployUrl;
  } else if (environment === 'staging') {
    return import.meta.env.VITE_STAGING_API_URL || deployUrl;
  } else {
    return import.meta.env.VITE_DEV_API_URL || 'http://localhost:8080';
  }
};

// Get base path for the application
const getBasePath = (): string => {
  const platform = detectPlatform();
  
  if (platform === 'github-pages') {
    return import.meta.env.VITE_GITHUB_PAGES_PATH || '/alprax-flow/';
  } else {
    return import.meta.env.VITE_BASE_PATH || '/';
  }
};

// Is GitHub Pages deployment?
const isGitHubPages = (): boolean => {
  return detectPlatform() === 'github-pages';
};

// Export deployment configuration
export const deploymentConfig: DeploymentConfig = {
  platform: detectPlatform(),
  environment: detectEnvironment(),
  version: import.meta.env.VITE_APP_VERSION || '0.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  deployUrl: getDeployUrl(),
  baseUrl: getBaseUrl(),
  basePath: getBasePath(),
  isGitHubPages: isGitHubPages()
};

// Netlify-specific configuration
export const netlifyConfig = {
  isNetlify: detectPlatform() === 'netlify',
  branch: import.meta.env.VITE_NETLIFY_BRANCH || 'local',
  deployContext: import.meta.env.VITE_NETLIFY_CONTEXT || 'dev',
  isLocalDev: import.meta.env.VITE_NETLIFY_LOCAL_DEV === 'true',
};

// Vercel-specific configuration
export const vercelConfig = {
  isVercel: detectPlatform() === 'vercel',
  env: import.meta.env.VITE_VERCEL_ENV || 'development',
  region: import.meta.env.VITE_VERCEL_REGION || 'local',
  url: import.meta.env.VITE_VERCEL_URL || '',
  git: {
    commitSha: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || '',
    commitMessage: import.meta.env.VITE_VERCEL_GIT_COMMIT_MESSAGE || '',
    branch: import.meta.env.VITE_VERCEL_GIT_COMMIT_REF || 'local',
  }
};

// Helper to check if running in CI/CD environment
export const isCI = !!import.meta.env.VITE_CI || 
  !!import.meta.env.VITE_GITHUB_ACTIONS || 
  !!import.meta.env.VITE_GITLAB_CI;

export const getDeploymentInfo = (): string => {
  return `Version: ${deploymentConfig.version} | Environment: ${deploymentConfig.environment} | Platform: ${deploymentConfig.platform}`;
};
