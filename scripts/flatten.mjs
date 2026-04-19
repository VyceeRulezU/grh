import { readdirSync, renameSync, rmSync, existsSync, lstatSync, mkdirSync } from 'fs';
import { join } from 'path';

// This script moves the build output from dist/client to the project root (.)
// for maximum zero-configuration compatibility on Vercel.

const ROOT = '.';
const DIST = 'dist';
const CLIENT_DIST = join(DIST, 'client');
const PROTECTED = ['src', 'node_modules', 'scripts', 'public', '.git', '.github', '.vercel', 'pages', 'assets-src'];

async function flatten() {
  console.log('[flatten-root] Starting authoritative root deployment move...');

  if (!existsSync(CLIENT_DIST)) {
    console.warn(`[flatten-root] WARNING: ${CLIENT_DIST} not found. Checking if files are already flattened in ${DIST}...`);
    // If dist exists but not dist/client, maybe it's already flattened.
    if (!existsSync(DIST)) {
      console.error('[flatten-root] FATAL: Build output folder missing.');
      process.exit(1);
    }
  }

  const sourceDir = existsSync(CLIENT_DIST) ? CLIENT_DIST : DIST;
  console.log(`[flatten-root] Source directory identified: ${sourceDir}`);

  // 1. Get all files and folders in the build output
  const items = readdirSync(sourceDir);

  for (const item of items) {
    if (item === 'index.html' || item === 'assets' || item === 'robots.txt' || item === 'sitemap.xml' || lstatSync(join(sourceDir, item)).isDirectory()) {
      const src = join(sourceDir, item);
      const dest = join(ROOT, item);

      // Skip if the item is in our protected list (like 'scripts' or 'src')
      if (PROTECTED.includes(item)) {
        console.log(`[flatten-root] Skipping protected item: ${item}`);
        continue;
      }

      // If destination exists, remove it first (especially folders like 'assets')
      if (existsSync(dest)) {
        console.log(`[flatten-root] Overwriting existing item: ${dest}`);
        rmSync(dest, { recursive: true, force: true });
      }

      console.log(`[flatten-root] Moving ${src} -> ${dest}`);
      renameSync(src, dest);
    }
  }

  // 2. Clean up build artifacts
  console.log('[flatten-root] Cleaning up build folders...');
  if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });

  console.log('[flatten-root] SUCCESS! Application is now available at the project root for Vercel. ✅');
}

flatten().catch(err => {
  console.error('[flatten-root] ERROR:', err);
  process.exit(1);
});
