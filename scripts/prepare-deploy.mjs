import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const OUTPUT_DIR = 'build-output';

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log('[deploy] Creating build-output directory...');

  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!existsSync(DIST_CLIENT)) {
    console.error('[deploy] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Copy everything from dist/client to build-output
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(OUTPUT_DIR, item);
    copyRecursiveSync(src, dest);
  }

  // 2. ALSO copy the source assets from public/assets to build-output/assets
  // This ensures that logos/etc are definitely there.
  const sourceAssets = join('public', 'assets');
  if (existsSync(sourceAssets)) {
    console.log('[deploy] Merging source assets from public/assets...');
    copyRecursiveSync(sourceAssets, join(OUTPUT_DIR, 'assets'));
  }

  console.log('[deploy] SUCCESS! build-output is ready.');
}

prepare().catch(err => {
  console.error('[deploy] FATAL ERROR:', err);
  process.exit(1);
});
