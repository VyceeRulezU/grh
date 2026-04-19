import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.resolve(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const clientPath = path.join(distPath, 'client');

// Vercel output paths
const vercelOutputDir = path.join(rootPath, '.vercel', 'output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');
const vercelConfigPath = path.join(vercelOutputDir, 'config.json');

async function fixBuild() {
  console.log('\n--- STARTING BUILD FINALIZATION ---');
  console.log('Root path:', rootPath);
  console.log('Dist path:', distPath);
  console.log('Client path:', clientPath);

  if (!fs.existsSync(clientPath)) {
    console.error('CRITICAL ERROR: dist/client not found. Vite build failed or output directory mismatch.');
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(clientPath);
    console.log(`Found ${files.length} files/folders in dist/client to process.\n`);

    files.forEach(file => {
      const src = path.join(clientPath, file);
      const dest = path.join(distPath, file);

      try {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          console.log(`- Copying directory: ${file} ...`);
          fs.cpSync(src, dest, { recursive: true, force: true });
        } else {
          console.log(`- Copying file: ${file} (${stat.size} bytes) ...`);
          fs.copyFileSync(src, dest);
        }
      } catch (err) {
        console.error(`  ! Error processing ${file}:`, err.message);
        throw err;
      }
    });

    // Verification step
    const indexInDist = path.join(distPath, 'index.html');
    if (fs.existsSync(indexInDist)) {
      console.log('\nSUCCESS: index.html found at the dist root.');
    } else {
      console.error('\nCRITICAL ERROR: index.html was NOT found at the dist root after copy.');
      process.exit(1);
    }

    // Create 404.html fallback for GitHub Pages SPA routing
    console.log('Creating 404.html fallback from index.html...');
    fs.copyFileSync(indexInDist, path.join(distPath, '404.html'));

    // --- Vercel Build Output API ---
    console.log('\n--- GENERATING VERCEL BUILD OUTPUT API ---');
    
    if (fs.existsSync(vercelOutputDir)) {
      try {
        fs.rmSync(vercelOutputDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
      } catch (e) {
        console.warn('Warning: Could not completely remove .vercel/output. Will overwrite existing files.', e.message);
      }
    }
    fs.mkdirSync(vercelStaticDir, { recursive: true });

    console.log('Copying finalized dist/ contents to .vercel/output/static/ ...');
    fs.cpSync(distPath, vercelStaticDir, { recursive: true });

    // Create Vercel config.json for SPA fallback (Build Output API routing)
    const config = {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' }
      ]
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
    console.log('Vercel config.json generated successfully.');

    console.log('\n--- BUILD FINALIZATION COMPLETE ---\n');

  } catch (globalErr) {
    console.error('\nCRITICAL GLOBAL ERROR IN FINALIZATION:', globalErr);
    process.exit(1);
  }
}

fixBuild();
