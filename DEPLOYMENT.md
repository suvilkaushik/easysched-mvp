# Deployment Guide - GitHub Pages

This guide explains how to deploy EasySched MVP to GitHub Pages.

## Prerequisites
1. A GitHub repository
2. GitHub Actions enabled (enabled by default)

## Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub: `https://github.com/suvilkaushik/easysched-mvp`
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"** (NOT "Deploy from a branch")
   - This is critical - if you select "Deploy from a branch", it will show the README instead of your app

2. **Automatic Deployment:**
   - The GitHub Actions workflow will automatically trigger on push to `main`
   - The workflow will:
     - Build the Next.js app
     - Export it as static files to `./out`
     - Deploy to GitHub Pages

3. **Access Your Site:**
   - Your site will be available at: `https://suvilkaushik.github.io/easysched-mvp/`
   - Note the `/easysched-mvp` path - this is required because your repository is not named `username.github.io`

## Manual Deployment

You can also manually trigger the deployment by:
- Going to **Actions** tab in GitHub
- Selecting **"Deploy Next.js site to Pages"** workflow
- Clicking **"Run workflow"**

## Troubleshooting

### GitHub Pages shows README instead of app
- **Most common issue:** Make sure **"Source"** in Pages settings is set to **"GitHub Actions"** (not "Deploy from a branch")
- Check that the GitHub Actions workflow completed successfully (go to Actions tab)
- Verify the workflow artifact was uploaded correctly
- Wait a few minutes after deployment - GitHub Pages can take 1-2 minutes to update

### 404 errors on GitHub Pages
- Verify `basePath` is set correctly in `next.config.ts` (should be `/easysched-mvp`)
- Ensure all internal links use the `basePath` prefix
- Check that `trailingSlash: true` is set in `next.config.ts`

### Build fails
- Check Node.js version (should be 20+)
- Verify all dependencies are installed
- Check GitHub Actions logs for specific error messages
- Ensure `.nojekyll` file exists in `public/` directory

### Assets not loading
- Verify `basePath` is configured correctly
- Check that images have `unoptimized: true` in `next.config.ts`
- Ensure static assets are in the `public/` directory

## Configuration Files

The following files are configured for GitHub Pages deployment:
- `.github/workflows/nextjs.yml` - GitHub Actions workflow
- `next.config.ts` - Next.js configuration with static export
- `public/.nojekyll` - Prevents Jekyll processing (required for Next.js)

## Notes

- **Static Export:** GitHub Pages deployment uses static export, which means:
  - No server-side rendering (SSR)
  - No API routes (unless using external services)
  - No incremental static regeneration (ISR)
  - All pages must be statically generated at build time

- **Repository Structure:** Your repository is named `easysched-mvp`, so your site will be served at:
  - `https://suvilkaushik.github.io/easysched-mvp/`
  - The `basePath` in `next.config.ts` must match this (`/easysched-mvp`)
