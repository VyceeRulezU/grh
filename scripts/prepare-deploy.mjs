import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

// This script prepares a dedicated folder for Vercel deployment.
// It combines the build output (dist/client) with necessary source static assets.

const DIST_CLIENT = join('dist', 'client');
const OUTPUT = 'vercel-output';
const PUBLIC = 'public';

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log(`[vercel-output] Preparing ${OUTPUT} folder...`);

  // 1. Clean and create output folder
  if (existsSync(OUTPUT)) rmSync(OUTPUT, { recursive: true, force: true });
  mkdirSync(OUTPUT, { recursive: true });

  // 2. Copy everything from public/ (source static assets)
  if (existsSync(PUBLIC)) {
    console.log(`[vercel-output] Copying source assets from ${PUBLIC}...`);
    copyRecursiveSync(PUBLIC, OUTPUT);
  }

  // 3. Copy build output from dist/client (pre-rendered HTML and hashed JS/CSS)
  // This will overwrite any source assets with the same name (like favicon) if build produces them.
  if (existsSync(DIST_CLIENT)) {
    console.log(`[vercel-output] Merging build output from ${DIST_CLIENT}...`);
    copyRecursiveSync(DIST_CLIENT, OUTPUT);
  } else {
    console.error(`[vercel-output] ERROR: ${DIST_CLIENT} not found. Run build first.`);
    process.exit(1);
  }

  console.log(`[vercel-output] SUCCESS! Deployment folder ${OUTPUT} is ready. ✅`);
}

prepare().catch(err => {
  console.error('[vercel-output] FATAL ERROR:', err);
  process.exit(1);
});
