import { readdirSync, rmSync, existsSync, lstatSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const PUBLIC = 'public';

// Files to preserve in public (source assets)
const PRESERVE = new Set(['assets', 'favicon.ico', 'icon.png', 'robots.txt', 'sitemap.xml', 'grh-learn.webp', 'deploy-diagnostic.txt', 'googlec5d1c9e372461d63.html', 'live-test.txt', 'test-resource.txt']);

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function flatten() {
  console.log('[flatten] Moving build output to public...');

  if (!existsSync(DIST_CLIENT)) {
    console.error('[flatten] ERROR: dist/client not found.');
    process.exit(1);
  }

  // 1. Move everything from dist/client to public/
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(PUBLIC, item);
    
    // If it's a directory and it exists in public, we need to merge or replace
    if (existsSync(dest) && lstatSync(dest).isDirectory()) {
        rmSync(dest, { recursive: true, force: true });
    }

    try {
      renameSync(src, dest);
    } catch (e) {
      copyRecursiveSync(src, dest);
      rmSync(src, { recursive: true, force: true });
    }
  }

  console.log('[flatten] SUCCESS! Public folder is ready for deployment.');
}

flatten().catch(err => {
  console.error('[flatten] FATAL ERROR:', err);
  process.exit(1);
});
