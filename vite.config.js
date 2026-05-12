import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from "@sentry/vite-plugin";
import vike from 'vike/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: "node_modules/.vite-new",
  plugins: [
    react(),
    vike(),
    // Sentry SDK configuration – only active when SENTRY_AUTH_TOKEN is set (CI/Vercel)
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "gov-resource-hub",
      project: "javascript-react",
    }),
    // Dev-only bundle analyzer: run `npm run build` to open stats.html
    process.env.ANALYZE === 'true' && visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })
  ].filter(Boolean),
  // Use '/' for Vercel/Production and '/grh/' only if explicitly building for GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' ? '/grh/' : '/',
  build: {
    emptyOutDir: false, // prebuild script handles dist cleanup to avoid EPERM on Windows
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // PDF libraries – only needed on Library/Research pages
          if (id.includes('pdfjs-dist') || id.includes('@react-pdf-viewer')) {
            return 'vendor-pdf';
          }
          // AWS SDK – only needed for file uploads (admin)
          if (id.includes('@aws-sdk')) {
            return 'vendor-aws';
          }
          // Charts – only needed on Analyse page
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'vendor-charts';
          }
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('gsap')) {
            return 'vendor-gsap';
          }
          // Supabase auth/data layer
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // React core + ecosystem – always needed, cache aggressively
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-error-boundary') ||
            id.includes('node_modules/react-helmet-async') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('@tanstack/react-query')
          ) {
            return 'vendor-react';
          }
        }
      }
    }
  },
  test: {
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
  }
})
