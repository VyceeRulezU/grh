import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.resolve(__dirname, '..');
const originalDistPath = path.join(rootPath, 'dist');
const tempDistPath = path.join(rootPath, 'dist-vike');
const finalDistPath = path.join(rootPath, 'dist');

// Vercel output paths
const vercelOutputDir = path.join(rootPath, '.vercel', 'output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');
const vercelConfigPath = path.join(vercelOutputDir, 'config.json');

async function fixBuild() {
  console.log('\n--- STARTING CLEAN-MOVE BUILD FINALIZATION ---');
  
  if (!fs.existsSync(originalDistPath)) {
    console.error('CRITICAL ERROR: dist folder not found. Vite build failed.');
    process.exit(1);
  }

  try {
    // 1. Move original dist to temporary folder
    console.log(`Moving original dist/ to dist-vike/ ...`);
    if (fs.existsSync(tempDistPath)) {
      fs.rmSync(tempDistPath, { recursive: true, force: true });
    }
    fs.renameSync(originalDistPath, tempDistPath);

    // 2. Create a brand new, clean dist folder
    console.log(`Creating fresh, clean dist/ folder ...`);
    fs.mkdirSync(finalDistPath, { recursive: true });

    // 3. Define the path to pre-rendered client files
    const clientPath = path.join(tempDistPath, 'client');
    if (!fs.existsSync(clientPath)) {
      console.error('CRITICAL ERROR: dist-vike/client not found. Pre-rendering might have failed.');
      process.exit(1);
    }

    const files = fs.readdirSync(clientPath);
    console.log(`Copying ${files.length} pre-rendered items to fresh dist/ root ...`);

    files.forEach(file => {
      const src = path.join(clientPath, file);
      const dest = path.join(finalDistPath, file);

      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        console.log(`- Copying directory: ${file}`);
        fs.cpSync(src, dest, { recursive: true, force: true });
      } else {
        console.log(`- Copying file: ${file}`);
        fs.copyFileSync(src, dest);
      }
    });

    // 4. Verification
    const indexInDist = path.join(finalDistPath, 'index.html');
    if (fs.existsSync(indexInDist)) {
      console.log('\nSUCCESS: Verified index.html at fresh dist root.');
    } else {
      console.error('\nCRITICAL ERROR: index.html missing from fresh dist root!');
      process.exit(1);
    }

    // 5. Fallbacks and Vercel Config
    console.log('Generating 404.html fallback...');
    fs.copyFileSync(indexInDist, path.join(finalDistPath, '404.html'));

    console.log('\n--- GENERATING VERCEL BUILD OUTPUT API ---');
    if (fs.existsSync(vercelOutputDir)) {
      fs.rmSync(vercelOutputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(vercelStaticDir, { recursive: true });
    fs.cpSync(finalDistPath, vercelStaticDir, { recursive: true });

    const config = {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' }
      ]
    };
    fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
    
    console.log('\n--- CLEAN-MOVE FINALIZATION COMPLETE ---\n');

  } catch (err) {
    console.error('\nCRITICAL BUILD ERROR:', err);
    process.exit(1);
  }
}

fixBuild();
