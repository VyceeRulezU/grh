import { readdirSync, renameSync, rmSync, existsSync, lstatSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const CLIENT_DIST = join(DIST, 'client');
const SERVER_DIST = join(DIST, 'server');

async function flatten() {
  console.log('[flatten] Starting build output flattening...');

  if (!existsSync(CLIENT_DIST)) {
    console.error(`[flatten] ERROR: ${CLIENT_DIST} not found. Skipping.`);
    return;
  }

  // 1. Get all files and folders in dist/client
  const items = readdirSync(CLIENT_DIST);

  for (const item of items) {
    const src = join(CLIENT_DIST, item);
    const dest = join(DIST, item);

    // If destination already exists (from a previous build or server build), remove it
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
    }

    console.log(`[flatten] Moving ${src} -> ${dest}`);
    renameSync(src, dest);
  }

  // 2. Clean up empty/unnecessary directories
  console.log('[flatten] Cleaning up build artifacts...');
  if (existsSync(CLIENT_DIST)) rmSync(CLIENT_DIST, { recursive: true, force: true });
  if (existsSync(SERVER_DIST)) rmSync(SERVER_DIST, { recursive: true, force: true });

  console.log('[flatten] Build output flattened to /dist! ✅');
}

flatten().catch(err => {
  console.error('[flatten] FATAL ERROR:', err);
  process.exit(1);
});
