import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import vike from 'vike/plugin'
import vercel from 'vite-plugin-vercel'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vike(),
    vercel(),
    // Dev-only bundle analyzer: run `npm run build` to open stats.html
    process.env.ANALYZE === 'true' && visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })
  ].filter(Boolean),
  vercel: {
    distContainsOnlyStatic: true
  },
  // Force base to '/' for Vercel to ensure all asset paths are absolute
  base: '/',
  build: {
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
  },
  ssr: {
    noExternal: ['react-helmet-async']
  }
})
