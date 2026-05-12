import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

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
  console.log('[vercel-flatten] Starting robust flattening...');

  if (!existsSync(CLIENT)) {
    console.error('[vercel-flatten] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Move everything from dist/client to dist/ root
  const items = readdirSync(CLIENT);
  for (const item of items) {
    const src = join(CLIENT, item);
    const dest = join(DIST, item);
    
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    
    try {
      renameSync(src, dest);
      console.log(`[vercel-flatten] Moved ${item}`);
    } catch (e) {
      copyRecursiveSync(src, dest);
      rmSync(src, { recursive: true, force: true });
      console.log(`[vercel-flatten] Copied/Deleted ${item}`);
    }
  }

  // 2. Remove client and server folders
  if (existsSync(CLIENT)) rmSync(CLIENT, { recursive: true, force: true });
  if (existsSync(SERVER)) rmSync(SERVER, { recursive: true, force: true });

  console.log('[vercel-flatten] SUCCESS! dist folder is now ready.');
}

flatten().catch(err => {
  console.error('[vercel-flatten] FATAL ERROR:', err);
  process.exit(1);
});
