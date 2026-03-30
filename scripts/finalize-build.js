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

  console.log('Finalizing build for Vercel (clean root elevation)...');

  const tempPath = path.join(rootPath, 'dist_temp');
  
  // 1. Move dist/client to a temporary location
  if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true });
  fs.renameSync(clientPath, tempPath);

  // 2. Clean the dist directory (remove everything except the 'server' folder if it exists, though we mostly want static)
  fs.readdirSync(distPath).forEach(file => {
    const p = path.join(distPath, file);
    // Be careful not to delete things we just moved or directories we might need
    try {
      if (fs.lstatSync(p).isDirectory()) {
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        fs.unlinkSync(p);
      }
    } catch (e) {
      // Ignore errors for files that might have been moved already
    }
  });

  // 3. Move EVERYTHING from tempPath back into dist root
  fs.readdirSync(tempPath).forEach(file => {
    fs.renameSync(path.join(tempPath, file), path.join(distPath, file));
  });

  // 4. Cleanup
  fs.rmSync(tempPath, { recursive: true, force: true });

  console.log('Build finalized: dist directory is now a clean static site root.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
