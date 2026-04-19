/**
 * vercel-postbuild.mjs
 * Promotes the contents of dist/client/ (Vike's prerender output)
 * up into dist/, which is where Vercel's Vite preset looks for static files.
 */
import { readdirSync, cpSync, existsSync } from 'fs';
import { join } from 'path';

const clientDir = 'dist/client';
const outDir    = 'dist';

if (!existsSync(clientDir)) {
  console.error(`[postbuild] ERROR: ${clientDir} does not exist. Did the Vike build succeed?`);
  process.exit(1);
}

console.log(`[postbuild] Promoting ${clientDir}/ → ${outDir}/`);

for (const entry of readdirSync(clientDir)) {
  if (entry === 'client') continue; // avoid recursion if already nested
  const src = join(clientDir, entry);
  const dst = join(outDir, entry);
  console.log(`  ${entry}`);
  cpSync(src, dst, { recursive: true, force: true });
}

console.log('[postbuild] ✅ Done — dist/ now contains all pre-rendered files.');
