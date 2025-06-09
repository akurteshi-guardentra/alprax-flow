# GitHub Pages Deployment Checklist

Use this checklist to ensure a successful deployment to GitHub Pages.

## Pre-Deployment Checks

- [ ] All code changes are committed and pushed to a branch
- [ ] Run `npm run check` to verify linting and build success
- [ ] Test the application locally using `npm run preview` 
- [ ] Ensure 404.html is present in the public directory
- [ ] Confirm base path is set correctly in vite.config.ts: `/alprax-flow/`

## Deployment Options

### Option 1: Direct Deployment from Local Machine

- [ ] Run `.\deploy.cmd` (Windows Command Prompt) or `.\deploy.ps1` (PowerShell)
- [ ] Verify successful deployment by checking the console output
- [ ] Visit the deployed site: https://atdheekurteshi.github.io/alprax-flow/

### Option 2: Using GitHub Actions

- [ ] Merge your changes to the `main` branch via a pull request
- [ ] Wait for GitHub Actions to complete (check Actions tab in GitHub)
- [ ] Verify the deployment was successful
- [ ] Visit the deployed site: https://atdheekurteshi.github.io/alprax-flow/

### Option 3: Manual Deployment

- [ ] Run `npm run build:github-pages`
- [ ] Run `npx gh-pages -d dist`
- [ ] Visit the deployed site: https://atdheekurteshi.github.io/alprax-flow/

## Post-Deployment Verification

- [ ] Check that the site loads correctly at https://atdheekurteshi.github.io/alprax-flow/
- [ ] Test navigation between pages (ensure the SPA routing works)
- [ ] Test core functionality (transactions, forms, etc.)
- [ ] Check mobile responsiveness
- [ ] Verify that assets (images, fonts) load correctly

## Troubleshooting Common Issues

### 404 Errors

If you see 404 errors after deployment:

1. Check that the 404.html file was deployed correctly
2. Ensure base path is set to `/alprax-flow/` in vite.config.ts
3. Try navigating directly to the homepage: https://atdheekurteshi.github.io/alprax-flow/

### Broken Links/Resources

If resources aren't loading:

1. Check if the paths are relative and using the correct base path
2. For absolute URLs, ensure they use `https://atdheekurteshi.github.io/alprax-flow/`
3. View the browser console for specific errors

### GitHub Pages Not Updating

1. Check if the gh-pages branch was updated (check timestamps)
2. Try clearing your browser cache
3. Check for GitHub Pages build errors in the repository settings

## Lovable Integration

After successful deployment:

- [ ] Pull changes to Lovable if needed
- [ ] Update team members about the deployment
- [ ] Document any issues encountered during deployment
