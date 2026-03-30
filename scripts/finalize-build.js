import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const clientPath = path.join(distPath, 'client');

async function fixBuild() {
  if (!fs.existsSync(clientPath)) {
    console.error('dist/client not found. Build likely failed.');
    process.exit(1);
  }

  console.log('Finalizing build for Vercel (clean root elevation v2)...');

  const tempPath = path.join(rootPath, 'dist_temp_final');
  
  // 1. Move dist/client to a temporary location outside of dist
  if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });
  fs.renameSync(clientPath, tempPath);

  // 2. Wipe the dist directory completely to ensure no stale files or folders (like the now-empty client/) remain
  if (fs.existsSync(distPath)) fs.rmSync(distPath, { recursive: true, force: true });
  fs.mkdirSync(distPath);

  // 3. Move EVERYTHING from tempPath back into dist root
  fs.readdirSync(tempPath).forEach(file => {
    fs.renameSync(path.join(tempPath, file), path.join(distPath, file));
  });

  // 4. Cleanup
  fs.rmSync(tempPath, { recursive: true, force: true });

  console.log('Build finalized: dist directory is now a CLEAN static site root for Vercel.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
