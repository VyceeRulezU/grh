import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const clientPath = path.join(distPath, 'client');
const outStaticPath = path.join(rootPath, 'out-static');

// Vercel output paths
const vercelOutputDir = path.join(rootPath, '.vercel', 'output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');
const vercelConfigPath = path.join(vercelOutputDir, 'config.json');

async function fixBuild() {
  if (!fs.existsSync(clientPath)) {
    console.error('dist/client not found. Build likely failed.');
    process.exit(1);
  }

  console.log('Finalizing build for GitHub Pages and Vercel...');

  // Clean out-static before copying
  if (fs.existsSync(outStaticPath)) {
    fs.rmSync(outStaticPath, { recursive: true, force: true });
  }
  fs.mkdirSync(outStaticPath, { recursive: true });

  // Move files from dist/client to out-static root (avoids Vercel dist-detection)
  fs.readdirSync(clientPath).forEach(file => {
    const src = path.join(clientPath, file);
    const dest = path.join(outStaticPath, file);

    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  });

  // Create 404.html fallback for GitHub Pages SPA routing
  const indexInStatic = path.join(outStaticPath, 'index.html');
  if (fs.existsSync(indexInStatic)) {
    console.log('Creating 404.html fallback...');
    fs.copyFileSync(indexInStatic, path.join(outStaticPath, '404.html'));
  }

  // --- Vercel Build Output API ---
  console.log('Generating Vercel Build Output API configuration...');
  
  if (fs.existsSync(vercelOutputDir)) {
    try {
      fs.rmSync(vercelOutputDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (e) {
      console.warn('Warning: Could not completely remove .vercel/output. Will overwrite existing files.', e.message);
    }
  }
  fs.mkdirSync(vercelStaticDir, { recursive: true });

  // Copy out-static/ to .vercel/output/static/
  fs.cpSync(outStaticPath, vercelStaticDir, { recursive: true });

  // Ensure 404 is also in Vercel static output, though fallback below will handle it
  if (fs.existsSync(indexInStatic)) {
    fs.copyFileSync(indexInStatic, path.join(vercelStaticDir, '404.html'));
  }

  // Create Vercel config.json for SPA fallback (Build Output API routing)
  const vercelConfig = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };

  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

  console.log('Build finalized: dist/ and .vercel/output are ready.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
