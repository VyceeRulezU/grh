import { readdirSync, renameSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync } from 'fs';
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
    console.warn(`[flatten-root] WARNING: ${CLIENT_DIST} not found. Build output folder missing.`);
    // If dist exists but not dist/client, check if it's already flattened.
    if (!existsSync(DIST)) {
      console.error('[flatten-root] FATAL: No build artifacts found.');
      process.exit(1);
    }
  }

  const sourceDir = existsSync(CLIENT_DIST) ? CLIENT_DIST : DIST;
  console.log(`[flatten-root] Source directory: ${sourceDir}`);

  // 1. Clear out the root components that we are about to replace
  // We do NOT clear everything (.) because we need to preserve node_modules and src.
  
  const items = readdirSync(sourceDir);

  for (const item of items) {
    const src = join(sourceDir, item);
    const dest = join(ROOT, item);

    // Skip if the item is in our protected list
    if (PROTECTED.includes(item)) {
      console.log(`[flatten-root] Skipping protected path: ${item}`);
      continue;
    }

    // Handle overwriting
    if (existsSync(dest)) {
      console.log(`[flatten-root] Overwriting ${dest}...`);
      rmSync(dest, { recursive: true, force: true });
    }

    console.log(`[flatten-root] Moving ${src} -> ${dest}`);
    renameSync(src, dest);
  }

  // 2. Add a special diagnostic marker to verify folder access
  const markerPath = join(ROOT, 'VERCEL_SERVES_ROOT.txt');
  import('fs').then(fs => fs.writeFileSync(markerPath, `VERCEL SUCCESS - ${new Date().toISOString()}`));

  console.log('[flatten-root] SUCCESS! Build artifacts flattened to root. ✅');
}

flatten().catch(err => {
  console.error('[flatten-root] FATAL ERROR:', err);
  process.exit(1);
});
