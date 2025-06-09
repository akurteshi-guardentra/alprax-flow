# Alprax Flow - Lovable Integration Guide

This guide explains how to integrate the Alprax Flow GitHub Pages deployment with the Lovable environment.

## What is Lovable?

[Lovable](https://lovable.dev) is the development environment where this project was initiated. It provides AI-assisted development and collaboration tools to streamline the development process.

## Lovable Project Information

- **Project URL**: https://lovable.dev/projects/68de21be-8dfb-45ac-88dd-2da960ee8f93
- **Project ID**: `68de21be-8dfb-45ac-88dd-2da960ee8f93`

## Synchronizing GitHub with Lovable

To maintain synchronization between GitHub and Lovable, follow these steps:

### 1. Pull Changes from GitHub to Lovable

After making changes in GitHub (outside of Lovable), you need to synchronize those changes with Lovable:

1. Open the project in Lovable: https://lovable.dev/projects/68de21be-8dfb-45ac-88dd-2da960ee8f93
2. Click on the "Source Control" icon in the sidebar
3. Click "Pull changes" to fetch the latest code from GitHub

### 2. Push Changes from Lovable to GitHub

When you make changes in Lovable, they are automatically committed to GitHub. However, if you need to force synchronization:

1. In Lovable, click on the "Source Control" icon in the sidebar
2. Verify your changes are committed
3. Click "Push" to ensure all changes are sent to GitHub

## Deployment Workflow with Lovable

### Recommended Workflow

1. **Development in Lovable**:
   - Make changes in Lovable
   - Test locally
   - Changes are automatically committed to GitHub

2. **GitHub Actions CI/CD**:
   - GitHub Actions automatically builds and tests your changes
   - If on the `main` branch, it will deploy to GitHub Pages

3. **Verify Deployment**:
   - Check the deployed site at https://atdheekurteshi.github.io/alprax-flow/
   - Ensure all features work as expected

### Using the Lovable Tagger

The project includes the `lovable-tagger` package for component tagging in development:

```typescript
// This is automatically configured in vite.config.ts
import { componentTagger } from "lovable-tagger";

// Used in development mode
componentTagger()
```

## Troubleshooting

### Issues with Lovable Integration

If changes aren't appearing in Lovable after pushing from GitHub:

1. Check if your branch is up to date with remote
2. Try refreshing the Lovable project page
3. Make a small change in Lovable to trigger synchronization

### Deployment Issues

If the site isn't updating on GitHub Pages after pushing:

1. Check GitHub Actions for any build errors
2. Verify that your changes were merged to the `main` branch
3. Try triggering a manual deployment using the workflow dispatch

## Best Practices

1. **Pull Before Making Changes**: Always pull the latest changes from GitHub before starting work in Lovable.

2. **Use Clear Commit Messages**: Even though Lovable handles commits, use descriptive messages when making manual commits.

3. **Keep Dependencies Synchronized**: If you add dependencies in Lovable, make sure they're also installed in your local environment and vice versa.

4. **Test Locally Before Deployment**: Always test your changes locally before merging to `main`.

## Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [GitHub Pages Guide](./GITHUB-PAGES-GUIDE.md)
- [CI/CD Guide](./CI-CD-GUIDE.md)
- [PR Instructions](./PR-INSTRUCTIONS.md)
