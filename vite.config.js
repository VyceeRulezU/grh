import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import vike from 'vike/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vike({
      prerender: true
    }),
    // Dev-only bundle analyzer: run `npm run build` to open stats.html
    visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })
  ],
  // Use '/' for Vercel (root) and '/grh/' for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? (process.env.VERCEL ? '/' : '/grh/') : '/',
})
