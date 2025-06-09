/**
 * GitHub Pages specific configuration
 * This module contains settings specific to GitHub Pages deployments
 */

import { deploymentConfig } from "./deployment";

interface GitHubPagesConfig {
  enabled: boolean;
  basePath: string;
  repository: string;
  owner: string;
  projectName: string;
  branch: string;
  url: string;
  assetPrefix: string;
}

// Extract repository information from environment or defaults
const getRepositoryInfo = (): { owner: string, repo: string } => {
  const defaultOwner = 'atdheekurteshi';
  const defaultRepo = 'alprax-flow';
  
  // Try to get from environment variables
  const repoUrl = import.meta.env.VITE_GITHUB_REPOSITORY || 
                 `${defaultOwner}/${defaultRepo}`;
  
  // Parse owner and repo from the URL
  const [owner = defaultOwner, repo = defaultRepo] = repoUrl.split('/');
  
  return { owner, repo };
};

const { owner, repo } = getRepositoryInfo();

export const githubPagesConfig: GitHubPagesConfig = {
  enabled: deploymentConfig.isGitHubPages,
  basePath: deploymentConfig.basePath,
  repository: `${owner}/${repo}`,
  owner,
  projectName: repo,
  branch: 'gh-pages',
  url: `https://${owner}.github.io/${repo}/`,
  assetPrefix: `/${repo}/`
};

export const getSpaRedirectScript = (): string => {
  if (!githubPagesConfig.enabled) return '';
  
  return `
    // Single Page App Redirect Script for GitHub Pages
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(
          null, 
          null,
          l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location));
  `;
};

export const getRobotsTxtContent = (): string => {
  return `
User-agent: *
Allow: /
  `;
};

export default githubPagesConfig;
