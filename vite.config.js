import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import vike from 'vike/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vike(),
    // Dev-only bundle analyzer: run `npm run build` to open stats.html
    process.env.ANALYZE === 'true' && visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })
  ].filter(Boolean),
  // Use '/' for Vercel/Production and '/grh/' only if explicitly building for GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' ? '/grh/' : '/',
  build: {
    sourcemap: false
  }
})
