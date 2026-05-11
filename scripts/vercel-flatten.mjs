import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

// This script flattens the build output from dist/client into the dist root.
// This is the most reliable structure for Vercel deployment when using Vike.

const DIST = 'dist';
const CLIENT = join(DIST, 'client');
const SERVER = join(DIST, 'server');

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function flatten() {
  console.log('[vercel-flatten] Flattening dist/client into dist/ ...');

  if (!existsSync(CLIENT)) {
    console.error('[vercel-flatten] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Move everything from dist/client up to dist/
  const items = readdirSync(CLIENT);
  for (const item of items) {
    const src = join(CLIENT, item);
    const dest = join(DIST, item);
    
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    
    try {
      renameSync(src, dest);
    } catch (e) {
      // Fallback for cross-device or locked files
      if (lstatSync(src).isDirectory()) {
        copyRecursiveSync(src, dest);
        rmSync(src, { recursive: true, force: true });
      } else {
        copyFileSync(src, dest);
        rmSync(src);
      }
    }
  }

  // 2. Clean up
  if (existsSync(CLIENT)) rmSync(CLIENT, { recursive: true, force: true });
  if (existsSync(SERVER)) rmSync(SERVER, { recursive: true, force: true });

  console.log('[vercel-flatten] SUCCESS! dist folder is now ready for Vercel. ✅');
}

flatten().catch(err => {
  console.error('[vercel-flatten] FATAL ERROR:', err);
  process.exit(1);
});
