/**
 * vercel-postbuild.mjs
 *
 * Uses the Vercel Build Output API (v3) to guarantee correct static file serving.
 * Creates .vercel/output/static/ with all pre-rendered HTML and assets,
 * and .vercel/output/config.json with routing rules.
 *
 * Docs: https://vercel.com/docs/build-output-api/v3
 */
import { readdirSync, cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const clientDir = 'dist/client';
const staticDir = '.vercel/output/static';
const configPath = '.vercel/output/config.json';

// --- Sanity check ---
if (!existsSync(clientDir)) {
  console.error(`[postbuild] ❌ ERROR: "${clientDir}" was not created. Did the Vike prerender succeed?`);
  process.exit(1);
}

// --- 1. Promote dist/client → dist/ (for local "vite preview") ---
console.log(`[postbuild] Promoting ${clientDir}/ → dist/ (local preview)`);
for (const entry of readdirSync(clientDir)) {
  if (entry === 'client') continue;
  cpSync(join(clientDir, entry), join('dist', entry), { recursive: true, force: true });
}

// --- 2. Build .vercel/output/static/ (Vercel Build Output API) ---
mkdirSync(staticDir, { recursive: true });
console.log(`[postbuild] Copying ${clientDir}/ → ${staticDir}/`);
for (const entry of readdirSync(clientDir)) {
  const src = join(clientDir, entry);
  const dst = join(staticDir, entry);
  console.log(`  ✓ ${entry}`);
  cpSync(src, dst, { recursive: true, force: true });
}

// --- 3. Write Vercel output config ---
const config = {
  version: 3,
  routes: [
    // Serve pre-rendered pages directly with clean URLs
    { handle: 'filesystem' },
    // SPA fallback: any unmatched path → index.html
    { src: '/(.+)', dest: '/index.html', status: 200 }
  ]
};
writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`[postbuild] Written ${configPath}`);

console.log('[postbuild] ✅ Done — .vercel/output/static/ is ready for Vercel Build Output API.');
