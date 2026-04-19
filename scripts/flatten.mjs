import { readdirSync, renameSync, rmSync, existsSync, lstatSync, mkdirSync } from 'fs';
import { join } from 'path';

// This script flattens the build output from dist/client into the root dist/ folder.
// It DOES NOT touch the project root, keeping your source code safe.

const DIST = 'dist';
const CLIENT_DIST = join(DIST, 'client');
const SERVER_DIST = join(DIST, 'server');
const TEMP_DIST = 'dist_temp';

async function flatten() {
  console.log('[flatten-sane] Starting clean build output flattening...');

  if (!existsSync(CLIENT_DIST)) {
    console.error(`[flatten-sane] ERROR: ${CLIENT_DIST} not found. Build output folder missing.`);
    process.exit(1);
  }

  // 1. Move CLIENT_DIST to a temporary location
  if (existsSync(TEMP_DIST)) rmSync(TEMP_DIST, { recursive: true, force: true });
  renameSync(CLIENT_DIST, TEMP_DIST);

  // 2. Wipe the original SERVER folders within DIST
  if (existsSync(SERVER_DIST)) rmSync(SERVER_DIST, { recursive: true, force: true });
  
  // 3. Move everything from TEMP_DIST into DIST (root level of build)
  const items = readdirSync(TEMP_DIST);
  for (const item of items) {
    const src = join(TEMP_DIST, item);
    const dest = join(DIST, item);
    
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    renameSync(src, dest);
  }

  // 4. Cleanup
  console.log('[flatten-sane] Final cleanup...');
  rmSync(TEMP_DIST, { recursive: true, force: true });
  
  // 5. Final Stability Marker
  const markerPath = join(DIST, 'VERCEL_IS_IN_DIST.txt');
  import('fs').then(fs => fs.writeFileSync(markerPath, `Vercel is now correctly serving from the dist folder. Time: ${new Date().toISOString()}`));

  console.log('[flatten-sane] SUCCESS! Build output is now neatly flattened in /dist ✅');
}

flatten().catch(err => {
  console.error('[flatten-sane] ERROR:', err);
  process.exit(1);
});
