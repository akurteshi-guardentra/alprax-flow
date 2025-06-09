# PowerShell script to help create a GitHub pull request
# Provides links and instructions for creating and merging the PR

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CREATING GITHUB PULL REQUEST" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Direct one-click URL to create the PR with pre-filled title
$prUrl = "https://github.com/atdheekurteshi/alprax-flow/compare/main...deployment-updates?quick_pull=1&title=Add%20GitHub%20Pages%20deployment%20configuration%20with%20CI/CD%20integration"

# PR description text
$prDescription = @"
This PR adds:
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

I've also included a deployment checklist and guides for the team to follow for future deployments.
"@

Write-Host "STEP 1: VISIT THIS URL TO CREATE THE PR" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host $prUrl -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: COPY THIS DESCRIPTION" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
Write-Host $prDescription -ForegroundColor White
Write-Host ""

Write-Host "STEP 3: FINISH PR CREATION AND MERGE" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host "1. After pasting the description, click 'Create pull request'" -ForegroundColor White
Write-Host "2. Once the PR is created, click 'Merge pull request'" -ForegroundColor White
Write-Host "3. Click 'Confirm merge'" -ForegroundColor White
Write-Host ""

Write-Host "STEP 4: VERIFY DEPLOYMENT" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
Write-Host "1. After merging, wait for GitHub Actions to deploy (~2-5 minutes)" -ForegroundColor White
Write-Host "2. Your site will be available at: https://atdheekurteshi.github.io/alprax-flow/" -ForegroundColor White
Write-Host ""

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Would you like to open the PR URL in your browser now?" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
$response = Read-Host "(y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Start-Process $prUrl
    Write-Host "Browser opened! Follow the remaining steps to create and merge the PR." -ForegroundColor Green
} else {
    Write-Host "You can manually open the URL when you're ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
