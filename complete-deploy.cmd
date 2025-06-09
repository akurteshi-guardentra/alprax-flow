@echo off
REM Complete Deployment Script for GitHub Pages

echo ========================================================
echo Alprax Flow - Complete GitHub Pages Deployment Process
echo ========================================================
echo.

echo Step 1: Adding all files to git...
call git add .

echo Step 2: Committing changes...
call git commit -m "Finalize GitHub Pages deployment with CI/CD integration and documentation"

echo Step 3: Pushing to deployment-updates branch...
call git push origin deployment-updates

echo Step 4: Building and deploying to GitHub Pages...
call npm run deploy

echo ========================================================
echo Deployment Complete!
echo.
echo Your site should now be available at:
echo https://atdheekurteshi.github.io/alprax-flow/
echo.
echo To create the pull request, go to:
echo https://github.com/atdheekurteshi/alprax-flow/pull/new/deployment-updates
echo.
echo Set the base branch to 'main' and the compare branch to 'deployment-updates'
echo.
echo For PR title use: "Add GitHub Pages deployment configuration with CI/CD integration"
echo.
echo See CREATE-PR.md for the full PR description.
echo ========================================================

pause
