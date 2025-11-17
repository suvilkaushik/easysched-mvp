import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  output: 'export',
  // Base path for GitHub Pages (repository name)
  // The GitHub Actions workflow will automatically inject this, but we set it here for local builds
  basePath: process.env.NODE_ENV === 'production' ? '/easysched-mvp' : '',
  trailingSlash: true, // Required for GitHub Pages compatibility - ensures proper routing
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
