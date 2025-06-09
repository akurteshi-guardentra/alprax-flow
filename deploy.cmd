@echo off
echo ===================================
echo Alprax Flow GitHub Deployment Tool
echo ===================================
echo.

echo Building application...
call npm run build
if errorlevel 1 (
  echo Error: Build failed
  pause
  exit /b 1
)

echo.
echo Deploying to GitHub Pages...
call npm run deploy
if errorlevel 1 (
  echo Error: Deployment failed
  pause
  exit /b 1
)

echo.
echo Deployment successful!
echo Visit your site at: https://atdheekurteshi.github.io/alprax-flow/
echo.

pause
