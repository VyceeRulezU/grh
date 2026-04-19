import { cpSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const clientDir = join('dist', 'client');
const serverDir = join('dist', 'server');
const rootDir = 'dist';

if (!existsSync(clientDir)) {
  console.error('[postbuild] dist/client not found. Build may have failed.');
  process.exit(1);
}

console.log(`[postbuild] Flattening ${clientDir} directly to ${rootDir}`);

// Copy everything from dist/client into dist
cpSync(clientDir, rootDir, { recursive: true, force: true });

// Clean up the empty client directory and server directory (since we only deploy static)
rmSync(clientDir, { recursive: true, force: true });
if (existsSync(serverDir)) {
  rmSync(serverDir, { recursive: true, force: true });
}

console.log('[postbuild] Done. dist/ contains the final flattened build.');
