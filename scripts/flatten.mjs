import { readdirSync, renameSync, rmSync, existsSync, lstatSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const CLIENT_DIST = join(DIST, 'client');
const SERVER_DIST = join(DIST, 'server');
const TEMP_DIST = 'dist_temp';

async function flatten() {
  console.log('[flatten] Starting absolute zero-config flattening...');

  if (!existsSync(CLIENT_DIST)) {
    console.error(`[flatten] ERROR: ${CLIENT_DIST} not found. Build likely failed.`);
    process.exit(1);
    return;
  }

  // 1. Move CLIENT_DIST to a temporary location to clear the way
  console.log(`[flatten] Moving ${CLIENT_DIST} to ${TEMP_DIST}...`);
  if (existsSync(TEMP_DIST)) rmSync(TEMP_DIST, { recursive: true, force: true });
  renameSync(CLIENT_DIST, TEMP_DIST);

  // 2. Wipe the original DIST folder completely
  console.log(`[flatten] Wiping original ${DIST} folder...`);
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST);

  // 3. Move all contents from TEMP_DIST into DIST (root level)
  console.log(`[flatten] Exporting all files to ${DIST} root...`);
  const items = readdirSync(TEMP_DIST);
  for (const item of items) {
    const src = join(TEMP_DIST, item);
    const dest = join(DIST, item);
    renameSync(src, dest);
  }

  // 4. Cleanup
  console.log('[flatten] Final cleanup...');
  rmSync(TEMP_DIST, { recursive: true, force: true });
  if (existsSync(SERVER_DIST)) rmSync(SERVER_DIST, { recursive: true, force: true });

  // 5. Diagnostic Marker
  console.log('[flatten] Creating diagnostic marker...');
  const markerPath = join(DIST, 'VERCEL_IS_SERVING_DIST.txt');
  readdirSync(DIST); // Ensure DIST is accessible
  const markerContent = `I AM HERE - Time: ${new Date().toISOString()} - Build Successful`;
  import('fs').then(fs => fs.writeFileSync(markerPath, markerContent));

  console.log('[flatten] DONE! Build output is now 100% flat in /dist ✅');
}

flatten().catch(err => {
  console.error('[flatten] FATAL ERROR during flattening:', err);
  process.exit(1);
});
