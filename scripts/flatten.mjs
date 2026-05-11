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
    try {
      if (lstatSync(src).isDirectory()) {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        copyRecursiveSync(src, dest);
        rmSync(src, { recursive: true, force: true });
      } else {
        if (existsSync(dest)) rmSync(dest, { force: true });
        copyFileSync(src, dest);
        rmSync(src, { force: true });
      }
      console.log(`[flatten-public] Successfully moved ${item} -> public/${item}`);
    } catch (e) {
      console.warn(`[flatten-public] WARNING: Could not move ${item} due to file lock: ${e.message}`);
    }
  }

  // 3. Clean up the build folder
  console.log('[flatten-public] Cleaning up build folders...');
  rmSync(DIST, { recursive: true, force: true });

  // 4. Copy static source assets that are referenced by absolute URL in CSS
  //    (e.g. /assets/login-bg.svg used by all hero components)
  const sourceAssets = [
    { src: join('src', 'assets', 'auth', 'login-bg.svg'), dest: join(PUBLIC, 'assets', 'login-bg.svg') },
  ];
  for (const { src, dest } of sourceAssets) {
    if (existsSync(src)) {
      console.log(`[flatten-public] Copying static asset: ${src} -> ${dest}`);
      mkdirSync(join(PUBLIC, 'assets'), { recursive: true });
      copyFileSync(src, dest);
    } else {
      console.warn(`[flatten-public] WARNING: Missing static asset: ${src}`);
    }
  }

  console.log('[flatten-public] SUCCESS! Application is now in the /public folder for Vercel. ✅');
}

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

flatten().catch(err => {
  console.error('[flatten-public] FATAL ERROR:', err);
  process.exit(1);
});
