import { readdirSync, existsSync, lstatSync, mkdirSync, copyFileSync, rmSync } from 'fs';
import { join } from 'path';

const DIST_CLIENT = join('dist', 'client');
const PUBLIC_DIR = 'public';

// List of files that are SOURCE assets and should NOT be deleted or overwritten if they exist in dist/client
const SOURCE_ASSETS = ['assets', 'favicon.ico', 'icon.png', 'robots.txt', 'sitemap.xml', 'grh-learn.webp'];

function copyRecursiveSync(src, dest) {
  if (lstatSync(src).isDirectory()) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(child => copyRecursiveSync(join(src, child), join(dest, child)));
  } else {
    copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log('[deploy] Merging build artifacts into public/ directory...');

  if (!existsSync(DIST_CLIENT)) {
    console.error('[deploy] ERROR: dist/client not found.');
    process.exit(1);
  }

  // Copy everything from dist/client to public/
  const items = readdirSync(DIST_CLIENT);
  for (const item of items) {
    const src = join(DIST_CLIENT, item);
    const dest = join(PUBLIC_DIR, item);

    // If it's a file in the root of dist/client, we copy it (e.g. index.html, 404.html)
    // If it's the assets folder, we merge it
    try {
      copyRecursiveSync(src, dest);
    } catch (e) {
      console.warn(`[deploy] Warning: Could not copy ${item}:`, e.message);
    }
  }

  console.log('[deploy] SUCCESS! public/ is now the deployment root.');
}

prepare().catch(err => {
  console.error('[deploy] FATAL ERROR:', err);
  process.exit(1);
});
