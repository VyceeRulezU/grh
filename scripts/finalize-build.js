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

  console.log('Finalizing build for GitHub Pages...');

  // Move files from dist/client up to dist/ root (required for gh-pages deploy)
  fs.readdirSync(clientPath).forEach(file => {
    const src = path.join(clientPath, file);
    const dest = path.join(distPath, file);

    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  });

  // Create 404.html fallback for GitHub Pages SPA routing
  const indexInDist = path.join(distPath, 'index.html');
  if (fs.existsSync(indexInDist)) {
    console.log('Creating 404.html fallback for GitHub Pages...');
    fs.copyFileSync(indexInDist, path.join(distPath, '404.html'));
  }

  console.log('Build finalized: dist/ is ready for deployment.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
