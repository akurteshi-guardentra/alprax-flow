# CI/CD Guide for Alprax Flow

This guide explains how Continuous Integration and Continuous Deployment (CI/CD) is set up for the Alprax Flow project.

## Automation Overview

We use GitHub Actions to automate the testing, building, and deployment of the Alprax Flow application to GitHub Pages.

### Workflow Steps

The automation workflow consists of the following stages:

1. **Test**: Checks the code quality and ensures there are no errors.
2. **Build**: Compiles the application and prepares it for deployment.
3. **Deploy**: Publishes the built application to GitHub Pages.

## Automated Trigger Points

The CI/CD workflow runs automatically under the following circumstances:

- **Push to main branch**: Whenever code is pushed directly to the main branch.
- **Pull request to main branch**: Tests and builds (but doesn't deploy) when a PR is created or updated.
- **Manual trigger**: Administrators can manually trigger a workflow run from the GitHub Actions tab.

## Branch Strategy

We follow this branch strategy for deployments:

1. **Feature branches** (`feature/*`): For new features and changes
2. **Deployment updates branch** (`deployment-updates`): For deployment configuration changes
3. **Main branch** (`main`): The production-ready code
4. **gh-pages branch** (`gh-pages`): The deployed site (managed automatically)

```
feature/* ──┐
             └─> deployment-updates ──> main ───> gh-pages
```

## Manual vs Automated Deployment

### Automated Deployment (GitHub Actions)

Pros:
- Happens automatically when code is merged to main
- Consistent build environment
- No need to run local build commands

Cons:
- Less control over exact timing
- Troubleshooting requires checking GitHub Actions logs

### Manual Deployment (Scripts)

We provide two scripts for manual deployment:

1. **Windows Command Prompt**: `deploy.cmd`
2. **PowerShell**: `deploy.ps1`

To deploy manually:
```bash
# Using npm
npm run deploy

# OR using the provided scripts
.\deploy.cmd    # Windows Command Prompt
.\deploy.ps1    # PowerShell
```

## Checking Deployment Status

1. Visit the **Actions** tab in the GitHub repository
2. Look for the most recent "Deploy to GitHub Pages" workflow run
3. Check if it completed successfully (green checkmark) or failed (red X)

## Troubleshooting

### If the automated deployment fails:

1. Check the GitHub Actions logs for error messages
2. Fix the issues in your local environment
3. Push the fixes to main or create a new PR
4. Alternatively, use manual deployment as a backup

### If you need to force a deployment:

1. Go to the Actions tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow" dropdown
4. Select the branch to deploy from
5. Click the green "Run workflow" button

## Integration with "Lovable"

After successful deployment to GitHub Pages, you can pull the changes to your "lovable" environment:

1. Ensure all changes are merged to `main` and deployed successfully
2. Verify the site works correctly on GitHub Pages
3. Pull the latest changes from `main` to your "lovable" environment

## Monitoring and Notifications

Currently, deployment status is visible in:
- GitHub Actions dashboard
- Commit status checks
- Workflow logs

## Future Improvements

Potential CI/CD enhancements:
1. Add automated testing before deployment
2. Set up preview environments for PRs
3. Add Slack/Discord notifications for deployment status
4. Implement progressive rollouts with canary deployments
