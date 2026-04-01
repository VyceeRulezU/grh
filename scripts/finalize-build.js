import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const clientPath = path.join(distPath, 'client');
const vercelOutputPath = path.join(rootPath, '.vercel', 'output');
const vercelStaticPath = path.join(vercelOutputPath, 'static');

async function fixBuild() {
  if (!fs.existsSync(clientPath)) {
    console.error('dist/client not found. Build likely failed.');
    process.exit(1);
  }

  console.log('Finalizing build for Vercel & GitHub Pages...');

  // 1. Setup .vercel/output/static
  if (fs.existsSync(vercelOutputPath)) fs.rmSync(vercelOutputPath, { recursive: true, force: true });
  fs.mkdirSync(vercelStaticPath, { recursive: true });

  // 2. Process files from dist/client
  fs.readdirSync(clientPath).forEach(file => {
    const src = path.join(clientPath, file);
    const vDest = path.join(vercelStaticPath, file);
    const dDest = path.join(distPath, file); // Move back to dist root for GH Pages
    
    // Copy to Vercel output
    fs.copyFileSync(src, vDest);
    
    // Move to dist root (for GH Pages compatibility)
    fs.renameSync(src, dDest);
  });

  // 3. Create 404.html fallback for GitHub Pages (copy of index.html)
  const indexInDist = path.join(distPath, 'index.html');
  if (fs.existsSync(indexInDist)) {
    console.log('Creating 404.html fallback for GitHub Pages...');
    fs.copyFileSync(indexInDist, path.join(distPath, '404.html'));
    fs.copyFileSync(indexInDist, path.join(vercelStaticPath, '404.html'));
  }

  // 4. Create .vercel/output/config.json
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };
  fs.writeFileSync(path.join(vercelOutputPath, 'config.json'), JSON.stringify(config, null, 2));

  // Cleanup empty dist/client
  if (fs.readdirSync(clientPath).length === 0) {
    fs.rmSync(clientPath, { recursive: true, force: true });
  }

  console.log('Build finalized: dist and .vercel/output are ready.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
