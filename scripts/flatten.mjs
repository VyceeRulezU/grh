import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const PUBLIC = 'public';

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

function mergeRecursiveSync(src, dest) {
  if (!existsSync(dest)) {
    // If destination doesn't exist, we can just rename/move the whole thing
    try {
      renameSync(src, dest);
    } catch (e) {
      copyRecursiveSync(src, dest);
      rmSync(src, { recursive: true, force: true });
    }
    return;
  }

  if (lstatSync(src).isDirectory()) {
    readdirSync(src).forEach(child => mergeRecursiveSync(join(src, child), join(dest, child)));
  } else {
    // If it's a file, overwrite the existing one
    copyFileSync(src, dest);
  }
}

async function flatten() {
  console.log('[flatten] Merging build output into public...');

  if (!existsSync(DIST_CLIENT)) {
    console.error('[flatten] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Merge everything from dist/client to public/
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(PUBLIC, item);
    
    mergeRecursiveSync(src, dest);
  }

  console.log('[flatten] SUCCESS! Public folder is updated and ready for deployment.');
}

flatten().catch(err => {
  console.error('[flatten] FATAL ERROR:', err);
  process.exit(1);
});
