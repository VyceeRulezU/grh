import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// This script prepares the official Vercel Build Output API structure.
// This is the most robust way to deploy Vike to Vercel and avoids all 404 issues.

const DIST_CLIENT = join('dist', 'client');
const VERCEL_OUT = join('.vercel', 'output');
const VERCEL_STATIC = join(VERCEL_OUT, 'static');

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function build() {
  console.log('[vercel-build] Preparing Vercel Build Output API structure...');

  if (!existsSync(DIST_CLIENT)) {
    console.error('[vercel-build] ERROR: dist/client not found. Make sure "vite build" ran successfully.');
    process.exit(1);
  }

  // 1. Clean and create .vercel/output/static
  if (existsSync(VERCEL_OUT)) rmSync(VERCEL_OUT, { recursive: true, force: true });
  mkdirSync(VERCEL_STATIC, { recursive: true });

  // 2. Copy build output to static
  console.log('[vercel-build] Copying build output to .vercel/output/static...');
  copyRecursiveSync(DIST_CLIENT, VERCEL_STATIC);

  // 3. Create config.json for routing
  console.log('[vercel-build] Creating .vercel/output/config.json...');
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };
  writeFileSync(join(VERCEL_OUT, 'config.json'), JSON.stringify(config, null, 2));

  console.log('[vercel-build] SUCCESS! .vercel/output is ready for deployment. ✅');
}

build().catch(err => {
  console.error('[vercel-build] FATAL ERROR:', err);
  process.exit(1);
});
