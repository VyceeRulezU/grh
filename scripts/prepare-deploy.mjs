import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const DIST_ROOT = 'dist'; // We will move everything to the root of dist

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log('[deploy] Flattening dist/client into dist/ for Vercel...');

  if (!existsSync(DIST_CLIENT)) {
    console.error('[deploy] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Move everything from dist/client to dist/ (root)
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(DIST_ROOT, item);
    
    // Skip moving to self
    if (src === dest) continue;

    try {
      if (existsSync(dest) && lstatSync(dest).isDirectory()) {
         // Merge if directory exists (unlikely in fresh build but safe)
         copyRecursiveSync(src, dest);
         rmSync(src, { recursive: true, force: true });
      } else {
         renameSync(src, dest);
      }
    } catch (e) {
      copyRecursiveSync(src, dest);
      rmSync(src, { recursive: true, force: true });
    }
  }

  // 2. Add diagnostic file to the root of dist
  const diagPath = join(DIST_ROOT, 'deploy-diagnostic.txt');
  copyFileSync(join('deploy-me', 'deploy-diagnostic.txt'), diagPath);

  console.log('[deploy] SUCCESS! dist folder is flattened and ready.');
}

prepare().catch(err => {
  console.error('[deploy] FATAL ERROR:', err);
  process.exit(1);
});
