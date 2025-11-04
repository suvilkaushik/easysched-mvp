# Deployment Guide

This guide explains how to deploy EasySched MVP to GitHub Pages or Vercel.

## GitHub Pages Deployment

### Prerequisites
1. A GitHub repository
2. GitHub Actions enabled (enabled by default)

### Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Configure Base Path (if needed):**
   - If your repository is NOT named `username.github.io`, you need to set a base path
   - Open `next.config.ts`
   - Uncomment and update the `basePath` line:
     ```typescript
     basePath: '/your-repository-name',
     ```
   - Replace `your-repository-name` with your actual repository name

3. **Push to Main Branch:**
   - The GitHub Actions workflow will automatically trigger on push to `main`
   - The workflow will:
     - Build the Next.js app
     - Export it as static files
     - Deploy to GitHub Pages

4. **Access Your Site:**
   - If repository is `username.github.io`: `https://username.github.io`
   - Otherwise: `https://username.github.io/repository-name`

### Manual Deployment
You can also manually trigger the deployment by:
- Going to Actions tab in GitHub
- Selecting "Deploy to GitHub Pages" workflow
- Clicking "Run workflow"

## Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications as it supports all Next.js features including server-side rendering and API routes.

### Setup Steps

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository

2. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main`

4. **Update Configuration:**
   - If you want to use Vercel, remove static export from `next.config.ts`:
     ```typescript
     // Remove these lines:
     output: 'export',
     images: {
       unoptimized: true,
     },
     ```

## Troubleshooting

### GitHub Pages shows README instead of app
- Make sure GitHub Actions workflow completed successfully
- Check that "Source" in Pages settings is set to "GitHub Actions" (not "Deploy from a branch")
- Verify the workflow artifact was uploaded correctly

### 404 errors on GitHub Pages
- Check if you need to set `basePath` in `next.config.ts`
- Ensure all internal links use the `basePath` prefix

### Build fails
- Check Node.js version (should be 20+)
- Verify all dependencies are installed
- Check GitHub Actions logs for specific error messages

## Notes

- **Static Export Limitation:** GitHub Pages deployment uses static export, which means:
  - No server-side rendering (SSR)
  - No API routes (unless using external services)
  - No incremental static regeneration (ISR)

- **Vercel Advantage:** If you need server-side features, use Vercel instead, which supports:
  - Full SSR support
  - API routes
  - Edge functions
  - Automatic HTTPS
  - Custom domains

