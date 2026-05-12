import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const DEPLOY_DIR = 'deploy-me';

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log('[deploy] Preparing clean deployment directory...');

  // 1. Clean deploy-me
  if (existsSync(DEPLOY_DIR)) {
    rmSync(DEPLOY_DIR, { recursive: true, force: true });
  }
  mkdirSync(DEPLOY_DIR, { recursive: true });

  if (!existsSync(DIST_CLIENT)) {
    console.error('[deploy] ERROR: dist/client not found. Did the build fail?');
    process.exit(1);
  }

  // 2. Move everything from dist/client to deploy-me
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(DEPLOY_DIR, item);
    
    try {
      renameSync(src, dest);
    } catch (e) {
      copyRecursiveSync(src, dest);
    }
  }

  console.log('[deploy] SUCCESS! Deployment directory "deploy-me" is ready.');
}

prepare().catch(err => {
  console.error('[deploy] FATAL ERROR:', err);
  process.exit(1);
});
