import { readdirSync, renameSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

// This script flattens the build output from dist/client into the root public/ folder.
// Vercel has a hard-coded priority for the "public" folder, making it the most robust
// way to ensure your site is served without 404s.

const ROOT = '.';
const DIST = 'dist';
const CLIENT_DIST = join(DIST, 'client');
const PUBLIC = join(ROOT, 'public');

async function flatten() {
  console.log('[flatten-public] Starting "Public Shadow Build" move...');

  if (!existsSync(CLIENT_DIST)) {
    console.error(`[flatten-public] ERROR: ${CLIENT_DIST} not found. Build output folder missing.`);
    process.exit(1);
  }

  // 1. Ensure the public folder exists
  if (!existsSync(PUBLIC)) {
    console.log('[flatten-public] Creating public folder...');
    mkdirSync(PUBLIC, { recursive: true });
  }

  // 2. Identify all items in the build output
  const items = readdirSync(CLIENT_DIST);

  for (const item of items) {
    const src = join(CLIENT_DIST, item);
    const dest = join(PUBLIC, item);

    // If it's a folder (like 'assets' or a pre-rendered route like '/about'), move it
    if (lstatSync(src).isDirectory()) {
      if (existsSync(dest)) {
        console.log(`[flatten-public] Overwriting directory: ${dest}`);
        rmSync(dest, { recursive: true, force: true });
      }
      console.log(`[flatten-public] Moving directory ${item} -> public/${item}`);
      renameSync(src, dest);
    } else {
      // It's a file (like index.html)
      console.log(`[flatten-public] Moving file ${item} -> public/${item}`);
      // On Windows, renameSync can fail if the destination file is 'busy', so we use a safe move
      if (existsSync(dest)) rmSync(dest, { force: true });
      renameSync(src, dest);
    }
  }

  // 3. Clean up the build folder
  console.log('[flatten-public] Cleaning up build folders...');
  rmSync(DIST, { recursive: true, force: true });

  console.log('[flatten-public] SUCCESS! Application is now in the /public folder for Vercel. ✅');
}

flatten().catch(err => {
  console.error('[flatten-public] FATAL ERROR:', err);
  process.exit(1);
});
