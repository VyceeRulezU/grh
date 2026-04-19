/**
 * scripts/vercel-output.mjs
 * 
 * Implements Vercel Build Output API (v3).
 * https://vercel.com/docs/build-output-api/v3
 */
import { cpSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const CLIENT_DIST = 'dist/client';
const VERCEL_OUTPUT = '.vercel/output';
const VERCEL_STATIC = join(VERCEL_OUTPUT, 'static');
const VERCEL_CONFIG = join(VERCEL_OUTPUT, 'config.json');

async function main() {
  console.log('[vercel-output] Starting Build Output API preparation...');

  // 1. Sanity check
  if (!existsSync(CLIENT_DIST)) {
    console.error(`[vercel-output] ERROR: ${CLIENT_DIST} not found. Did the build fail?`);
    process.exit(1);
  }

  // 2. Clean and create .vercel/output structure
  if (existsSync(VERCEL_OUTPUT)) {
    console.log(`[vercel-output] Cleaning existing ${VERCEL_OUTPUT}...`);
    rmSync(VERCEL_OUTPUT, { recursive: true, force: true });
  }
  mkdirSync(VERCEL_STATIC, { recursive: true });

  // 3. Move static files from dist/client to .vercel/output/static
  console.log(`[vercel-output] Moving files from ${CLIENT_DIST} to ${VERCEL_STATIC}...`);
  cpSync(CLIENT_DIST, VERCEL_STATIC, { recursive: true });

  // 4. Generate config.json
  const config = {
    version: 3,
    routes: [
      {
        handle: 'filesystem'
      },
      {
        src: '/assets/(.*)',
        headers: {
          'cache-control': 'public, max-age=31536000, immutable'
        },
        continue: true
      },
      {
        src: '/(.*)',
        dest: '/index.html'
      }
    ]
  };

  writeFileSync(VERCEL_CONFIG, JSON.stringify(config, null, 2));
  console.log(`[vercel-output] Created ${VERCEL_CONFIG}`);

  console.log('[vercel-output] Build Output API preparation complete! ✅');
}

main().catch(err => {
  console.error('[vercel-output] FATAL ERROR:', err);
  process.exit(1);
});
