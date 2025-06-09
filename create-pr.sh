#!/bin/bash
# GitHub Pull Request Creation Script for alprax-flow

# Set error handling
set -e  # Exit immediately if a command exits with a non-zero status

echo "========================================================="
echo "  🚀 GitHub Pull Request Creator for alprax-flow"
echo "========================================================="
echo ""

# Define repository variables
REPO_OWNER="atdheekurteshi"
REPO_NAME="alprax-flow"
BASE_BRANCH="main"
HEAD_BRANCH="deployment-updates"
PR_URL="https://github.com/$REPO_OWNER/$REPO_NAME/compare/$BASE_BRANCH...$HEAD_BRANCH?quick_pull=1&title=Add%20GitHub%20Pages%20deployment%20configuration%20with%20CI/CD%20integration"

# PR Description to copy
PR_DESCRIPTION="This PR adds:
- GitHub Pages deployment configuration with proper base paths
- Enhanced CI/CD setup with GitHub Actions workflows for automated deployment
- gh-pages package for easy deployment from local environments
- Comprehensive deployment scripts (PowerShell and Batch) for different workflows
- SPA routing support with 404.html for GitHub Pages
- Extensive documentation for deployment, PR processes, and Lovable integration
- Configuration for cross-environment compatibility (Lovable, local, GitHub Pages)
- Environment-aware settings that adapt to different deployment contexts

After merging, the site will be automatically deployed to GitHub Pages and will be available at:
https://atdheekurteshi.github.io/alprax-flow/

I've also included a deployment checklist and guides for the team to follow for future deployments."

# Make sure we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "$HEAD_BRANCH" ]; then
    echo "🔄 Switching to $HEAD_BRANCH branch..."
    git checkout "$HEAD_BRANCH"
else
    echo "✅ Already on $HEAD_BRANCH branch."
fi

# Make sure all changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "🔄 Committing any pending changes..."
    git add .
    git commit -m "Finalize GitHub Pages deployment configuration and documentation"
    echo "✅ Changes committed."
else
    echo "✅ No uncommitted changes."
fi

# Check for uncommitted files using git status
echo "🔍 Checking for any uncommitted files..."
UNCOMMITTED_FILES=$(git status -s)

if [ -n "$UNCOMMITTED_FILES" ]; then
    echo "Found uncommitted files:"
    echo "$UNCOMMITTED_FILES"
    
    echo ""
    echo "Would you like to commit these changes? (y/n)"
    read -r commit_response
    
    if [[ "$commit_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Enter a commit message (default: 'Finalize GitHub Pages deployment setup'):"
        read -r commit_msg
        
        # Use default message if none provided
        if [ -z "$commit_msg" ]; then
            commit_msg="Finalize GitHub Pages deployment setup"
        fi
        
        # Add and commit changes
        echo "🔄 Adding all changes..."
        git add .
        
        echo "🔄 Committing with message: $commit_msg"
        git commit -m "$commit_msg"
        
        echo "✅ Changes committed."
    else
        echo "⚠️ Continuing without committing changes."
    fi
else
    echo "✅ No uncommitted files."
fi

# Deploy to GitHub Pages
echo ""
echo "Would you like to deploy to GitHub Pages now? (y/n)"
read -r deploy_response

if [[ "$deploy_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🔄 Deploying to GitHub Pages..."
    npm run deploy
    echo "✅ Deployment complete!"
else
    echo "⏩ Skipping deployment."
fi

# Push the branch to origin
echo ""
echo "🔄 Pushing $HEAD_BRANCH to origin..."
git push origin "$HEAD_BRANCH"
echo "✅ Branch pushed to origin."

# Display PR creation instructions
echo ""
echo "========================================================="
echo "  📝 PULL REQUEST CREATION INSTRUCTIONS"
echo "========================================================="
echo ""
echo "STEP 1: Open this URL in your browser:"
echo "-----------------------------------------"
echo "$PR_URL"
echo ""
echo "STEP 2: Copy the description below and paste it into the PR description field:"
echo "-----------------------------------------"
echo "$PR_DESCRIPTION"
echo ""
echo "STEP 3: Click 'Create pull request'"
echo "-----------------------------------------"
echo ""
echo "STEP 4: After PR is created, click 'Merge pull request' and 'Confirm merge'"
echo "-----------------------------------------"
echo ""
echo "STEP 5: After merging, wait for GitHub Actions to deploy (~2-5 minutes)"
echo "-----------------------------------------"
echo "The site will be available at: https://atdheekurteshi.github.io/alprax-flow/"
echo ""
echo "========================================================="

# Try to open the URL in the browser
echo "Would you like to open the PR URL in your browser now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🔄 Opening URL in browser..."
    # Try different browser opening commands based on OS
    if command -v explorer.exe &> /dev/null; then
        # For Windows
        explorer.exe "$PR_URL"
    elif command -v open &> /dev/null; then
        # For macOS
        open "$PR_URL"
    elif command -v xdg-open &> /dev/null; then
        # For Linux
        xdg-open "$PR_URL"
    else
        echo "⚠️  Could not automatically open the browser. Please copy and paste the URL manually."
    fi
fi

echo ""
echo "Would you like to check the deployment status? (y/n)"
read -r status_response
if [[ "$status_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Check GitHub Pages status
    echo "🔄 Opening GitHub repository actions page..."
    ACTIONS_URL="https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    
    if command -v explorer.exe &> /dev/null; then
        # For Windows
        explorer.exe "$ACTIONS_URL"
    elif command -v open &> /dev/null; then
        # For macOS
        open "$ACTIONS_URL"
    elif command -v xdg-open &> /dev/null; then
        # For Linux
        xdg-open "$ACTIONS_URL"
    else
        echo "⚠️ Could not automatically open the browser. Please visit: $ACTIONS_URL"
    fi
fi

echo ""
echo "👋 Pull request creation process complete!"
echo "Don't forget to merge the PR once it's created."
echo "After merging, your site will be available at: https://atdheekurteshi.github.io/alprax-flow/"
