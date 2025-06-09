# Alprax Flow Deployment Guide

## Automated Deployment
The project is configured for automatic deployment to GitHub Pages whenever you push to the main branch.

## Manual Deployment Options

### Option 1: Using the Deploy Script
Run the PowerShell deploy script:
```
./deploy.ps1
```

### Option 2: Manual Step-by-Step Deployment

1. **Build the project:**
```
npm run build
```

2. **Deploy to GitHub Pages:**
```
npm run deploy
```

### Option 3: Advanced Git Workflow (For Resolving Conflicts)

1. **Stash your current changes (if needed):**
```
git stash save "My local changes"
```

2. **Pull the latest changes from remote:**
```
git pull origin main --rebase
```

3. **Apply your stashed changes:**
```
git stash pop
```

4. **Resolve any conflicts, then add changed files:**
```
git add .
```

5. **Commit the changes:**
```
git commit -m "Fix conflicts and update with latest changes"
```

6. **Push to GitHub:**
```
git push origin main
```

## Troubleshooting

### If you encounter conflicts:

1. **Option A: Create a new branch with your changes:**
```
git checkout -b my-updated-version
git add .
git commit -m "My version with fixes"
git push origin my-updated-version
```
Then create a Pull Request on GitHub.

2. **Option B: Force push (use with caution, only if you know what you're doing):**
```
git push origin main --force
```

### If you get stuck in a rebase:

1. **To abort the rebase:**
```
git rebase --abort
```

2. **To continue after resolving conflicts:**
```
git add .
git rebase --continue
```

## Important Notes
- Always build and test locally before deploying
- Make sure all necessary files are committed before deployment
- The site will be available at: https://atdheekurteshi.github.io/alprax-flow/
