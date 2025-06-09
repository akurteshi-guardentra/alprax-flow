#!/usr/bin/env pwsh
# Script for deploying alprax-flow to GitHub Pages

Write-Host "🚀 Starting deployment to GitHub..." -ForegroundColor Cyan

# 1. Build the project
Write-Host "👷‍♀️ Building project..." -ForegroundColor Yellow
npm run build

# 2. Check if build was successful
if (-not (Test-Path -Path "dist")) {
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}

# 3. Deploy to GitHub Pages
Write-Host "📦 Deploying to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Visit your site at: https://atdheekurteshi.github.io/alprax-flow/" -ForegroundColor Cyan
